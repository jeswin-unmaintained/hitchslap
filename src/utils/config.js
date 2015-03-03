export function getExcludedDirectories(config, dirs) {
    return dirs
        .map(dir => dir instanceof Array ? dir : [dir])
        .map(k => config[k])
        .reduce((a, b) => a.concat(b));
}
