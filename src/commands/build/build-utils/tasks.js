import crankshaft from "crankshaft";
import fsutils from "../../../utils/fs";
import configutils from "../../../utils/config";

/*
    tasks = [
        {
            task: fnGetTask,
            options: options
            ....
        }
    ]
*/
let runTasks = function*(tasks, dir, onComplete, monitor) {
    if (!(tasks instanceof Array))
        tasks = [tasks];

    let build = crankshaft.create();

    for (let taskInfo of tasks) {
        let getTask = taskInfo.task;
        let options = taskInfo.options || {};
        let task = getTask(options);

        if (task.build) {
            if (task.fn) {
                build.configure(task.fn, dir);
            }
        } else {
            if (task.fn) {
                yield* task.fn();
            }
        }
    }

    if (onComplete) {
        build.onComplete(onComplete);
    }

    yield* build.start(monitor);
};


/*
    Load customTasks from the config.dir_custom_tasks directory.
    Sub-directory names are used to hook into the build pipeline.
    See: Hookable Build Pipeline Events
*/
let getCustomTasks = function*(tasksDirectory) {
    let customTasks = {};

    if (yield* fsutils.exists(tasksDirectory)) {
        let dirEntries = yield* fsutils.readdir(tasksDirectory);
        for(let file in dirEntries) {
            let taskName = path.basename(file, path.extname(file));
            let taskPath = path.join(tasksDirectory, file);
            customTasks[taskName] = require(taskPath);
        }
    }

    return customTasks;
};


/*
    Fetch a set of custom tasks based on directory and run them.
    See: Hookable Build Pipeline Events
*/
let runCustomTasks = function*(tasksDirectoryectory) {
    let tasks = yield* getCustomTasks(tasksDirectoryectory);
    if (tasks.length) {
        yield* runTasks(tasks);
    }
};


export default { runTasks, getCustomTasks, runCustomTasks };
