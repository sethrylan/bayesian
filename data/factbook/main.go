package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"os"
	"path/filepath"
	"strings"
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

var numQuestions = 1000

func main() {
	countries, err := Read()
	if err != nil {
		log.Fatal(err)
	}

	questions := GetQuestions(countries, numQuestions)
	json, err := json.Marshal(questions)
	if err != nil {
		log.Fatal(err)
	}

	// write to file
	file, err := os.Create("questions.json")
	defer file.Close()
	file.Write(json)
}

func Read() (map[string]Country, error) {
	folder := "factbook.json"
	files, err := os.ReadDir(folder)
	if err != nil {
		return nil, err
	}

	var countries map[string]Country = make(map[string]Country)

	for _, file := range files {
		byteValue, err := os.ReadFile(filepath.Join(folder, file.Name()))

		if err != nil {
			return nil, err
		}

		var jsonObject map[string](interface{})
		err = json.Unmarshal(byteValue, &jsonObject)
		if err != nil {
			return nil, err
		}

		var country Country
		country.Id = strings.TrimSuffix(file.Name(), filepath.Ext(file.Name()))

		if gov, ok := jsonObject["Government"].(map[string]interface{}); ok {
			if countryName, ok := gov["Country name"].(map[string]interface{}); ok {
				var shortForm = countryName["conventional short form"].(map[string]interface{})
				country.Name = shortForm["text"].(string)
				if country.Name == "none" {
					// fall back to long name
					country.Name = countryName["conventional long form"].(map[string]interface{})["text"].(string)
				}
			} else {
				continue
			}
		}

		if geography, ok := jsonObject["Geography"].(map[string]interface{}); ok {
			if area, ok := geography["Area"].(map[string]interface{}); ok {
				if total, ok := area["total"].(map[string]interface{}); ok {
					if country.Area, ok = textToValue(total); !ok {
						continue
					}
				} else {
					continue
				}
				if areaComparison, ok := area["total"].(map[string]interface{}); ok {
					country.AreaComparison = areaComparison["text"].(string)
				} else {
					continue
				}
			} else {
				continue
			}
		} else {
			continue
		}

		if economy, ok := jsonObject["Economy"].(map[string]interface{}); ok {
			if gdpVal, ok := economy["Real GDP (purchasing power parity)"].(map[string]interface{}); ok {
				if realGdpPerCapita, ok := economy["Real GDP per capita"].(map[string]interface{}); ok {
					for _, year := range []int{2021, 2020, 2019, 2018, 2017, 2016, 2015} {
						key := fmt.Sprint("Real GDP per capita ", year)
						if val, ok := realGdpPerCapita[key].(map[string]interface{}); ok {
							if country.GDPCapita, ok = textToValue(val); !ok {
								continue
							}
						}
						key = fmt.Sprint("Real GDP (purchasing power parity) ", year)
						if gdpValForYear, ok := gdpVal[key].(map[string]interface{}); ok {
							if country.GDP, ok = textToValue(gdpValForYear); !ok {
								continue
							} else {
								break
							}
						} else {
							continue
						}
					}
				} else {
					continue
				}
			} else {
				continue
			}

			if gini, ok := economy["Gini Index coefficient - distribution of family income"].(map[string]interface{}); ok {
				years := []int{2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010}
				for _, year := range years {
					key := fmt.Sprint("Gini Index coefficient - distribution of family income ", year)
					if val, ok := gini[key].(map[string]interface{}); ok {
						if country.Gini, ok = textToValue(val); ok {
							break
						} else {
							continue
						}
					}
				}
			}
		} else {
			continue
		}

		if people, ok := jsonObject["People and Society"].(map[string]interface{}); ok {
			if birthRate, ok := people["Birth rate"].(map[string]interface{}); ok {
				if country.BirthRate, ok = textToValue(birthRate); !ok {
					continue
				}
			} else {
				continue
			}

			if deathRate, ok := people["Death rate"].(map[string]interface{}); ok {
				if country.DeathRate, ok = textToValue(deathRate); !ok {
					continue
				}
			} else {
				continue
			}

			if netMigrationRate, ok := people["Net migration rate"].(map[string]interface{}); ok {
				if country.NetMigrationRate, ok = textToValue(netMigrationRate); !ok {
					continue
				}
			} else {
				continue
			}

			log.Println(country.Id)
			if population, ok := people["Population"].(map[string]interface{}); ok {
				if populationTotal, ok := population["total"].(map[string]interface{}); ok {
					if country.Population, ok = textToValue(populationTotal); !ok {
						continue
					}
				}
			} else {
				continue
			}

			if tfr, ok := people["Total fertility rate"].(map[string]interface{}); ok {
				if country.TotalFertilityRate, ok = textToValue(tfr); !ok {
					continue
				}
			} else {
				continue
			}

			if healthExp, ok := people["Current health expenditure"].(map[string]interface{}); ok {
				if country.HealthExpenditure, ok = textToValue(healthExp); !ok {
					continue
				}
			} else {
				continue
			}

			if lifeExpectancy, ok := people["Life expectancy at birth"].(map[string]interface{}); ok {
				if totalLifeExpectancy, ok := lifeExpectancy["total population"].(map[string]interface{}); ok {
					if country.LifeExpectancy, ok = textToValue(totalLifeExpectancy); !ok {
						continue
					}
				}
			}

			if populationGrowthRate, ok := people["Population growth rate"].(map[string]interface{}); ok {
				if country.PopulationGrowthRate, ok = textToValue(populationGrowthRate); !ok {
					continue
				}
			}
		} else {
			continue
		}

		countries[country.Id] = country
	}
	return countries, nil
}

func GetQuestions(countries map[string]Country, n int) []Question {
	var questions []Question
	i := 0
	for i < n {
		c1, c2 := getTwoCountries(countries)
		var q Question
		var v1, v2 Value
		q.Category = getRandomCategory()
		switch q.Category {
		case "area":
			v1, v2 = c1.Area, c2.Area
			q.Text = "___ is larger in area."
			q.Hint = fmt.Sprintf("%s: %s<br>%s: %s", c1.Name, c1.AreaComparison, c2.Name, c2.AreaComparison)
		case "population":
			v1, v2 = c1.Population, c2.Population
			q.Text = "___ has more people."
			q.Hint = fmt.Sprintf("%s: population growth rate of %.2f<br>%s: population growth rate of %.2f", c1.Name, c1.PopulationGrowthRate.Value, c2.Name, c2.PopulationGrowthRate.Value)
		case "gdpPerCapita":
			v1, v2 = c1.GDPCapita, c2.GDPCapita
			q.Text = "___ has higher GDP per capita (PPP)."
			q.Hint = fmt.Sprintf("%s: total GDP (PPP) is %s; %s total GDP (PPP) is %s", c1.Name, c1.GDP.Text, c2.Name, c2.GDP.Text)
		case "healthExpenditure":
			v1, v2 = c1.HealthExpenditure, c2.HealthExpenditure
			q.Text = "___ has higher health expenditure (%GDP)"
			q.Hint = fmt.Sprintf("%s: death rate of %.2f<br>%s: death rate of %.2f", c1.Name, c1.DeathRate.Value, c2.Name, c2.DeathRate.Value)
		case "gini":
			v1, v2 = c1.Gini, c2.Gini
			q.Text = "___ has a higher Gini index."
			q.Hint = "The Gini index is a measure of income<br>inequality. Higher values mean higher<br>inequality."
		case "lifeExpectancy":
			v1, v2 = c1.LifeExpectancy, c2.LifeExpectancy
			q.Text = "___ has a higher life expectancy at birth."
			q.Hint = fmt.Sprintf("%s: fertility rate of %.2f<br>%s: fertility rate of %.2f", c1.Name, c1.TotalFertilityRate.Value, c2.Name, c2.TotalFertilityRate.Value)
		}

		if v1.Value != 0 && v2.Value != 0 {
			q.Options = map[string]Option{
				c1.Id: {c1.Name, v1.Value, v1.Text},
				c2.Id: {c2.Name, v2.Value, v2.Text},
			}
			if v1.Value > v2.Value {
				q.Fact = c1.Id
			} else {
				q.Fact = c2.Id
			}
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

func GetRandom(array []string) string {
	return array[rand.Intn(len(array))]
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

func getTwoCountries(countries map[string]Country) (Country, Country) {
	keys := GetKeysCountry(countries)

	countryOne := countries[GetRandom(keys)]
	countryTwo := countries[GetRandom(keys)]

	if countryOne == countryTwo {
		return getTwoCountries(countries)
	}
	return countryOne, countryTwo
}
