// @ts-check

/**
 * Removes 'renovate' entry in the package.json of a repository
 *
 * @param {import('@octoherd/cli').Octokit} octokit
 * @param {import('@octoherd/cli').Repository} repository
 * @param {object} options
 * @param {string} [options.path] if your package.json is not in the root folder of your repository, specify its path
 */
export async function script(octokit, repository, { path }) {}
