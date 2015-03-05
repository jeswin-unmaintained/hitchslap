import generateCollections from "./generate-collections";
import generatePages from "./generate-pages";
import generateTemplates from "./generate-templates";

var main = {
    "generate-collections": generateCollections,
    "generate-pages": generatePages,
    "generate-templates": generateTemplates
};

main = {
    "generate-collections": generateCollections
};

export { main };
