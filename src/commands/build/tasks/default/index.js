import copyStaticFiles from "./copy-static-files";
import less from "./less";
import writeConfig from "./write-config";
import buildClient from "./build-client";

var main = {
    "copy_static_files": copyStaticFiles,
    "less": less,
    "write_config": writeConfig,
    "build_client": buildClient
};

export { main };
