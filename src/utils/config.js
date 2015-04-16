var tryRead = function(obj, path, defaultVal) {
    var currentVal = obj;
    for (var i = 0; i < path.length; i++) {
        var p = path[i];
        if (typeof currentVal[p] !== "undefined")
            currentVal = currentVal[p];
        else
            return defaultVal;
    }
    return currentVal;
};

export { tryRead };
