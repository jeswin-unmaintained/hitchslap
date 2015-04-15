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

runtask "isotropy-koa-mode" "node_modules/fora-template-blog/node_modules"
runtask "isotropy" "node_modules/fora-template-blog/node_modules/isotropy-koa-mode/node_modules"

runtask "isotropy-browser-mode" "node_modules/fora-template-blog/node_modules"
runtask "isotropy" "node_modules/fora-template-blog/node_modules/isotropy-browser-mode/node_modules"
runtask "isotropy-browser-request" "node_modules/fora-template-blog/node_modules/isotropy-browser-mode/node_modules"
