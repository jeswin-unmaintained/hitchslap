import copy_static_files from "./copy_static_files";
import less from "./less";
import webpack from "./webpack";
import write_config from "./write_config";
import build_client from "./build_client";

var main = {
    "copy_static_files": copy_static_files,
    "less": less,
    //"webpack": webpack,
    "write_config": write_config,
    "build_client": build_client
};

export { main };
