package org.lenition.domain;

import java.math.BigDecimal;

public class NameValue {
    public String name;
    public BigDecimal value;

    public NameValue(String name, BigDecimal value) {
        this.name = name;
        this.value = value;
    }
}
