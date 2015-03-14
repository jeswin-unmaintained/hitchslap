#This checks if there are uncommitted files in any of the projects associated with fora

runtask() {
    curdir=`pwd`
    proj=$1
    basedir=$2
    echo checking $basedir/$proj
    cd $basedir/$proj
    git status
    cd $curdir
    echo
}

runtask "fora-template-blog" "node_modules"
runtask "fora-template-jekyll" "node_modules"
