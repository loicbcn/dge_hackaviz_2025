$(function() {
    const colors = {
        13: '#50341cff',
        20: '#f1cf0eff',
        29: '#b8b8b8ff',
    }
    $.getJSON('data/cuicui.json', function(data) {
    let series = [];     
    for (var i=0; i<data.length; i++) {
        if ( series[data[i]['obsid']] === undefined ) {
            series[data[i]['obsid']] = [];
            series[data[i]['obsid']].push({
                name: 'observateur '+ data[i]['obsid'],
                color: colors[data[i]['obsid']],    
                data: [data[i]['nb']],
                nbesp: [data[i]['nbesp']],
                nbesprar: [data[i]['nbesprar']],
            });
        } else {
            series[data[i]['obsid']][0].data.push(data[i]['nb']);
            series[data[i]['obsid']][0].nbesp.push(data[i]['nbesp']);
            series[data[i]['obsid']][0].nbesprar.push(data[i]['nbesprar']);
        }
    }
    
    for(var id in series) {
        drawCuicui('gcuicui_'+id, series[id]);
    }

})



});

function drawCuicui(id_div, serie) {

    Highcharts.chart(id_div, {
        chart: {
            type: 'column',
            height:200,
            backgroundColor:undefined
            //margin: [10,0,20,50]
        },
        title: {
            text: undefined,
        },
        credits: {
            enabled:false
        },
        xAxis: {
            categories: [2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022],
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Nombre d\'observations',
            },
            max:3000
        },
        tooltip: {
            formatter: function () {
                return `Année ${this.key}: <br>
                Nombre d'observations: <b>${this.y}</b><br>
                Nombre d'espèces observées: <b>${this.series.options.nbesp[this.point.index]}</b><br>
                Nombre d'espèces rares observées: <b>${this.series.options.nbesprar[this.point.index]}</b>`;
                //  
                //console.log(this.series.options.nbesp[this.x]);
            }
            //pointFormat: '<span style="color:{series.color}">&#9632</span>&nbsp;{series.name}: <b>{point.y}</b>',
            //shared: true
        },
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
            }
        },
        legend:{
            enabled:false,
        },
        series: serie
    });



}