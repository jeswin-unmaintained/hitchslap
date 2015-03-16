/*
    This is where we package stuff for the client build.
    So, we copy all the transpiled js code into the client (dir_client_js) directory.
    
*/

import path from "path";
import fsutils from "../../../../utils/fs";
import { print, getLogger } from "../../../../utils/logging";

export default function(siteConfig) {
    /*
        Copy everything that is not a markdown, jsx or yml file.
    */
    var fn = function*() {
        var logger = getLogger(siteConfig.quiet, "write_config");
        var taskConfig = siteConfig.tasks.write_config;
        var outputPath = path.join(siteConfig.destination, taskConfig.filename);
        yield* fsutils.writeFile(outputPath, JSON.stringify(siteConfig, null, "\t"));
    };
    return { build: false, fn: fn };
}
