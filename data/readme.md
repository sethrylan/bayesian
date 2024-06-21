# Data

The Bayesian Calibration app requires a list of questions. Each question must have a category, text (displayed as is), 2 options, and a fact (the correct answer from the options).

### Example

```json
[
  {
    "category": "population",
    "text": "___ has more people.",
    "fact": "ks",   // must match one of the keys in the options object
    "options": {
      "ks": {
        "name": "South Korea",
        "text": "52,081,799"  // displayed in feedback after answering
      },
      "st": {
        "name": "Saint Lucia",
        "text": "168,038"
      }
    },
    "hint": "South Korea: population growth rate of 0.21<br>Saint Lucia: population growth rate of 0.26",  // and optional hint, rendered as HTML
  },
]
```
