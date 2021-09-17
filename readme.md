Bayesian
========

[![Build Status](https://travis-ci.org/sethrylan/bayesian.svg?branch=master)](https://travis-ci.org/sethrylan/bayesian)

A test for calibrated probability assessment. See [sethrylan.org/bayesian](http://sethrylan.org/bayesian) for further info.

Directory Structure
=========

| Directory    | Description                              |
| ------------ |------------------------------------------|
| /docs        | client-side code for gh-pages deployment |

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

Data Sources
=========
[CIA Factbook in XML](http://jmatchparser.sourceforge.net/factbook/)

