import copyStaticFiles from "./copy_static_files";
import less from "./less";
import webpack from "./webpack";

var main = {
    "copy_static_files": copyStaticFiles,
    "less": less,
    "webpack": webpack
};

export { main };
