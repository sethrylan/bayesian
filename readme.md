Bayesian
========

A test for calibrated probability assessment. See client/index.html for further info. 


Development Workflow
=========

| Description               | Command                         |
| ------------------------- |---------------------------------|
| prepare dataset           | ```gradlew factbookCountries``` |
| client pages local run    | ```serve.bat```                 |
| client pages/docs deploy  | ```gradlew publishGhPages```    |
| unit test                 | ```gradlew test```              |
| server run local          | ```gradlew gaeRun```            |
| server functional tests   | ```gradlew gaeFunctionalTest``` |
| upload project to GAE     | ```gradlew gaeUpdate```         |
| PMD, CheckStyle, etc      | ```gradlew check```             |
| FindBugs                  | ```gradlew findbugs```          |


Data Sources
=========
[CIA Factbook in XML](http://jmatchparser.sourceforge.net/factbook/)

XSLT Examples
=========
http://stackoverflow.com/questions/8337145/optimization-of-xslt-using-identity-transform


TODO:
=========
Darken chart as more datapoints are added
    https://github.com/iros/d3.chart.horizontal-legend
    http://bl.ocks.org/mbostock/4248145
Add legend
    http://stackoverflow.com/questions/13573771/adding-a-chart-legend-in-d3
Remove outlying data points (monaco, vatican)
expand graph on click
