bayesian
========


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
|                           | ```gradlew gaeUpdate```         |
| PMD, CheckStyle, etc      | ```gradlew check```             |
| FindBugs                  | ```gradlew findbugs```          |




Data Sources
=========
[CIA Factbook in XML](http://jmatchparser.sourceforge.net/factbook/)

XSLT Examples
=========
http://stackoverflow.com/questions/8337145/optimization-of-xslt-using-identity-transform


gae integration
========
https://github.com/SpringSource/spring-security/blob/7edb1089a80ea7a29adb6d01c091e6fa55d61b39/samples/gae/gae.gradle



TODO:
=========
Use real data
Darken chart as more datapoints are added
    https://github.com/iros/d3.chart.horizontal-legend
    http://bl.ocks.org/mbostock/4248145
Add legend
    http://stackoverflow.com/questions/13573771/adding-a-chart-legend-in-d3
use json2html on calibrate.html
    http://www.json2html.com/
    https://github.com/moappi/jquery.json2html
Remove outlying data points (monaco, vatican)
expand graph on click


Range slider:
