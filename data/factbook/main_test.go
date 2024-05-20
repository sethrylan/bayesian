package main

import (
	"testing"
)

func TestRead(t *testing.T) {
	countries, err := Read()
	if countries == nil || err != nil {
		t.Fatalf(`file not deserialized %v`, err)
	}
	if len(countries) < 189 {
		t.Fatalf(`only %d countries parsed`, len(countries))
	}
}

func TestGetQuestions(t *testing.T) {
	countries, _ := Read()
	questions := GetQuestions(countries, 10)
	if len(questions) != 10 {
		t.Fatal("wrong size")
	}
}

func TestGetRandomCategory(t *testing.T) {
	freq := make(map[string]int)

	for i := 0; i < 1000; i++ {
		freq[getRandomCategory()]++
	}
	// fmt.Println(freq)
}
