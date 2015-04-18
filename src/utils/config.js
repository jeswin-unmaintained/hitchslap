import optimist from "optimist";

let argv = optimist.argv;

let isEmpty = function(val) {
    return typeof val === "undefined" || val === null;
};

/*
    Tries to read a.b.c.d when passed a, ["b", "c", "d"]
    If anything is undefined, returns defaultVal
*/
let tryRead = function(obj, path, defaultVal) {
    let currentVal = obj;
    for (let i = 0; i < path.length; i++) {
        let p = path[i];
        if (typeof currentVal[p] !== "undefined")
            currentVal = currentVal[p];
        else
            return defaultVal;
    }
    return currentVal;
};


/*
    getValueSetter() returns a valueSetter function.
    valueSetter initializes config properties with
        a) command-line params, if specified
        b) default values, if property is currently empty
*/
let getValueSetter = function(config) {
    config.__defaultFields = [];

    return (fullyQualifiedProperty, defaultValue, options = {}) => {
        //props are like "a.b.c"; we need to find config.a.b.c
        //propParent will be config.a.b, in this case.
        let propArray = fullyQualifiedProperty.split(".");
        let prop = propArray.slice(propArray.length - 1)[0];
        let propParents = propArray.slice(0, propArray.length - 1);

        //Make sure a.b exists in config
        let currentProp = config;
        for (let parent of propParents) {
            if (isEmpty(currentProp[parent])) {
                currentProp[parent] = {};
            }
            currentProp = currentProp[parent];
        }

        //Commandline switches can override everything. Including config.json
        let commandLineArg = argv[fullyQualifiedProperty];
        if (!isEmpty(commandLineArg)) {
            if (isEmpty(currentProp[prop])) {
                //If current prop is empty replace anyway
                currentProp[prop] = commandLineArg;
            } else {
                //If current prop is not empty, but is an array, replace if
                // flag is set. Otherwise concat.
                if (currentProp[prop] instanceof Array) {
                    if (argv[fullyQualifiedProperty + "-replace"]) {
                        currentProp[prop] = (commandLineArg instanceof Array) ? commandLineArg : [commandLineArg];
                    } else {
                        currentProp[prop] = currentProp[prop].concat(commandLineArg);
                    }
                } else {
                    //If current prop is not an array, replace anyway.
                    currentProp[prop] = commandLineArg;
                }
            }
        } else {
            if (isEmpty(currentProp[prop])) {
                currentProp[prop] = defaultValue;
                config.__defaultFields.push(fullyQualifiedProperty);
            } else {
                if (config.__defaultFields.indexOf(fullyQualifiedProperty) !== -1) {
                    if (options.replace) {
                        currentProp[prop] = defaultValue;
                    }
                }
            }
        }
    };
};



/*
    example of obj:
    {
        prop1: false,
        prop2: "hello",
        prop3: { value: ["A"], options: { replace: true } }
        prop4: {
            propInner1: 100
        }
    }

    returns [
        ["prop1", false],
        ["prop2", "hello"],
        ["prop3", "A", { replace: true}],
        ["prop4.propInner", 1000]
    ]
}
*/
let getFullyQualifiedProperties = function(obj, prefixes = [], acc = []) {
    for (let key in obj) {
        let val = obj[key];
        let fullNameArray = prefixes.concat(key);
        if (!(val instanceof Array) && val !== null && typeof val === "object" && (typeof val.value === "undefined")) {
            acc.push([fullNameArray.join("."), {}]);
            getFullyQualifiedProperties(val, fullNameArray, acc);
        } else {
            if (val && typeof val.value !== "undefined") {
                acc.push([fullNameArray.join("."), val.value, val]);
            } else {
                acc.push([fullNameArray.join("."), val]);
            }
        }
    }
    return acc;
};



export default { tryRead, getValueSetter, getFullyQualifiedProperties };
