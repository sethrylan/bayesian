package main

type Option struct {
	Name  string  `json:"name"`
	Value float64 `json:"value"`
	Text  string  `json:"text"`
}

type Question struct {
	Category string            `json:"category"`
	Text     string            `json:"text"`
	Hint     string            `json:"hint"`
	Fact     string            `json:"fact"`
	Options  map[string]Option `json:"options"`
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
