package functions

import "math/rand"

type NamedValue struct {
	Name  string  `json:"name"`
	Value float32 `json:"value"`
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

type RankedValue struct {
	Value float32 `json:"value"`
	Rank  int     `json:"rank"`
	Text  string  `json:"text"`
}

type Country struct {
	Name                 string      `json:"name"`
	Id                   string      `json:"id"`
	Area                 RankedValue `json:"area"`
	GDP                  RankedValue `json:"gdp"`
	GDPCapita            RankedValue `json:"gdpPerCapita"`
	Gini                 RankedValue `json:"gini"`
	Population           RankedValue `json:"population"`
	PopulationGrowthRate RankedValue `json:"populationGrowthRate"`
	BirthRate            RankedValue `json:"birthRate"`
	DeathRate            RankedValue `json:"deathRate"`
	NetMigrationRate     RankedValue `json:"netMigrationRate"`
	HealthExpenditure    RankedValue `json:"healthExpenditure"`
	LifeExpectancy       RankedValue `json:"lifeExpectancy"`
	TotalFertilityRate   RankedValue `json:"totalFertilityRate"`
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
