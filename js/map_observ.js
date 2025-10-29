$(function() {
    const zoom = 7.6;
    const color_nb_especes = ['#f2f0f7',
'#cbc9e2',
'#9e9ac8',
'#756bb1',
'#54278f'];

    function createDeptTextStyle(feature, fill, stroke, txt) {
        return new ol.style.Text({
          font: '12px "Arial black",sans-serif',
          text: txt,
          textAlign:'center',
          // offsetX:8,
          fill: new ol.style.Fill({color:fill}),
          stroke: new ol.style.Stroke({color:stroke, width:2}),
          overflow: false,
        });
    };


    /* ******* Dept ****** */ 
    function deptStyleFunction(feature, res) {

        let text = '';
        //if ( res > 250) {
        text = createDeptTextStyle(feature,'#313131ff', '#fff', feature.getProperties().nom);
        //}
        const color = 'rgba(200,200,200,1)';
        
        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: color,
                width: 2
              }),
              fill: new ol.style.Fill({
                color: "transparent"
              }),
              text:text
        });
    }

    /* ******* Grille ****** */
    function grilleStyleFunction(feature, res) {
        const color = 'rgba(228, 169, 169, 1)';
        let fill_color = 'transparent'
        if(feature.getProperties().nb == 0) {
            fill_color = 'rgba(112, 112, 112, 0.1)'
        } else if (feature.getProperties().nb > 0 && feature.getProperties().occsol == 'u') {
            fill_color = 'rgba(255,0,0,0.2)';
        }
        else if (feature.getProperties().nb > 0 && feature.getProperties().occsol == 'a') {
            fill_color = 'rgba(255,255,0,0.2)';
        }
        else if (feature.getProperties().nb > 0 && feature.getProperties().occsol == 'n') {
            fill_color = 'rgba(0,255,0,0.2)';
        }
        else if (feature.getProperties().nb > 0 && feature.getProperties().occsol == 'h') {
            fill_color = 'rgba(0,0,255,0.2)';
        }           
        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: color,
                width: 0.5
              }),
              fill: new ol.style.Fill({
                color: fill_color
              })
        });
    }

    /* ******* Grille points ****** */
    function grillepointsStyleFunction(feature, res) {
        const nb = feature.getProperties().nb;
        const radius = nb==0 ? 0: 1 + feature.getProperties().nb/1000;

        let fill_color = 'rgba(84,39,143,0.6)';
        let stroke_color = 'transparent';
        const nbesp = feature.getProperties().nbesp;

        if (nbesp >=50) {
            fill_color = 'transparent';
            stroke_color = 'red';
        }
        const fill = new ol.style.Fill({
                color: fill_color,
              });
        const stroke = new ol.style.Stroke({
                color: stroke_color,
                width: 1
              });
        return new ol.style.Style({
                image: new ol.style.Circle({
                    radius: radius,
                    fill: fill,
                    stroke: stroke
                }),
                //geometry: feature.getGeometry().getInteriorPoint()
                });
    }
    

    const dept_layer = new ol.layer.Vector({
        'title':'Départements',
        allwaysOnTop : false,
        source: new ol.source.Vector({
        url: 'data/departements_3857.geojson',
        format: new ol.format.GeoJSON(),
        }),
        style: deptStyleFunction
    });

    const grille_layer = new ol.layer.Vector({
        'title':'Grille',
        allwaysOnTop : false,
        source: new ol.source.Vector({
        url: 'data/grille_10000_3857_data_ocsol.geojson',
        format: new ol.format.GeoJSON(),
        }),
        style: grilleStyleFunction
    });

    const grille_point_layer = new ol.layer.Vector({
        'title':'Points de grille',
        allwaysOnTop : false,
        source: new ol.source.Vector({
        url: 'data/centr_grille_10000_3857_data.geojson',
        format: new ol.format.GeoJSON(),
        }),
        style: grillepointsStyleFunction
    });

    const plan_ign = new ol.layer.Image({
            title:'Plan IGN',
            visible: false,
            opacity:0.5,
            source: new ol.source.ImageWMS({
                url: 'https://data.geopf.fr/wms-r/',
                params: {LAYERS: 'GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2', FORMAT:'image/jpeg'}
            }), 
        })

    let map = new ol.Map({
        interactions: ol.interaction.defaults({mouseWheelZoom:false}),
        controls: ol.control.defaults().extend([
            new ol.control.FullScreen()
        ]),
        //overlays: [overlay],
        target: 'map_observ',
        view: new ol.View({
            zoom: zoom,
            center: [624505.815, 6243675.333], //[130742.2,5358235.1],
            maxZoom: 15,
            minZoom: 7
        }),
        layers: [plan_ign, dept_layer, grille_layer, grille_point_layer],//, communes_layer, epci_layer, scot_layer]
    });

    const mouseWheelInt = new ol.interaction.MouseWheelZoom();
    map.addInteraction(mouseWheelInt);

    map.on('wheel', function(evt) {
        mouseWheelInt.setActive(ol.events.condition.shiftKeyOnly(evt));
    });



    map.addControl(new ol.control.LayerSwitcher({ trash: false, extent:true, collapsed: false, reordering:false }));
    // Define a new legend
    var legend = new ol.legend.Legend({ 
        style: grillepointsStyleFunction,
        margin: 0,
        size: [30, 16],
        textStyle: new ol.style.Text({
          font: 'bold 12px "Arial",sans-serif'
        })
    });
    map.addControl(new ol.control.Legend({ 
        collapsible: true,
        collapsed: false,
        legend: legend
    }));

    // Add empty row to 
    legend.addItem({});
    legend.addItem({title:'Points', height: 20 });
    legend.addItem({ title:' Plus de 50 espèces\n observées', properties: { nb:10000, nbesp: 51 }, typeGeom: 'Point', height: 38 });
    legend.addItem({ title:' 10 000 observations', properties: { nb: 10000 }, typeGeom: 'Point', height: 18 });
    legend.addItem({ title:' 2000 observations', properties: { nb: 2000 }, typeGeom: 'Point', height: 18 });
    legend.addItem({ title:' 1 observation', properties: { nb: 1 }, typeGeom: 'Point', height: 18 });
    legend.addItem({height: 18 });
    legend.addItem({title:'Grille', height: 30 });
    legend.addItem({title:' Urbain majoritaire', properties: { nb: 100, occsol:'u' }, typeGeom: 'MultiPolygon', style: grilleStyleFunction, height: 18 });
    legend.addItem({height: 5 });
    legend.addItem({title:' Agricole majoritaire', properties: { nb: 100, occsol:'a' }, typeGeom: 'MultiPolygon', style: grilleStyleFunction, height: 18 });
    legend.addItem({height: 5 });
    legend.addItem({title:' Naturel majoritaire', properties: { nb: 100, occsol:'n' }, typeGeom: 'MultiPolygon', style: grilleStyleFunction, height: 18 });
    legend.addItem({height: 5 });
    legend.addItem({title:' Aucune observation', properties: { nb: 0 }, typeGeom: 'MultiPolygon', style: grilleStyleFunction,height: 18 });

  // Display the style on select
  var popup = new ol.Overlay.Popup({ 
    popupClass: 'tooltipss', 
    positioning: 'top-auto',
    offsetBox: [-10,0,15,0]
  });
  map.addOverlay(popup);
  var hover = new ol.interaction.Hover();
  map.addInteraction(hover);
  hover.on('leave', function(e) {
    popup.hide();
  });
  hover.on('hover', function(e) {
    if(e.layer.get('title') == 'Grille'){
    popup.show(e.coordinate, 
`<table class="table table-sm table-striped table-bordered" style="font-size:12px">
	<tr><th>Observations</th><td class="text-end"><span class="badge text-bg-info">${e.feature.get('nb')}</span></td></tr>	
	<tr><th>Observateurs</th><td class="text-end"><span class="badge text-bg-info">${e.feature.get('nbobserver')}</span></td></tr>	
	<tr><th>Espèces observées</th><td class="text-end"><span class="badge text-bg-info">${e.feature.get('nbesp')}</span></td></tr>
	<tr><th>Observations d'espèces rares</th><td class="text-end"><span class="badge text-bg-info">${e.feature.get('nbrar')}</span></td></tr>	
	<tr><th>Nombre d'espèces rares</th><td class="text-end"><span class="badge text-bg-info">${e.feature.get('nbesprar')}</span></td></tr>	
	<tr><th>Département</th><td class="text-end"><span class="badge text-bg-info">${e.feature.get('dep')}</span></td></tr>
</table>`)
    }
  });
    
})
