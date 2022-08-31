//ts-check

/**
 * Returns the string of the path for package.json file sanitized
 *
 * @param {string} path
 * @returns {string}
 */

export function getPackageJsonFilePath(path = "") {
  if (!path.length) {
    return "package.json";
  }

  if (path.endsWith("package.json")) {
    return path;
  }

  if (path.endsWith("/")) {
    return `${path}package.json`;
  } else {
    return `${path}/package.json`;
  }
}
