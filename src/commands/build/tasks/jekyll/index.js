import generateCollections from "./generate-collections";
import generatePages from "./generate-pages";
import generatePosts from "./generate-posts";
import generateTemplates from "./generate-templates";


/* TODO */
var getBuildOptions = function*() {
    var options = {};
    options.drafts = argv.drafts === true;
    options.future = argv.future === true;
    options.watch = argv.watch === true;
    return options;
};


export default {
    "generate-collections": generateCollections,
    "generate-pages": generatePages,
    "generate-posts": generatePages,
    "generate-templates": generateTemplates
};
