$(function () {
    console.log(depts);
    const colors = ['#7f0000','#cc0000','#ff4444','#ff7f7f','#ffb2b2','#995100','#cc6c00','#ff8800','#ffbb33','#ffe564',
        '#2c4c00','#436500','#669900','#99cc00','#d2fe4c','#3c1451','#6b238e','#9933cc','#aa66cc','#bc93d1',
        '#004c66','#007299','#0099cc','#33b5e5','#8ed5f0','#660033','#b20058','#e50072','#ff3298','#ff7fbf'];

    $.getJSON('data/observations_repere.json', function(data) {
        let series = [];
        let dept_ajoutes = [];
        let color_idx = 0;
        for ( var d in data ) {
            const dep = data[d]['com'].substr(0,2);
            const dep_idx = dept_ajoutes.indexOf(dep);
            if (  dep_idx === - 1 ) {
                const dep_data = depts.find(x => x.code === dep);
                series.push({
                    name: dep_data['nom'],
                    id: dep, 
                    data: [{x:data[d]['x'], y:data[d]['y'], marker: {radius:data[d]['nb']/1000}}], 
                    marker: {
                        color: color_idx
                    }
                });

                dept_ajoutes.push(dep),
                color_idx++;
            } else {
                series[dep_idx]['data'].push({x:data[d]['x'], y:data[d]['y'], marker: {radius:data[d]['nb_especes_rares']}});
            }
            
        }
        console.log(series);


        let chart_observations_repere = Highcharts.chart('chart_observations_repere', {
            chart: {
                type: 'scatter',
                zooming: {
                    type: 'xy'
                }
            },
            title: {
                text: 'Olympics athletes by height and weight'
            },
            subtitle: {
                text:
              'Source: <a href="https://www.theguardian.com/sport/datablog/2012/aug/07/olympics-2012-athletes-age-weight-height">The Guardian</a>'
            },
            xAxis: {
                title: {
                    text: 'Height'
                },
                labels: {
                    format: '{value}'
                },
                startOnTick: true,
                endOnTick: true,
                showLastLabel: true
            },
            yAxis: {
                title: {
                    text: 'Weight'
                },
                labels: {
                    format: '{value}'
                }
            },
            legend: {
                enabled: true
            },
            plotOptions: {
                scatter: {
                    marker: {
                        radius: 2.5,
                        symbol: 'circle',
                        states: {
                            hover: {
                                enabled: true,
                                lineColor: 'rgb(100,100,100)'
                            }
                        }
                    },
                    states: {
                        hover: {
                            marker: {
                                enabled: false
                            }
                        }
                    },
                    jitter: {
                        x: 0.005
                    }
                }
            },
            tooltip: {
                pointFormat: 'Height: {point.x} m <br/> Weight: {point.y} kg'
            },
            series
        });




















    });


});

