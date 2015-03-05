var print = function(what) {
    if (what instanceof Error) {
        console.log(ex);
        console.log(ex.stack);
        if (ex._inner) {
            console.log(ex._inner);
            console.log(ex._inner.stack);
        }
    } else {
        console.log(what);
    }
};

var getLogger = function(siteConfig) {
    return function(what) {
        if (!siteConfig.quiet) {
            print(what);
        }
    };
};

export { print, getLogger };
