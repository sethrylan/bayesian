Bayesian
========

[![Build Status](https://travis-ci.org/sethrylan/bayesian.svg?branch=master)](https://travis-ci.org/sethrylan/bayesian)


A test for calibrated probability assessment. See [sethrylan.org/bayesian](http://sethrylan.org/bayesian) for further info.

The client/ subfolder is hosted on the gh-pages service as DOMAIN/bayesian.

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
| server run local          | ```gradlew :server:appengineRun``` |
| server functional tests   | ```gradlew functionalTest```    |
| deploy                    | ```gradlew appengineUpdateAll```         |
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

TODO:
=========
Add legend
    http://stackoverflow.com/questions/13573771/adding-a-chart-legend-in-d3
Remove outlying data points (monaco, vatican)
expand graph on click

