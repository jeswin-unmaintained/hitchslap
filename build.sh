rm -rf lib/
6to5 --blacklist regenerator -d lib/ src/
cp src/templates lib/ -r
