<xsl:stylesheet version="2.0"
                exclude-result-prefixes="xs xdt err fn"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:xs="http://www.w3.org/2001/XMLSchema"
                xmlns:fn="http://www.w3.org/2005/xpath-functions"
                xmlns:xdt="http://www.w3.org/2005/xpath-datatypes"
                xmlns:err="http://www.w3.org/2005/xqt-errors">
	<xsl:output method="xml"
                indent="yes"
                omit-xml-declaration="yes"/>

	<xsl:template match="/">
        <factbook>
            <xsl:for-each select="/factbook/region[@id!='wrl' and @id!='ant' and @id!='oc']/country">
                <countries>

                    <!--GDP>
                        <xsl:value-of select="/factbook/category/field[@id='f2001']/rank[@country='$id']/@number"/>
                    </GDP-->
                    <xsl:call-template name="country">
                        <xsl:with-param name="country_id" select="@id"/>
                    </xsl:call-template>
                </countries>
            </xsl:for-each>
		</factbook>
	</xsl:template>

	<xsl:template name="country" >
		<xsl:param name="country_id"/>
		<name>
			<xsl:value-of select="@name"/>
		</name>
		<id>
			<xsl:value-of select="@id"/>
		</id>
		<history>
			<xsl:value-of select="/factbook/region/country[@id=$country_id]/field[@ref='f2028']"/>
		</history>
		<misc>
			<xsl:value-of select="/factbook/region/country[@id=$country_id]/field[@ref='f2032']"/>
		</misc>
		
		<area>
			<value><xsl:value-of select="/factbook/category/field[@id='f2147']/rank[@country=$country_id]/@number"/></value>
			<text><xsl:value-of select="/factbook/region/country[@id=$country_id]/field[@ref='f2023']"/></text>
			<rank><xsl:number value="count(/factbook/category/field[@id='f2147']/rank[@country=$country_id]/preceding-sibling::*)" format="1" /></rank>
		</area>
		<gdp>
			<value><xsl:value-of select="/factbook/category/field[@id='f2001']/rank[@country=$country_id]/@number"/></value>
			<text><xsl:value-of select="/factbook/category/field[@id='f2001']/rank[@country=$country_id]/@text"/></text>
			<rank><xsl:number value="count(/factbook/category/field[@id='f2001']/rank[@country=$country_id]/preceding-sibling::*)" format="1" /></rank>
		</gdp>
		<gdpPerCapita>
			<value><xsl:value-of select="/factbook/category/field[@id='f2004']/rank[@country=$country_id]/@number"/></value>
			<text><xsl:value-of select="/factbook/category/field[@id='f2004']/rank[@country=$country_id]/@text"/></text>
			<rank><xsl:number value="count(/factbook/category/field[@id='f2004']/rank[@country=$country_id]/preceding-sibling::*)" format="1" /></rank>
		</gdpPerCapita>
		<gini>
			<value><xsl:value-of select="/factbook/category/field[@id='f2172']/rank[@country=$country_id]/@number"/></value>
			<text><xsl:value-of select="/factbook/category/field[@id='f2172']/rank[@country=$country_id]/@text"/></text>
			<rank><xsl:number value="count(/factbook/category/field[@id='f2172']/rank[@country=$country_id]/preceding-sibling::*)" format="1" /></rank>
		</gini>
		<population>
			<value><xsl:value-of select="/factbook/category/field[@id='f2119']/rank[@country=$country_id]/@number"/></value>
			<text><xsl:value-of select="/factbook/category/field[@id='f2119']/rank[@country=$country_id]/@text"/></text>
			<rank><xsl:number value="count(/factbook/category/field[@id='f2119']/rank[@country=$country_id]/preceding-sibling::*)" format="1" /></rank>
		</population>
		<populationGrowthRate>
			<value><xsl:value-of select="/factbook/category/field[@id='f2002']/rank[@country=$country_id]/@number"/></value>
			<text><xsl:value-of select="/factbook/category/field[@id='f2002']/rank[@country=$country_id]/@text"/></text>
			<rank><xsl:number value="count(/factbook/category/field[@id='f2002']/rank[@country=$country_id]/preceding-sibling::*)" format="1" /></rank>
		</populationGrowthRate>
		<birthRate>
			<value><xsl:value-of select="/factbook/category/field[@id='f2054']/rank[@country=$country_id]/@number"/></value>
			<text><xsl:value-of select="/factbook/category/field[@id='f2054']/rank[@country=$country_id]/@text"/></text>
			<rank><xsl:number value="count(/factbook/category/field[@id='f2054']/rank[@country=$country_id]/preceding-sibling::*)" format="1" /></rank>
		</birthRate>
		<deathRate>
			<value><xsl:value-of select="/factbook/category/field[@id='f2066']/rank[@country=$country_id]/@number"/></value>
			<text><xsl:value-of select="/factbook/category/field[@id='f2066']/rank[@country=$country_id]/@text"/></text>
			<rank><xsl:number value="count(/factbook/category/field[@id='f2066']/rank[@country=$country_id]/preceding-sibling::*)" format="1" /></rank>
		</deathRate>
		<netMigrationRate>
			<value><xsl:value-of select="/factbook/category/field[@id='f2112']/rank[@country=$country_id]/@number"/></value>
			<text><xsl:value-of select="/factbook/category/field[@id='f2112']/rank[@country=$country_id]/@text"/></text>
			<rank><xsl:number value="count(/factbook/category/field[@id='f2112']/rank[@country=$country_id]/preceding-sibling::*)" format="1" /></rank>
		</netMigrationRate>
		<mmr>
			<value><xsl:value-of select="/factbook/category/field[@id='f2223']/rank[@country=$country_id]/@number"/></value>
			<text><xsl:value-of select="/factbook/category/field[@id='f2223']/rank[@country=$country_id]/@text"/></text>
			<rank><xsl:number value="count(/factbook/category/field[@id='f2223']/rank[@country=$country_id]/preceding-sibling::*)" format="1" /></rank>
		</mmr>
		<imr>
			<value><xsl:value-of select="/factbook/category/field[@id='f2091']/rank[@country=$country_id]/@number"/></value>
			<text><xsl:value-of select="/factbook/category/field[@id='f2091']/rank[@country=$country_id]/@text"/></text>
			<rank><xsl:number value="count(/factbook/category/field[@id='f2091']/rank[@country=$country_id]/preceding-sibling::*)" format="1" /></rank>
		</imr>
		<healthExpenditure>
			<value><xsl:value-of select="/factbook/category/field[@id='f2225']/rank[@country=$country_id]/@number"/></value>
			<text><xsl:value-of select="/factbook/category/field[@id='f2225']/rank[@country=$country_id]/@text"/></text>
			<rank><xsl:number value="count(/factbook/category/field[@id='f2225']/rank[@country=$country_id]/preceding-sibling::*)" format="1" /></rank>
		</healthExpenditure>
		<lifeExpectancy>
			<value><xsl:value-of select="/factbook/category/field[@id='f2102']/rank[@country=$country_id]/@number"/></value>
			<text><xsl:value-of select="/factbook/category/field[@id='f2102']/rank[@country=$country_id]/@text"/></text>
			<rank><xsl:number value="count(/factbook/category/field[@id='f2102']/rank[@country=$country_id]/preceding-sibling::*)" format="1" /></rank>
		</lifeExpectancy>
		<totalFertilityRate>
			<value><xsl:value-of select="/factbook/category/field[@id='f2127']/rank[@country=$country_id]/@number"/></value>
			<text><xsl:value-of select="/factbook/category/field[@id='f2127']/rank[@country=$country_id]/@text"/></text>
			<rank><xsl:number value="count(/factbook/category/field[@id='f2127']/rank[@country=$country_id]/preceding-sibling::*)" format="1" /></rank>
		</totalFertilityRate>
		<hivAdultPrevalence>
			<value><xsl:value-of select="/factbook/category/field[@id='f2155']/rank[@country=$country_id]/@number"/></value>
			<text><xsl:value-of select="/factbook/category/field[@id='f2155']/rank[@country=$country_id]/@text"/></text>
			<rank><xsl:number value="count(/factbook/category/field[@id='f2155']/rank[@country=$country_id]/preceding-sibling::*)" format="1" /></rank>
		</hivAdultPrevalence>
		<obesityAdultPrevalence>
			<value><xsl:value-of select="/factbook/category/field[@id='f2228']/rank[@country=$country_id]/@number"/></value>
			<text><xsl:value-of select="/factbook/category/field[@id='f2228']/rank[@country=$country_id]/@text"/></text>
			<rank><xsl:number value="count(/factbook/category/field[@id='f2228']/rank[@country=$country_id]/preceding-sibling::*)" format="1" /></rank>
		</obesityAdultPrevalence>
		<percentChildrenUnderweight>
			<value><xsl:value-of select="/factbook/category/field[@id='f2224']/rank[@country=$country_id]/@number"/></value>
			<text><xsl:value-of select="/factbook/category/field[@id='f2224']/rank[@country=$country_id]/@text"/></text>
			<rank><xsl:number value="count(/factbook/category/field[@id='f2224']/rank[@country=$country_id]/preceding-sibling::*)" format="1" /></rank>
		</percentChildrenUnderweight>
		<educationExpenditure>
			<value><xsl:value-of select="/factbook/category/field[@id='f2206']/rank[@country=$country_id]/@number"/></value>
			<text><xsl:value-of select="/factbook/category/field[@id='f2206']/rank[@country=$country_id]/@text"/></text>
			<rank><xsl:number value="count(/factbook/category/field[@id='f2206']/rank[@country=$country_id]/preceding-sibling::*)" format="1" /></rank>
		</educationExpenditure>
		<youthUnemploymentRate>
			<value><xsl:value-of select="/factbook/category/field[@id='f2229']/rank[@country=$country_id]/@number"/></value>
			<text><xsl:value-of select="/factbook/category/field[@id='f2229']/rank[@country=$country_id]/@text"/></text>
			<rank><xsl:number value="count(/factbook/category/field[@id='f2229']/rank[@country=$country_id]/preceding-sibling::*)" format="1" /></rank>
		</youthUnemploymentRate>
		<gdpRealGrowthRate>
			<value><xsl:value-of select="/factbook/category/field[@id='f2003']/rank[@country=$country_id]/@number"/></value>
			<text><xsl:value-of select="/factbook/category/field[@id='f2003']/rank[@country=$country_id]/@text"/></text>
			<rank><xsl:number value="count(/factbook/category/field[@id='f2003']/rank[@country=$country_id]/preceding-sibling::*)" format="1" /></rank>
		</gdpRealGrowthRate>
		<unemploymentRate>
			<value><xsl:value-of select="/factbook/category/field[@id='f2129']/rank[@country=$country_id]/@number"/></value>
			<text><xsl:value-of select="/factbook/category/field[@id='f2129']/rank[@country=$country_id]/@text"/></text>
			<rank><xsl:number value="count(/factbook/category/field[@id='f2129']/rank[@country=$country_id]/preceding-sibling::*)" format="1" /></rank>
		</unemploymentRate>
		<investment>
			<value><xsl:value-of select="/factbook/category/field[@id='f2185']/rank[@country=$country_id]/@number"/></value>
			<text><xsl:value-of select="/factbook/category/field[@id='f2185']/rank[@country=$country_id]/@text"/></text>
			<rank><xsl:number value="count(/factbook/category/field[@id='f2185']/rank[@country=$country_id]/preceding-sibling::*)" format="1" /></rank>
		</investment>
		<taxes>
			<value><xsl:value-of select="/factbook/category/field[@id='f2221']/rank[@country=$country_id]/@number"/></value>
			<text><xsl:value-of select="/factbook/category/field[@id='f2221']/rank[@country=$country_id]/@text"/></text>
			<rank><xsl:number value="count(/factbook/category/field[@id='f2221']/rank[@country=$country_id]/preceding-sibling::*)" format="1" /></rank>
		</taxes>
		<budgetSurplus>
			<value><xsl:value-of select="/factbook/category/field[@id='f2222']/rank[@country=$country_id]/@number"/></value>
			<text><xsl:value-of select="/factbook/category/field[@id='f2222']/rank[@country=$country_id]/@text"/></text>
			<rank><xsl:number value="count(/factbook/category/field[@id='f2222']/rank[@country=$country_id]/preceding-sibling::*)" format="1" /></rank>
		</budgetSurplus>
		<publicDebt>
			<value><xsl:value-of select="/factbook/category/field[@id='f2186']/rank[@country=$country_id]/@number"/></value>
			<text><xsl:value-of select="/factbook/category/field[@id='f2186']/rank[@country=$country_id]/@text"/></text>
			<rank><xsl:number value="count(/factbook/category/field[@id='f2186']/rank[@country=$country_id]/preceding-sibling::*)" format="1" /></rank>
		</publicDebt>
		<internetHosts>
			<value><xsl:value-of select="/factbook/category/field[@id='f2184']/rank[@country=$country_id]/@number"/></value>
			<text><xsl:value-of select="/factbook/category/field[@id='f2184']/rank[@country=$country_id]/@text"/></text>
			<rank><xsl:number value="count(/factbook/category/field[@id='f2184']/rank[@country=$country_id]/preceding-sibling::*)" format="1" /></rank>
		</internetHosts>
		<internetUsers>
			<value><xsl:value-of select="/factbook/category/field[@id='f2153']/rank[@country=$country_id]/@number"/></value>
			<text><xsl:value-of select="/factbook/category/field[@id='f2153']/rank[@country=$country_id]/@text"/></text>
			<rank><xsl:number value="count(/factbook/category/field[@id='f2153']/rank[@country=$country_id]/preceding-sibling::*)" format="1" /></rank>
		</internetUsers>
		
	</xsl:template>
</xsl:stylesheet>
