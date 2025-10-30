# Requêtes de préparation des données. (duckdb)

Variables, extension spatiale
```sql
load spatial;

set variable departements = 'C:\projets\dge_hackaviz2025\data\departements.parquet';
set variable communes = 'C:\projets\dge_hackaviz2025\data\communes.parquet';
set variable communes_attrib = 'C:\projets\dge_hackaviz2025\data\communes_attrib.parquet';
set variable oiseaux = 'C:\projets\dge_hackaviz2025\data\oiseaux.parquet';
set variable grille = 'C:\projets\dge_hackaviz2025\data\created\grille_10000_dept.gpkg';
set variable grille_3857 = 'C:\uwamp\www\dge_hackaviz2025\data\grille_10000_3857_data.geojson';
set variable departements = 'C:\projets\dge_hackaviz2025\data\departements.parquet';
```


Migrations
```sql
copy(
    with mois as (
        select "range" from range(1,13) 
    ),  especes_mois as(
        select distinct cdnom, nomvernaculaire, range mois
        from read_parquet(getvariable('oiseaux')) o
        cross join mois
        order by nomvernaculaire, mois
    ), effectifs_tot as(
        select cdnom, max(nomvernaculaire) espece, count(*) nbtot
        from read_parquet(getvariable('oiseaux')) o
        group by cdnom
    )
    select em.cdnom, max(em.nomvernaculaire) espece, em.mois, count(o.cdnom) nb, 
    max(e.nbtot) nbtot, count(o.cdnom) / max(e.nbtot) tx, 
    count(distinct obsid) nbobserver, count(distinct departement) nbdep
    from especes_mois em
    left join read_parquet(getvariable('oiseaux')) o 
            on o.cdnom = em.cdnom and month(o.dateobservation) = em.mois
    left join effectifs_tot e on e.cdnom = em.cdnom
    group by em.cdnom, mois
    order by espece, mois
) to 'C:/uwamp/www/dge_hackaviz2025/data/migrations.json' (ARRAY)
```

comptes
```sql
select count(*)nb, count(distinct obsid) nbobs, min(dateobservation), max(dateobservation), sum( case when cdnom = 3590 then 1 else 0 end) nbhuppefasciee
from read_parquet(getvariable('oiseaux')) o 
```

Radars
```sql
select departement, count(*) nb, count(distinct obsid) nbobserver, count(distinct cdnom) nbsepeces, 
sum(case when cdnom in(3590, 4137, 4319, 3448, 3630) then 1 else 0 end) nb_rare, 
count(distinct cdnom) FILTER (cdnom in(3590, 4137, 4319, 3448, 3630)) AS  nb_especes_rares
 from read_parquet(getvariable('oiseaux')) o 
group by departement
order by departement 
```

Données d'observation dans un repère
```sql
copy(
with repere as(
select max(st_x(geometiquette))-min(st_x(geometiquette)) decx, max(st_y(geometiquette))-min(st_y(geometiquette)) decy, 
min(st_x(geometiquette)) minx, min(st_y(geometiquette)) miny
-- st_x(st_transform(geometiquette,'EPSG:4326','EPSG:2154')), 
from read_parquet(getvariable('oiseaux')) o 
)
select * exclude(geometiquette) from (
select geometiquette, round(max((st_x(geometiquette)-minx)*1000/ decx),2) x, round(max((st_y(geometiquette)-miny)*1000/ decy),2) y, 
 max(codeinseecommune) com,
count(*) nb, count(distinct espece) nbespece,
count(distinct cdnom) FILTER (cdnom in(3590, 4137, 4319, 3448, 3630)) AS nb_especes_rares 
from read_parquet(getvariable('oiseaux')) o, repere r
group by geometiquette
order by nb desc
)
) to 'C:\UwAmp\www\dge_hackaviz2025\data\observations_repere.json' (ARRAY)
```

Grille, centroïdes et données
```sql
copy(
with oiseaux as(
select st_transform(geometiquette, 'EPSG:4326','EPSG:2154',true) geom, * exclude(geometiquette)
 from read_parquet(getvariable('oiseaux')) o 
), grille_stats as(
	select max(g.geom) geom, 
	g.id, 
	max(g.code) cdep, max(g.nom) dep, 
	count(obsid) nb, 
	count(distinct obsid) nbobserver, count(distinct cdnom) nbesp, 
	cast(sum(case when cdnom in(3590, 4137, 4319, 3448, 3630) then 1 else 0 end) as integer) nbrar, 
	count(distinct cdnom) FILTER (cdnom in(3590, 4137, 4319, 3448, 3630)) AS  nbesprar
	from st_read(getvariable('grille')) g
	left join oiseaux o on st_intersects(o.geom, g.geom)
	group by g.id
	order by g.id
)
select st_centroid(st_transform(geom,'EPSG:2154','EPSG:3857',true)) geom, 
* exclude(geom)  
from grille_stats
order by id
) to 'C:\projets\dge_hackaviz2025\data\created\centr_grille_10000_3857_data.geojson' 
	WITH (FORMAT gdal, DRIVER 'geojson', LAYER_CREATION_OPTIONS 'WRITE_BBOX=YES', SRS 'EPSG:3857');
```

Ajouter l'occupation du sol à la grille
```sql
copy(
with communes as(
	select st_transform(c.geom, 'EPSG:4326','EPSG:3857',true) geom, 
	c.code, replace(urbain,',','.')::real urbain, 
	a.agricole, a.naturel, a.eau, a.humide, a.surfacetotale
	from read_parquet(getvariable('communes')) c
	inner join read_parquet(getvariable('communes_attrib')) a on a.codeinsee = c.code and a.annee = 2021
), inters as(
	select g.id, st_intersection(c.geom, g.geom), 
	st_area(st_intersection(  st_transform(c.geom, 'EPSG:3857','EPSG:2154',true), st_transform(g.geom, 'EPSG:3857','EPSG:2154',true)  ))/10000 surf_inter, 
	c.code,
	c.urbain, c.agricole, c.naturel, c.eau, c.humide,c.surfacetotale
	from st_read(getvariable(grille_3857)) g
	INNER  join communes c on st_intersects(c.geom, g.geom)
), gridoccsol as(
	select id, sum((surf_inter/surfacetotale)*urbain) urbain, sum((surf_inter/surfacetotale)*agricole) agricole, 
	sum((surf_inter/surfacetotale)*naturel) naturel, 
	sum((surf_inter/surfacetotale)*eau) eau, sum((surf_inter/surfacetotale)*humide) humide
	from inters
	group by id
), gocsol as(
	select id, 
		case when urbain > agricole and urbain > naturel and urbain > humide+eau then 'u'  
			 when agricole > urbain and agricole > naturel and agricole > humide+eau then 'a'
			 when naturel > urbain and naturel > agricole and naturel > humide+eau then 'n'
			 when humide+eau > urbain and humide+eau > agricole and humide+eau > naturel then 'h'
		else null end occsol
	from gridoccsol
	order by id
)
select g.*, o.occsol
from st_read(getvariable(grille_3857)) g
inner join gocsol o on o.id = g.id
order by g.id
) to 'C:/uwamp/www/dge_hackaviz2025/data/grille_10000_3857_data_ocsol.geojson'
	WITH (FORMAT gdal, DRIVER 'geojson', LAYER_CREATION_OPTIONS 'WRITE_BBOX=YES', SRS 'EPSG:3857');
```