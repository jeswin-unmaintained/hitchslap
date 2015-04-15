var tryRead = function(obj, path, otherwise) {
    var currentVal = obj;
    for (var i = 0; i < path.length; i++) {
        var p = path[i];
        if (typeof currentVal[p] !== "undefined")
            currentVal = currentVal[p];
        else
            return otherwise;
    }
    return currentVal;
};

export { tryRead };
    
