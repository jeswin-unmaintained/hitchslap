rm -rf lib/
6to5 --blacklist regenerator -s -d lib/ src/
cp src/site_template lib/ -r
