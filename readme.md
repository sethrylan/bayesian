Bayesian
========

[![Build Status](https://travis-ci.org/sethrylan/bayesian.svg?branch=master)](https://travis-ci.org/sethrylan/bayesian)


A test for calibrated probability assessment. See [sethrylan.org/bayesian](http://sethrylan.org/bayesian) for further info.

The docs/ subfolder is hosted on the gh-pages service as DOMAIN/bayesian.

Directory Structure
=========

| Directory    | Description                              |
| ------------ |------------------------------------------|
| /docs        | client-side code for gh-pages deployment |
| /config      | build configuration                      |
| /data        | working directory for data preparation   |

Development Workflow
=========

| Description               | Command                                          | CI Task |
| ------------------------- |--------------------------------------------------|---------|
| client pages local run    | ```bundle exec jekyll serve [--safe]```  |         |
| deploy                    | ```gcloud functions deploy Questions --runtime go113 --trigger-http --allow-unauthenticated --max-instances=2```                 |         |

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

