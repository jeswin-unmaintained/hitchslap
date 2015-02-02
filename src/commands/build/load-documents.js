import path from "path";
import fs from "fs";
import frontMatter from "front-matter";

export default function*(dir) {
    /*
        Iterate through front-matter within a directory.
    */
    var fullPath = path.join(dir);

    if (fs.existsSync(fullPath)) {
        var files = fs.readdirSync(fullPath).map(file => path.join(fullPath, file));
        var markdownFiles = files.filter(file => [".md", ".markdown"].indexOf(path.extname(file).toLowerCase()) >= 0);
        for (let i = 0; i < markdownFiles.length; i++) {
            var file = markdownFiles[i];
            yield frontMatter(fs.readFileSync(file));
        }
    }
}
