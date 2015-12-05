Bayesian
========

A test for calibrated probability assessment. See client/index.html for further info.

This subfolder is hosted on the gh-pages service as DOMAIN/bayesian.

Directory Structure
=========

| Directory    | Description                              |
| ------------ |------------------------------------------|
| /client      | client-side code for gh-pages deployment |
| /config      | build configuration                      |
| /data        | working directory for data preparation   |
| /gradle      | gradle wrapper and build scripts         |
| /persistence | persistence code for GAE deployment      |
| /server      | server code for GAE deployment           |


Development Workflow
=========

| Description               | Command                         |
| ------------------------- |---------------------------------|
| prepare dataset           | ```gradlew factbookCountries``` |
| client pages local run    | ```bundle exec jekyll serve --watch``` (add ```--safe``` to use locally hosted data) |
| client pages/docs deploy  | ```git subtree push --prefix client origin gh-pages```    |
| unit test                 | ```gradlew test```              |
| server run local          | ```gradlew gae``` or ```gradlew :server:gaeRun```                       |
| server functional tests   | ```gradlew functionalTest``` or ```gradlew :server:gaeFunctionalTest``` |
| deploy                    | ```gradlew gaeUpdate```         |
| PMD, CheckStyle, etc      | ```gradlew check```             |
| FindBugs                  | ```gradlew findbugs```          |

Hosted locations
=========
| URL                                                        |
| -----------------------------------------------------------|
| http://sethrylan.org/bayesian                              |
| http://bayesian-calibration.appspot.com/factbook/questions |
| http://persistence.bayesian-calibration.appspot.com/stats  |

Data Sources
=========
[CIA Factbook in XML](http://jmatchparser.sourceforge.net/factbook/)

XSLT Examples
=========
http://stackoverflow.com/questions/8337145/optimization-of-xslt-using-identity-transform

Known Issues:
=========
```gradlew clean``` with a gae* task will often fail to load the application. Run the clean and gae* tasks separately.

TODO:
=========
Add legend
    http://stackoverflow.com/questions/13573771/adding-a-chart-legend-in-d3
Remove outlying data points (monaco, vatican)
expand graph on click

