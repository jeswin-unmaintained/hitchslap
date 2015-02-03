rm -rf lib/

#compile entire directory.
6to5 --blacklist regenerator -s -d lib/ src/

#-n --no-clobber, don't overwrite
cp src/site_template lib/ -r -n

#Rename jsx to js
find lib/ -name "*.jsx" -exec rename 's/\.jsx$/.js/' '{}' \;
find lib/ -name "*.jsx.map" -exec rename 's/\.jsx.map$/.js.map/' '{}' \;
