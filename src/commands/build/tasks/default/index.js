import copyStaticFiles from "./copy-static-files";
import less from "./less";
import webpack from "./webpack";

var main = {
    "copy-static-files": copyStaticFiles,
    "less": less,
    "webpack": webpack
};

export { main };
