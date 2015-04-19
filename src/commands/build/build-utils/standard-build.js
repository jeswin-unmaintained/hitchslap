import { getLogger } from "../../../utils/logging";
import getCommonTasks from "../build-utils/common-tasks";
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

let getStandardBuild = function(buildName, fn, cbOnComplete) {
    return function*(siteConfig, buildConfig, builtInPlugins, buildUtils) {

        var tasks = yield* fn(siteConfig, buildConfig, builtInPlugins, buildUtils);

        var startTime = Date.now();

        let { runTasks, getCustomTasks } = buildUtils.tasks;

        let logger = getLogger(siteConfig.quiet, buildName);

        var customTasks = yield* getCustomTasks(siteConfig, buildConfig, builtInPlugins, buildUtils);

        if (customTasks)
            yield* buildUtils.tasks.runTasks(customTasks["on-start"]);

        var onComplete = function*() {
            if (customTasks)
                yield* buildUtils.tasks.runTasks(customTasks["on-complete"]);

            if (cbOnComplete) {
                yield* cbOnComplete();
            }

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
};

export default getStandardBuild;
