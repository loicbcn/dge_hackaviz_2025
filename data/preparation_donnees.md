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