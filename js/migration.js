const round = (n, decimals = 0) =>
  Number(`${Math.round(`${n}e${decimals}`)}e-${decimals}`);
$(function () {
    $.getJSON('data/migrations.json', function(data) {

    let data_migr = [];
    let esp_traitees = [];
    let visible;
    const migrants = [3590,4137];
    const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];
    const fullmonthNames = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

    for (var d=0; d<data.length; d++) {
        visible = false;
        if(migrants.indexOf(data[d]['cdnom']) != -1) {
            visible = true;
        }
        idx_esp = esp_traitees.indexOf(data[d]['espece']);
        if(idx_esp == -1){
            esp_traitees.push(data[d]['espece']);
            idx_esp = esp_traitees.indexOf(data[d]['espece']);

            data_migr[idx_esp] = {
                name: data[d]['espece'],
                data: [round(data[d]['tx']*100,2)],
                nb:[data[d]['nb']],
                nbobserver: [data[d]['nbobserver']],
                nbdep: [data[d]['nbdep']],
                visible: visible,
                showInLegend : true
            }
        } else
        data_migr[idx_esp]['data'].push(round(data[d]['tx']*100,2));
        data_migr[idx_esp]['nb'].push(data[d]['nb']);
        data_migr[idx_esp]['nbobserver'].push(data[d]['nbobserver']);
        data_migr[idx_esp]['nbdep'].push(data[d]['nbdep']);
    }



    var graph_migration = Highcharts.chart('chart_migration', {
        chart: {
            id : 'chart_migration',
        },
        exporting : {
            sourceWidth : 1200,
            sourceHeight : 675,
            scale : 2,
        },
        title: {
            text: undefined
        },
        credits: {
            enabled: false
        },
        colors: ['#7f0000','#cc0000','#ff4444','#ff7f7f','#ffb2b2','#995100','#cc6c00','#ff8800','#ffbb33','#ffe564',
                '#2c4c00','#436500','#669900','#99cc00','#d2fe4c','#3c1451','#6b238e','#9933cc','#aa66cc','#bc93d1',
                '#004c66','#007299','#0099cc','#33b5e5','#8ed5f0','#660033','#b20058','#e50072','#ff3298','#ff7fbf'],
        xAxis: {
            labels: {
                formatter: function() {
                    return monthNames[parseInt(this.value) - 1]
                },
                rotation: -45,
            },
        },
        yAxis: {
            title: {
                text: 'Pourcentage des observations'
            },
            min:0,
            softMax: 30,
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle'
        },
    
        plotOptions: {
            series: {
                label: {
                    connectorAllowed: false
                },
                pointStart: 1
            }
        },
        tooltip: {
            formatter: function () { 
                return `<span style="color: ${this.color}">\u25CF</span> <b>${this.series.name} ${fullmonthNames[this.x-1]}:</b><br>
                <b>${this.y}%</b> des observations...<br>
                <b>${this.series.options.nb[this.x]}</b> observations 
                faites par <b>${this.series.options.nbobserver[this.x]}</b> observateurs dans 
                <b>${this.series.options.nbdep[this.x]}</b> départements.
                `;
            },
            shared: false,
        },
        series: data_migr

    }); 





    });


});

function getmois(elem) {
    console.log(elem);
}