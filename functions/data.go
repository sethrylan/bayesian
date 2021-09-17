package functions

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"math/rand"
	"net/http"
	"strconv"
	"time"
)

// A cumulative probability list for each categroy
var categoryProbabilities = map[string]float64{
	"area":              0.2,
	"population":        0.4,
	"gdpPerCapita":      0.6,
	"lifeExpectancy":    0.8,
	"healthExpenditure": 0.9,
	"gini":              1.0,
}

var excludedCountries = []string{
	"um", // United States Pacific Island Wildlife Refuges
	"wf", // Wallis and Futuna
	"bq", // Navassa Island
	"at", // Ashmore and Cartier Islands
	"kt", // Christmas Island
	"ck", // Cocos (Keeling) Islands
	"cr", // Coral Sea Islands
	"ne", // Niue
	"nf", // Norfolk Island
	"cq", // Northern Mariana Islands
	"tl", // Tokelau
	"tb", // Saint Barthelemy
	"dx", // Dhekelia
	"jn", // Jan Mayen
	"je", // Jersey
	"ip", // Clipperton Island
	"sb", // Saint Pierre and Miquelon
	"io", // British Indian Ocean Territory
	"sh", // Saint Helena, Ascension, and Tristan da Cunha
	"bv", // Bouvet Island
	"fs", // French Southern and Antarctic Lands
	"hm", // Heard Island and McDonald Islands
	"nc", // New Caledonia
	"wq", // Wake Island
	"nr", // Nauru
	"vc", // Saint Vincent and the Grenadines
	"pf", // Paracel Islands
	"kr", // Kiribati
	"cc", // Curacao
	"tn", // Tonga
}

// DataHTTP is an HTTP Cloud Function.
func Questions(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	n, present := query["n"]

	if !present {
		n = []string{"30"}
	}
	numQuestions, _ := strconv.Atoi(n[0])

	countries, readError := Read()
	if readError != nil {
		http.Error(w, "500 - Could not read file", http.StatusInternalServerError)
		return
	}

	// fmt.Fprintf(w, "Hello, %s!", html.EscapeString(fmt.Sprintf("hello hello %d", numQuestions)))

	questions := GetQuestions(countries, numQuestions)
	json, err := json.Marshal(questions)
	if err != nil {
		http.Error(w, "500 - Could not read file", http.StatusInternalServerError)
		return
	}

	// Set CORS headers for the preflight request
	if r.Method == http.MethodOptions {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.Header().Set("Access-Control-Max-Age", "3600")
		w.WriteHeader(http.StatusNoContent)
		return
	}
	// Set CORS headers for the main request.
	w.Header().Set("Access-Control-Allow-Origin", "*")

	fmt.Fprint(w, string(json))
}

func Read() (map[string]Country, error) {
	byteValue, err := ioutil.ReadFile("./serverless_function_source_code/factbook.json")
	if err != nil {
		// fallback to non-cloud folder
		// see https://cloud.google.com/functions/docs/concepts/exec#file_system
		byteValue, err = ioutil.ReadFile("./factbook.json")
		if err != nil {
			return nil, err
		}
	}

	decoder := json.NewDecoder(bytes.NewReader(byteValue))
	var countries map[string]Country
	err = decoder.Decode(&countries)

	if err != nil {
		return nil, err
	}

	return countries, nil
}

func GetQuestions(countries map[string]Country, n int) []Question {
	var questions []Question
	i := 0
	for i < n {
		c1, c2 := getTwoCountries(countries)
		var q Question
		var v1, v2 float32
		q.Category = getRandomCategory()
		switch q.Category {
		case "area":
			v1, v2 = c1.Area.Value, c2.Area.Value
			q.Text = fmt.Sprintf("%s is bigger than %s.", c1.Name, c2.Name)
			q.Hint = fmt.Sprintf("%s: %s<br>%s: %s", c1.Name, c1.Area.Text, c2.Name, c2.Area.Text)
		case "population":
			v1, v2 = c1.Population.Value, c2.Population.Value
			q.Text = fmt.Sprintf("%s has more people than %s.", c1.Name, c2.Name)
			q.Hint = fmt.Sprintf("%s: population growth rate of %.2f<br>%s: population growth rate of %.2f", c1.Name, v1, c2.Name, v2)
		case "gdpPerCapita":
			v1, v2 = c1.GDPCapita.Value, c2.GDPCapita.Value
			q.Text = fmt.Sprintf("%s has higher GDP (PPP) per capita than %s.", c1.Name, c2.Name)
			cOneYear, cTwoYear := "", ""
			if c1.GDPCapita.Text != "" {
				cOneYear = " (" + c1.GDPCapita.Text + ")"
			}
			if c2.GDPCapita.Text != "" {
				cTwoYear = " (" + c2.GDPCapita.Text + ")"
			}
			q.Hint = fmt.Sprintf("%s: total GDP is %.0f billion%s<br>%s: total GDP is %.0f billion%s", c1.Name, v1, cOneYear, c2.Name, v2, cTwoYear)
		case "healthExpenditure":
			v1, v2 = c1.HealthExpenditure.Value, c2.HealthExpenditure.Value
			q.Text = fmt.Sprintf("%s has higher health expenditure (%%GDP) than %s.", c1.Name, c2.Name)
			q.Hint = fmt.Sprintf("%s: death rate of %.2f<br>%s: death rate of %.2f", c1.Name, c1.DeathRate.Value, c2.Name, c2.DeathRate.Value)
		case "gini":
			v1, v2 = c1.Gini.Value, c2.Gini.Value
			q.Text = fmt.Sprintf("%s has a higher Gini index than %s.", c1.Name, c2.Name)
			q.Hint = fmt.Sprint("The Gini index is a measure of income<br>inequality. Higher values mean higher<br>inequality.")
		case "lifeExpectancy":
			v1, v2 = c1.LifeExpectancy.Value, c2.LifeExpectancy.Value
			q.Text = fmt.Sprintf("%s has a higher life expectancy at birth than %s.", c1.Name, c2.Name)
			q.Hint = fmt.Sprintf("%s: fertility rate of %.2f<br>%s: fertility rate of %.2f", c1.Name, c1.TotalFertilityRate.Value, c2.Name, c2.TotalFertilityRate.Value)
		}

		if v1 != 0 && v2 != 0 {
			q.Feedback = Feedback{Category: q.Category, Values: []NamedValue{{c1.Name, v1}, {c2.Name, v2}}}
			q.Fact = strconv.FormatBool(v1 > v2)
			q.Options = []string{"true", "false"}
			questions = append(questions, q)
			i++
		}

	}
	return questions
}

func getRandomCategory() string {
	r := rand.Float64()
	for k, p := range categoryProbabilities {
		if r <= p {
			return k
		}
	}
	return ""
}

func getTwoCountries(countries map[string]Country) (Country, Country) {
	rand.Seed(time.Now().UnixNano())
	keys := GetKeysCountry(countries)

	countryOne := countries[GetRandom(keys)]
	countryTwo := countries[GetRandom(keys)]

	if contains(excludedCountries, countryOne.Id) || contains(excludedCountries, countryTwo.Id) || countryOne == countryTwo {
		return getTwoCountries(countries)
	} else {
		return countryOne, countryTwo
	}
}

// gcloud functions deploy Questions --runtime go113 --trigger-http --allow-unauthenticated
