import path from "path";
import fsutils from "../../../utils/fs";
import configutils from "../../../utils/config";
import { getLogger } from "../../../utils/logging";
import getCommonTasks from "../build-utils/common-tasks";
import getStandardBuild from "../build-utils/standard-build";

var build = getStandardBuild("production", function*(siteConfig, buildConfig, builtInPlugins, buildUtils) {
    GLOBAL.site = { data: {} };

    var tasks = [];

    tasks.push({
        name: "load-data",
        plugin: builtInPlugins["load-data"],
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

    return tasks;
}, function*() {
    console.log(GLOBAL.site);    
    console.log("Create-db completed");
});

export default build;
