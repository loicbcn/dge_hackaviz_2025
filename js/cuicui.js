$(function() {
    const colors = {
        13: '#50341cff',
        20: '#f1cf0eff',
        29: '#b8b8b8ff',
    };
    const imgs = {
        13: 'imgs/note_bronze.png',
        20: 'imgs/note_or.png',
        29: 'imgs/note_argent.png',
    };
    $.getJSON('data/cuicui.json', function(data) {
        $.getJSON('data/dept_annees_mois_stats.json', function(dmonth) {

            let series = [];     
            // série annuelle - Nombre d'observations
            for (var i=0; i<data.length; i++) {
                const the_date = Date.parse(data[i]['annee'] + '-01-01');
                if ( series[data[i]['obsid']] === undefined ) {
                    series[data[i]['obsid']] = [];
                    series[data[i]['obsid']].push({
                        title: 'Nombre d\'observations',
                        name: 'observateur '+ data[i]['obsid'],
                        color: colors[data[i]['obsid']], 
                        img: imgs[data[i]['obsid']],   
                        data: [{x:the_date, y:data[i]['nb']}],
                        nbesp: [data[i]['nbesp']],
                        nbesprar: [data[i]['nbesprar']],
                    });
                } else {
                    series[data[i]['obsid']][0].data.push({x:the_date, y:data[i]['nb']});
                    series[data[i]['obsid']][0].nbesp.push(data[i]['nbesp']);
                    series[data[i]['obsid']][0].nbesprar.push(data[i]['nbesprar']);
                }
            }

            // Série Mensuelle - Nombre d'espèces découvertes
            for (var j=0; j<dmonth.length; j++) {
                const the_datem = Date.parse(dmonth[j]['annee'] + '-' + dmonth[j]['mois'] + '-31');
                if ( series[dmonth[j]['oid']][1] === undefined ) {
                    series[dmonth[j]['oid']].push({
                        name: 'observateur '+ dmonth[j]['oid'],
                        color: colors[dmonth[j]['oid']],    
                        data: [{x:the_datem, y:dmonth[j]['cumul_especes']}],
                        especes_mois: [dmonth[i]['especes_mois']],
                        observations_mois: [dmonth[i]['observations_mois']],
                        cumul_observations: [dmonth[i]['cumul_observations']],
                    });
                } else {
                    series[dmonth[j]['oid']][1].data.push({x:the_datem, y:dmonth[j]['cumul_especes']});
                    series[dmonth[j]['oid']][1].especes_mois.push(dmonth[j]['especes_mois']);
                    series[dmonth[j]['oid']][1].observations_mois.push(dmonth[j]['observations_mois']);
                    series[dmonth[j]['oid']][1].cumul_observations.push(dmonth[j]['cumul_observations']);
                }

            }

            for(var id in series) {
                drawCuicui('gcuicui_'+id, series[id]);
            }

        });
    });
});

function drawCuicui(id_div, serie) {

    Highcharts.chart(id_div, {
        chart: {
            type: 'line',
            height:300,
            backgroundColor:undefined,
            alignTicks: false,
            margin: [50,100,80,80]
        },
        title: {
            text: 'Ecouter les oiseaux chanter',
            style: {
                fontWeight: 'bold',
                fontSize: '12px'
            }
        },
        credits: {
            enabled: true,
            text: 'Source: Observatoire des oiseaux des jardins',
            href:'https://www.oiseauxdesjardins.fr/',

        },
        xAxis: {
            //categories: [2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022],
            type: 'datetime',
            dateTimeLabelFormats: {
                year: '%Y'
            },  
            left:170,
            width:'85%'
        },
        yAxis: [{
            min: 0,
            tickInterval: 600,
            title: {
                text: 'Nombre d\'observations',
            },
            max:3000
        }, {
            min:0,
            max:50,
            opposite: true,
            gridLineWidth:0,
            title: {
                text: 'Nombre d\'espèces distinctes observées',
            }
        }],

        /*
        tooltip: {
            formatter: function () { console.log(this);
                if ( this === undefined ) {
                    return;
                }
                return `Année ${this.key}: <br>
                Nombre d'observations: <b>${this.y}</b><br>
                Nombre d'espèces observées: <b>${this.series.options.nbesp[this.point.index]}</b><br>
                Nombre d'espèces rares observées: <b>${this.series.options.nbesprar[this.point.index]}</b>`;
            },
            shared: false,
            split:false,
        },*/

        plotOptions: {
            column: {
                stacking: undefined,
                borderWidth:0,
                dataLabels: {
                    enabled: true,
                    formatter: function(){
                        return this.y === 0 ? '' : this.y;
                    }
                }
            }, line: {
                  dataLabels: {
                    enabled: true,
                    style:{
                        color: 'blue'
                    },
                    y:5,
                    formatter: function() {
                        const showval = ['2012-1-31', '2012-6-31','2014-1-31','2018-12-31','2022-12-31'];
                        let showvalms = [];
                        for ( var i=0; i<showval.length; i++ ) {
                            showvalms.push(Date.parse(showval[i]));
                        }   
                        if ( showvalms.indexOf(this.x) !== -1 ) {
                            return this.y +'🎵';
                        } else {
                            return;// this.y === 0 ? '' : this.y;
                        }
                    }
                }             
            }
        },
        legend:{
            enabled:true,
        },
        series: [
            {
                yAxis:0,
                type: 'line',
                name: 'Nombre d\'observations',
                data: serie[0].data,
                color: serie[0].color,
                lineWidth:1,
                marker:{
                    symbol: 'url('+ serie[0].img +')',
                    width:15,
                    height:30
                },
                pointWidth: 15,
                tooltip:{
                    headerFormat: 'Année {point.key: %Y}<br/>',
                                shared: true,
                }
            },{
                yAxis:1,
                name: 'Cumul d\'espèces découvertes',
                type: 'line',
                               lineWidth:1,
                data: serie[1].data,
                tooltip:{
                    headerFormat: '{point.key:%B %Y}<br/>',
                                shared: true,
                }
            }
        ]
    });



}