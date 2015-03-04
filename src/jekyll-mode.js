var loadDefaults = function() {
    return [
        //Conversion
        ["markdown", "markdown"],
        ["highlighter", "highlight.js"],
        ["excerpt_separator", "\n\n"],

        //Filtering Content
        ["show_drafts", false],
        ["limit_posts", 0],
        ["future", false],
        ["unpublished", false],

        //Outputting
        ["permalink", "date"],
        ["paginate_path", "/page:num"],
        ["timezone", null]
    ];
};

var updateSiteConfig = function(siteConfig) {
    siteConfig.collections.posts = siteConfig.collections.posts || { dir: "_posts" };

    //In jekyll mode, turn data scavenging on.
    //  This means that the data loader should look outside the known collection
    //  directories for data files (*.md files).
    //Scavenged data goes into the pages collection unless overridden in config
    siteConfig.scavenge_collection = siteConfig.data_scavenge_collection || "pages";
};

export default { loadDefaults, updateSiteConfig };
