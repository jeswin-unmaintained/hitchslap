var print = function(what, prefix) {
    var _log = function(x) {
        console.log(prefix ? `[${prefix}] ${x}` : x);
    };

    if (what instanceof Error) {
        _log(what);
        _log(what.stack);
        if (what._inner) {
            _log(what._inner);
            _log(what._inner.stack);
        }
    } else {
        _log(what);
    }
};

var getLogger = function(siteConfig, prefix) {
    return function(what) {
        if (!siteConfig.quiet) {
            print(what, prefix);
        }
    };
};

export { print, getLogger };
