package functions

import (
	"math/rand"
	"strconv"
	"strings"
)

type NamedValue struct {
	Name  string  `json:"name"`
	Value float64 `json:"value"`
}

type Feedback struct {
	Category string       `json:"category"`
	Values   []NamedValue `json:"values"`
}

type Question struct {
	Category string   `json:"category"`
	Text     string   `json:"text"`
	Hint     string   `json:"hint"`
	Fact     string   `json:"fact"`
	Options  []string `json:"options"`
	Feedback Feedback `json:"feedback"`
}

type Value struct {
	Value float64 `json:"value"`
	Text  string  `json:"text"`
}

type Country struct {
	Name                 string `json:"name"`
	Id                   string `json:"id"`
	Area                 Value  `json:"area"`
	AreaComparison       string
	GDP                  Value `json:"gdp"`
	GDPCapita            Value `json:"gdpPerCapita"`
	Gini                 Value `json:"gini"`
	Population           Value `json:"population"`
	PopulationGrowthRate Value `json:"populationGrowthRate"`
	BirthRate            Value `json:"birthRate"`
	DeathRate            Value `json:"deathRate"`
	NetMigrationRate     Value `json:"netMigrationRate"`
	HealthExpenditure    Value `json:"healthExpenditure"`
	LifeExpectancy       Value `json:"lifeExpectancy"`
	TotalFertilityRate   Value `json:"totalFertilityRate"`
}

func textToValue(val map[string]interface{}) (Value, bool) {
	if parsed, err := parse(val["text"].(string)); err == nil {
		return Value{
			parsed,
			val["text"].(string),
		}, true
	} else {
		return Value{}, false
	}
}

func GetRandom(array []string) string {
	return array[rand.Intn(len(array))]
}

func contains(s []string, e string) bool {
	for _, a := range s {
		if a == e {
			return true
		}
	}
	return false
}

func GetKeysCountry(m map[string]Country) []string {
	keys := []string{}
	for key := range m {
		keys = append(keys, key)
	}
	return keys
}

func GetKeys(m map[string]float64) []string {
	keys := []string{}
	for key := range m {
		keys = append(keys, key)
	}
	return keys
}

func parse(s string) (float64, error) {
	var sb strings.Builder
	for i := 0; i < len(s); i++ {
		b := s[i]
		if b == '-' || b == '.' || ('0' <= b && b <= '9') {
			sb.WriteByte(b)
		}
		if b == '(' {
			// stop if we find a open paren; e.g., "$46,659 (2019 est.)"
			break
		}
	}
	result, err := strconv.ParseFloat(sb.String(), 64)
	if err != nil {
		return 0, err
	}
	return result, nil
}

func withoutExtension(fileName string) string {
	if pos := strings.LastIndexByte(fileName, '.'); pos != -1 {
		return fileName[:pos]
	}
	return fileName
}
