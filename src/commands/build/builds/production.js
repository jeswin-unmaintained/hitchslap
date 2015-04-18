import path from "path";
import fsutils from "../../../utils/fs";
import configutils from "../../../utils/config";
import { getLogger } from "../../../utils/logging";

/*
    Hookable Build Pipeline Events
    ------------------------------
    To hook these events, place plugins in the following directory names
    under the dir_custom_tasks/production directory. Main tasks should not be under a specific
    sub-directory.

    - on-start
    - on-complete

    example: dir_custom_tasks/production/on-start/*.js will be run "on start".
*/

let build = function*(siteConfig, buildConfig, builtInPlugins, buildUtils) {
    var startTime = Date.now();
    
    let { runTasks, getCustomTasks } = buildUtils.tasks;

    let logger = getLogger(siteConfig.quiet, "production-build");

    //Before Transpile
    var customTasks = yield* getCustomTasks(siteConfig, buildConfig, builtInPlugins, buildUtils);

    if (customTasks)
        yield* buildUtils.tasks.runTasks(customTasks["on-start"]);

    var tasks = [];

    tasks.push({
        name: "transpile-server", //babel transpile server files, blacklist (regenerator)
        plugin: builtInPlugins.babel,
        options: {
            destination: siteConfig.destination,
            extensions: siteConfig["js-extensions"],
            excludedDirectories: [siteConfig.destination]
                .concat(siteConfig["dirs-client-vendor"])
                .concat(siteConfig["dirs-exclude"]),
            excludedPatterns: siteConfig["patterns-exclude"],
            blacklist: ["regenerator"]
        }
    });

    tasks.push({
        name: "less", //compile less files
        plugin: builtInPlugins.less,
        options: {
            destination: siteConfig.destination,
            directories: configutils.tryRead(buildConfig, ["tasks", "less", "dirs"], [])
        }
    });


    tasks.push({
        name: "copy-static-files", //copy static funny .gifs
        plugin: builtInPlugins["copy-static-files"],
        options: {
            destination: siteConfig.destination,
            extensions: ["*.*"],
            excludedDirectories: [siteConfig.destination]
                .concat(siteConfig["dirs-client-vendor"])
                .concat(siteConfig["dirs-exclude"]),
            excludedPatterns: siteConfig["patterns-exclude"],
            excludedExtensions: configutils.tryRead(buildConfig, ["tasks", "copy-static-files", "exclude-extensions"], ["less"]),
            changeExtensions: [ { to: "js", from: ["es6", "jsx"]}]
        }
    });


    tasks.push({
        name: "write-config", //write the merged config file into the destination directory
        plugin: builtInPlugins["write-config"],
        options: {
            destination: siteConfig.destination,
            filename: configutils.tryRead(buildConfig, ["tasks", "write-config", "filename"], ["config.json"]),
            config: siteConfig
        }
    });

    var onComplete = function*() {
        let endTime = Date.now();
        logger(`Build took ${(endTime - startTime)/1000} seconds.`);
    };

    yield* buildUtils.tasks.runTasks(tasks, siteConfig.source, onComplete, siteConfig.watch);
};

export default build;
