package main

import (
	"strconv"
	"strings"
)

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
