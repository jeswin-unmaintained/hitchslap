import fsutils from "./fs";
import yaml from "js-yaml";
import frontMatter from "front-matter";

var reader = {
    json: JSON.parse,
    yaml: yaml.safeLoad,
    markdown: function(contents) {
        var doc = frontMatter(contents);
        var result = {};
        for (var key in doc.attributes) {
            result[key] = doc.attributes[key];
        }
        result.content = doc.body;
        return result;
    },
    text: a => a
};

var knownFormats = {
    json: ["json"],
    yaml: ["yml", "yaml"],
    markdown: ["markdown","mkdown","mkdn","mkd","md"],
    text: ["txt"]
};

export default function*(fileName, _formats) {
    var formats = Object.assign({}, knownFormats);

    if (_formats) {
        for (let key in _formats) {
            formats[key] = _formats[key];
        }
    }

    for (let key in formats) {
        var regexen = formats[key].map(f => new RegExp(`\.${f}$`));
        if (regexen.some(regex => regex.test(fileName))) {
            return reader[key](yield* fsutils.readFile(fileName));
        }
    }

    throw new Error(`Unknown file format. Cannot parse ${fileName}.`);
}
