import path from "path";
import fsutils from "../../../utils/fs";
import { print, getLogger } from "../../../utils/logging";

let writeConfig = function(siteConfig, buildConfig, taskConfig) {
    /*
        Copy everything that is not a markdown, jsx or yml file.
    */
    let fn = function*() {
        let logger = getLogger(siteConfig.quiet, "write_config");
        let outputPath = path.join(siteConfig.destination, taskConfig.filename);
        yield* fsutils.writeFile(outputPath, JSON.stringify(siteConfig, null, "\t"));
    };
    return { build: false, fn: fn };
};

export default writeConfig;
