import frontMatter from "front-matter";
import yaml from "js-yaml";
import path from "path";
import fs from "fs";
import fsutils from "../../utils/fs";
import optimist from "optimist";
import crankshaft from "crankshaft";
import React from "react";

import transpile from "./tasks/transpile";
import loadData from "./tasks/load-data";
import * as defaultTasks from "./tasks/default";
import * as jekyllTasks from "./tasks/jekyll";

var modeTasks = {
    jekyll: jekyllTasks
};

var argv = optimist.argv;

/*
    Hookable Build Pipeline Events
    To hook these events, place plugins in the following directory names
    under the custom tasks directories. Main tasks should not be under a specific
    sub-directory.

    1. before-transpile
    2. after-transpile
    3. before-data-load
    4. after-data-load
    5. before-main
    6. main (/ directory)
    7. on-complete
*/

export default function*(siteConfig) {

    GLOBAL.site = {};

    console.log(`Source: ${siteConfig.source}`);
    console.log(`Destination: ${siteConfig.destination}`);


    /*
        Run a single task, or an array of tasks
    */
    var runTasks = function*(tasks, onComplete, monitor) {
        if (!(tasks instanceof Array))
            tasks = [tasks];

        let build = crankshaft.create();

        for (let taskBuilder of tasks) {
            let task = taskBuilder(siteConfig);
            if (task.build) {
                if (task.fn)
                    build.configure(task.fn, siteConfig.source);
            } else {
                if (task.fn)
                    yield* task.fn();
            }
        }

        if (onComplete)
            build.onComplete(onComplete);

        try {
            yield* build.start(monitor);
        } catch (ex) {
            console.log(ex);
            console.log(ex.stack);
            if (ex._inner) {
                console.log(ex._inner);
                console.log(ex._inner.stack);
            }
        }
    };


    /*
        Load customTasks from the config.dir_custom_tasks directory.
        Sub-directory names are used to hook into the build pipeline.
        See: Hookable Build Pipeline Events
    */
    var getCustomTasks = function*(subdir = "") {
        var customTasks = {};
        for (var pluginDir of siteConfig.dir_custom_tasks) {
            var fullPath = path.resolve(siteConfig.destination, pluginDir, subdir);
            if (yield* fsutils.exists(fullPath)) {
                var dirEntries = yield* fsutils.readdir(fullPath);
                for(var file in dirEntries) {
                    var taskName = path.basename(file, path.extname(file));
                    var fullTaskPath = path.join(fullPath, file);
                    customTasks[taskName] = require(fullTaskPath);
                }
            }
        }
        return customTasks;
    };


    /*
        Fetch a set of custom tasks based on directory and run them.
        See: Hookable Build Pipeline Events
    */
    var runCustomTasks = function*(tasksDirectory) {
        let tasks = yield* getCustomTasks(tasksDirectory);
        if (tasks.length)
            yield* runTasks(tasks);
    };


    /* Start */
    var startTime = Date.now();

    //Before Transpile
    yield* runCustomTasks("before-transpile");

    //Transpiling
    yield* runTasks(transpile);

    //After Transpile
    yield* runCustomTasks("after-transpile");

    if (!siteConfig.db) {
        //Before Data Load
        yield* runCustomTasks("before-data-load");

        //Data Load
        yield* runTasks(loadData);

        //After Data Load
        yield* runCustomTasks("after-data-load");
    }

    //Before main tasks
    yield* runCustomTasks("before-main");

    /*
        Aggregate tasks
            1. default tasks
            2. mode-specific tasks, if mode !== "default"
            3. custom tasks
        Filter out
            siteConfig.disabled_tasks
    */
    var enabled = (prefix) => (task) => siteConfig.disabled_tasks.indexOf(`${prefix}${task}`) === -1;

    var runnableDefaultTasks = Object.keys(defaultTasks.main).filter(enabled()).map(task => defaultTasks.main[task]);

    var runnableModeTasks = (siteConfig.mode !== "default") ?
        Object.keys(modeTasks[siteConfig.mode].main)
            .filter(enabled(`${siteConfig.mode}.`))
            .map(task => modeTasks[siteConfig.mode].main[task]) :
        [];

    var customTasks = yield* getCustomTasks();
    var runnableCustomTasks = Object.keys(customTasks)
            .filter(enabled("custom."))
            .map(task => customTasks[task]);

    var onComplete = function*() {
        //We can remove the custom customTasks directory
        for (var pluginDir of siteConfig.dir_custom_tasks) {
            var customTasksPath = path.resolve(siteConfig.destination, pluginDir);
            if (yield* fsutils.exists(customTasksPath))
                yield* fsutils.remove(customTasksPath);
        }

        //On Complete
        yield* runCustomTasks("on-complete");

        var endTime = Date.now();
        console.log(`Build took ${(endTime - startTime)/1000} seconds.`);
    };

    yield* runTasks(
        runnableDefaultTasks.concat(runnableModeTasks).concat(runnableCustomTasks),
        onComplete,
        siteConfig.watch
    );

}
