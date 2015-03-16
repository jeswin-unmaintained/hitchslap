var loadDefaults = function() {
    return {
        dir_custom_tasks: { value: "_custom_tasks", replace: true },
        dir_client_build: { value: "_js", replace: true },
        dir_dev_build: { value: "_dev_js", replace: true },
        dirs_client_vendor: { value: ["_vendor"], replace: true },
        jekyll: {
            //Directories
            dirs_includes: ["_includes"],
            dirs_layouts: ["_layouts"],
            dir_fora: "_fora",

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
            load_data: {
                dirs_data: { value: ["_data"], replace: true },
                markdown_ext: { value: ["markdown","mkdown","mkdn","mkd","md"], replace: true }
            },
            less: {
                dirs: { value: ["_css"], replace: true }
            },
            copy_static_files: {
                skip_extensions: { value: ["markdown","mkdown","mkdn","mkd","md", "yml", "yaml", "jsx", "less", "json"], replace: true }
            },
            webpack: {
                exclude_dirs: { value: ["_data", "_includes", "_layouts", "_posts", "_css"], replace: true }
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
