var loadDefaults = function() {
    return {
        dir_custom_tasks: { value: "_custom_tasks", replace: true },
        dir_client_js: { value: "_js", replace: true },
        jekyll: {
            //Directories
            dirs_includes: ["_includes"],
            dirs_layouts: ["_layouts"],
            dirs_client_vendor: ["_vendor"],

            //Handling Reading
            markdown_ext: ["markdown","mkdown","mkdn","mkd","md"],
            encoding: "utf-8",

            //Conversion
            excerpt_separator: "\n\n",

            //Filtering Content
            show_drafts: false,
            limit_posts: 0,
            future: false,
            unpublished: false,

            //Outputting
            permalink: "date",
            paginate_path: "/page:num",
            timezone: null,
        },
        tasks: {
            transpile: {
                exclude_dirs: ["_vendor"]
            },
            load_data: {
                dirs_data: ["_data"],
                markdown_ext: ["markdown","mkdown","mkdn","mkd","md"]
            },
            less: {
                dirs: ["_css"]
            },
            copy_static_files: {
                skip_extensions: ["markdown","mkdown","mkdn","mkd","md", "yml", "yaml", "jsx", "less", "json"]
            },
            webpack: {
                exclude_dirs: ["_data", "_includes", "_layouts", "_posts", "_css", "_vendor"]
            }
        },

        collections: {
            posts: { dir: "_posts", output: true },
            pages: { output: true }
        },

        scavenge_collection: "pages"
    };
};

export default { loadDefaults };
