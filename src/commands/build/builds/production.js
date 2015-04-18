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
    let { runTasks, runCustomTasks, getCustomTasks } = buildUtils.tasks;

    let logger = getLogger(siteConfig.quiet, "production-build");

    //Before Transpile
    yield* runCustomTasks("on-start");

    /*
        Jo:
            - transpile-server: babel transpile server files, blacklist (regenerator)
            - less: compile less
            - copy-static-files: copy static files
            - browserify: browserify the client, with babel transpile
            - write-config: write config to destination
            - add any custom tasks in the "main" directory

        Out of these ignore tasks in the ignored
    */

    var builtInTasks = [
        "transpile-server", //babel transpile server files, blacklist (regenerator)
        "less", //compile less
        "copy-static-files", //copy static files
        "browserify", //browserify the client, with babel transpile
        "write-config", //write config to destination
    ];

    let enabled = (prefix) => (task) => siteConfig.enabled_tasks.indexOf(`${prefix}${task}`) > -1;
    let runnableDefaultTasks = Object.keys(defaultTasks.main).filter(enabled('')).map(task => defaultTasks.main[task]);

    let runnableModeTasks = (siteConfig.mode !== "default") ?
        Object.keys(modeTasks[siteConfig.mode].main)
            .filter(enabled(`${siteConfig.mode}.`))
            .map(task => modeTasks[siteConfig.mode].main[task]) :
        [];

    let customTasks = yield* getCustomTasks();
    let runnableCustomTasks = Object.keys(customTasks)
            .filter(enabled("custom."))
            .map(task => customTasks[task]);

    let onComplete = function*() {
        //We can remove the custom customTasks directory
        for (let pluginDir of siteConfig.dir_custom_tasks) {
            let customTasksPath = path.resolve(siteConfig.destination, pluginDir);
            if (yield* fsutils.exists(customTasksPath))
                yield* fsutils.remove(customTasksPath);
        }

        //On Complete
        yield* runCustomTasks("on-complete");

        let endTime = Date.now();
        logger(`Build took ${(endTime - startTime)/1000} seconds.`);
    };

    yield* runTasks(
        runnableDefaultTasks.concat(runnableModeTasks).concat(runnableCustomTasks),
        onComplete,
        siteConfig.watch
    );

};

export default build;
