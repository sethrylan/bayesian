## Source

https://github.com/factbook/factbook.json

## Data Preparation

```shell
mkdir -p factbook.json
git clone https://github.com/factbook/factbook.json factbook.clone
cd factbook.clone
git checkout c84be3a  # last known commit
cd ..

for i in africa australia-oceania central-america-n-caribbean central-asia east-n-southeast-asia europe middle-east north-america south-america south-asia; do
  mv factbook.clone/$i/*.json ./factbook.json/
done

for i in factbook.clone/*.json; do
  mv $i ./factbook.json/
done

# Remove some uncommon countries

	# "um", // United States Pacific Island Wildlife Refuges
	# "ct", // Central African Republic
	# "wf", // Wallis and Futuna
	# "bq", // Navassa Island
	# "at", // Ashmore and Cartier Islands
	# "kt", // Christmas Island
	# "ck", // Cocos (Keeling) Islands
	# "cr", // Coral Sea Islands
	# "ne", // Niue
	# "nf", // Norfolk Island
	# "cq", // Northern Mariana Islands
	# "tl", // Tokelau
	# "tb", // Saint Barthelemy
	# "dx", // Dhekelia
	# "jn", // Jan Mayen
	# "je", // Jersey
	# "ip", // Clipperton Island
	# "sb", // Saint Pierre and Miquelon
	# "io", // British Indian Ocean Territory
	# "sh", // Saint Helena, Ascension, and Tristan da Cunha
	# "bv", // Bouvet Island
	# "fs", // French Southern and Antarctic Lands
	# "hm", // Heard Island and McDonald Islands
	# "nc", // New Caledonia
	# "wq", // Wake Island
	# "nr", // Nauru
	# "vc", // Saint Vincent and the Grenadines
	# "pf", // Paracel Islands
	# "kr", // Kiribati
	# "cc", // Curacao
	# "tn", // Tonga

for i in um ct wf bq at kt ck cr ne nf cq tl tb dx jn je ip sb io sh bv fs hm nc wq nr vc pf kr cc tn; do
  rm -f factbook.json/$i.json
done

rm -rf factbook.clone
```

## Generate

```shell
go run ./...
```

