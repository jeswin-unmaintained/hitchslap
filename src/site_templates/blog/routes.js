import home from "web/home";
import posts from "web/posts"

export default [
    { method: "get", url: "", handler: home.index },
    { method: "get", url: "/posts/:post", handler: posts.index },
];
