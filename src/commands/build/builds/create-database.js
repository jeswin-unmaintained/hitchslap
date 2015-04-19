import path from "path";
import fsutils from "../../../utils/fs";
import configutils from "../../../utils/config";
import { getLogger } from "../../../utils/logging";
import getCommonTasks from "../build-utils/common-tasks";
/*
    Hookable Build Pipeline Events
    ------------------------------
    To hook these events, place plugins in the following directory names
    under the dir_custom_tasks/client-debug directory. Main tasks should not be under a specific
    sub-directory.

    - on-start
    - on-complete

    example: dir_custom_tasks/client-debug/on-start/*.js will be run "on start".
*/

let build = function*(siteConfig, buildConfig, builtInPlugins, buildUtils) {
    var startTime = Date.now();

    let { runTasks, getCustomTasks } = buildUtils.tasks;

    let logger = getLogger(siteConfig.quiet, "client-debug-build");

    var customTasks = yield* getCustomTasks(siteConfig, buildConfig, builtInPlugins, buildUtils);

    if (customTasks)
        yield* buildUtils.tasks.runTasks(customTasks["on-start"]);

    var tasks = [];

    GLOBAL.site = { data: {} };

    tasks.push({
        name: "build-client",
        plugin: builtInPlugins["build-client"],
        options: {
            data: GLOBAL.site.data,
            collections: siteConfig.collections || {},
            collectionRootDirectory: siteConfig["collections-root-dir"] || "",
            dataDirectories: siteConfig["data-directories"] || [],
            scavengeCollection: siteConfig["scavenge-collection"] || "",
            excludedDirectories: configutils.tryRead(buildConfig, ["tasks", "load-data", "excluded-directories"], ["node_modules"]),
            excludedFiles: configutils.tryRead(buildConfig, ["tasks", "load-data", "excluded-files"], ["config.yml", "config.yaml", "config.json"]),
            markdownExtensions: configutils.tryRead(buildConfig, ["tasks", "load-data", "markdown-extensions"], ["md", "markdown"])
        }
    });


    var onComplete = function*() {
        if (customTasks)
            yield* buildUtils.tasks.runTasks(customTasks["on-complete"]);

        let endTime = Date.now();
        logger(`Build took ${(endTime - startTime)/1000} seconds.`);
    };

    try {
        yield* buildUtils.tasks.runTasks(tasks, siteConfig.source, onComplete, siteConfig.watch);
    } catch (ex) {
        console.log(ex);
        console.log(ex.stack);
    }
};

export default build;
