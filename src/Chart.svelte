<script context="module">
  import Highcharts from "highcharts";
  import data from "highcharts/modules/data";
  import more from 'highcharts/highcharts-more';

  data(Highcharts);
  more(Highcharts);
        
  var getOverconfidenceSeries = function() {
    return {
      name: 'overconfident',
      fillOpacity: 0.2,
      color: '#FF9900',
      data: [ [55, 0, 55],
              [65, 0, 65],
              [75, 0, 75],
              [85, 0, 85],
              [95, 0, 95]
          ]
    };
  };

  var getUnderconfidenceSeries = function () {
    return {
      name: 'underconfident',
      fillOpacity: 0.2,
      color: '#ADD8E6',
      data: [ [55, 55, 100],
              [65, 65, 100],
              [75, 75, 100],
              [85, 85, 100],
              [95, 95, 100]]
    };
  };
      
  export function createChart() { 
    return Highcharts.chart("container", {
      chart: {
        type: 'areasplinerange',
        zoomType: 'x',
        alignTicks: false,
        sytle: {
          display: "block; overflow-y: hidden;"
        }
      },
      plotOptions: {
        series: {
          states: {
            hover: {
              enabled: false
            }
          }
        }
      },
      credits : {
        enabled: false
      },
      title: {
        text: ''
      },
      xAxis: {
        type: 'linear',
        tickPositions: [55, 65, 75, 85, 95],
        title: {
          text: 'reported confidence'
        }
      },
      yAxis: [
        { // primary axis
          min: 55,
          max: 95,
          title: {
            text: '% correct'
          }
        },
        { // secondary axis for number of questions
          min: 0,
          max: 20,
          title: null,
          // hide ticks and labels
          opposite: true,
          lineWidth: 0,
          minorGridLineWidth: 0,
          gridLineColor: 'transparent',
          labels: {
            enabled: false
          },
        }
      ],
      tooltip: {
        crosshairs: true,
        shared: true,
        formatter: function() {
          var point;
          this.points.forEach( function(element) {
            if (element.series.name === 'confidence') {
              point = element.point;
            }
          });
          if (point) {
            var difference = (point.high - point.low);
            if (!point.total || point.total === 0) {
              return 'no answers';
            } else if (difference === 0) {
              return 'perfectly confident!';
            } else {
              return (difference > 0 ? 'over' : 'under') + 'confident by ' + Math.abs(point.high - point.low) + ' % points<br>';
            }
          }
        }
      },
      legend: {
        enabled: true,
        itemStyle: {'fontSize': '10px', 'fontWeight':'normal'}
      },
      series: [
        {
          name: 'confidence',
          fillOpacity: 0.1,
          color: 'grey',
          showInLegend: false,
          data: [ [55, 55, 55],
                  [65, 65, 65],
                  [75, 75, 75],
                  [85, 85, 85],
                  [95, 95, 95]]
        },
        getUnderconfidenceSeries(),
        getOverconfidenceSeries(),
        {
          name: '#answers',
          type: 'spline',
          yAxis: 1,
          data: [ ],
          tooltip: {
            valueSuffix: ' mm'
          },
          marker: {
            enabled: false
          },
          dashStyle: 'shortdot',
          color: 'grey'
        }
      ]
    });
  }
</script>