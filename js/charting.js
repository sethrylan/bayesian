
// fiddle example: http://jsfiddle.net/um78o3ev/6/

Highcharts.setOptions({
    chart: {
        style: {
            fontFamily: 'Verdana, Helvetica, Arial, sans-serif'
        }
    }
});

var getOverconfidenceSeries = function() {
    return {
        name: 'overconfident',
        fillOpacity: 0.2,
        color: '#FF9900',
        data: [ [50, 0, 50],
                [60, 0, 60],
                [70, 0, 70],
                [80, 0, 80],
                [90, 0, 90],
                [100, 0, 100]]
    };
};

var getUnderconfidenceSeries = function () {
    return {
        name: 'underconfident',
        fillOpacity: 0.2,
        color: '#9370DB',
        data: [ [50, 50, 100],
                [60, 60, 100],
                [70, 70, 100],
                [80, 80, 100],
                [90, 90, 100],
                [100, 100, 100]]
    };
};

var confidenceChart = new Highcharts.Chart({
    chart: {
      type: 'areasplinerange',
      zoomType: 'x',
      renderTo: 'confidenceChartContainer',
      spacing: [15,15,15,15],
      alignTicks: false
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
      title: {
        text: 'reported confidence'
      }
    },
    yAxis: [
      { // primary axis
        min: 50,
        max: 100,
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
        minorTickLength: 0,
        tickLength: 0
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
        data: [ [50, 50, 50],
                [60, 60, 60],
                [70, 70, 70],
                [80, 80, 80],
                [90, 90, 90],
                [100, 100, 100]]
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

var getPointFormat = function(category) {
    switch (category) {
        case 'area':
            return '{point.y:.1f} km2';
        case 'population':
            return '{point.y} people';
        case 'gdpPerCapita':
            return '${point.y} per person';
        case 'healthExpenditure':
            return '{point.y:.1f}% of GDP';
        case 'gini':
            return '{point.y:.1f} Gini coefficient';
        case 'lifeExpectancy':
            return '{point.y:.1f} years';
        default:
            console.error("No such feedback category.");
            return;
    }
};

function drawConfidenceChart(confidenceSeriesData) {
    confidenceChart.series[0].setData(confidenceSeriesData);
    confidenceChart.series[3].setData(confidenceSeriesData);
}

function drawFeedbackChart(feedback, isCorrect) {
  new Highcharts.Chart({
      chart: {
          type: 'column',
          renderTo: 'feedbackChartContainer',
          spacing: [15,15,15,15]
      },
      credits: {
        enabled: false
      },
      title: {
          text: 'Last Question : ' + feedback.category,
          style: {'fontSize': '12px' }
      },
      subtitle: {
          text: (isCorrect ? 'Correct' : 'Incorrect') + '<br>' + 'Source: <a href="https://www.cia.gov/library/publications/the-world-factbook/">World Factbook</a>',
          style: {'fontSize': '8px',
                  'color': isCorrect ? 'green' : 'red'}
      },
      plotOptions: {
        series: {
          animation: {
              duration: 300
          }
        }
      },
      xAxis: {
          type: 'category',
          labels: {
              rotation: -45,
              style: {
                  fontSize: '13px',
                  fontFamily: 'Verdana, sans-serif'
              }
          }
      },
      yAxis: {
          min: 0,
          title: null
      },
      legend: {
          enabled: false
      },
      tooltip: {
          pointFormat: getPointFormat(feedback.category)
      },
      series: [{
          data: [
              [feedback.values[0].name, feedback.values[0].value],
              [feedback.values[1].name, feedback.values[1].value]
          ]
      }]
  });
}