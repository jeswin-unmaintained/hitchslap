import path from "path";
import frontMatter from "front-matter";
import doLayout from "./do-layout";
import fsutils from "../../utils/fs";

export default function(siteConfig) {

    GLOBAL.site.posts = [];

    var makePath = function(filePath, page) {
        var permalink = page.permalink || siteConfig.permalink;

        var dir = path.dirname(filePath);
        var extension = path.extname(filePath);
        var basename = path.basename(filePath, extension);

        var [year, month, day, ...titleArr] = basename.split("-");
        var placeholders = {
            year: year,
            month: month,
            day: day,
            title: titleArr.join("-"),
            imonth: parseInt(month).toString(),
            iday: parseInt(day).toString(),
            short_year: parseInt(year) - parseInt(parseInt(year)/1000)*1000,
            categories: page.categories ? page.categories.split(/\s+/).join("/") : ""
        };

        var parsePlaceholders = function(permalink) {
            for (var key in placeholders) {
                var regex = new RegExp(`\:\\b${key}\\b`);
                permalink = permalink.replace(regex, placeholders[key]);
            }
            return permalink.replace(/^\/*/, "");
        };

        if (/\/$/.test(permalink))
            permalink += "index.html";

        return (
            permalink === "pretty" ? parsePlaceholders("/:categories/:year/:month/:day/:title/index.html") :
            permalink === "date" ? parsePlaceholders("/:categories/:year/:month/:day/:title.html") :
            permalink === "none" ? parsePlaceholders("/:categories/:title.html") :
            parsePlaceholders(permalink)
        );
    };

    /*
        Pages are all markdown files residing outside these directories:
            a) starting with an underscore. eg: _layouts/*, _posts/* aren't pages
            b) collections
    */
    return function() {
        var extensions = siteConfig.markdown_ext.map(ext => `_posts/*.${ext}`);
        this.watch(extensions, function*(filePath, ev, matches) {
            var results = yield* doLayout(filePath, "default", makePath, siteConfig);
            GLOBAL.site.posts.push(results.page);
        }, "build_posts");
    };
}
