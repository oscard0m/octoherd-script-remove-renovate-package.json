// @ts-check
import { composeCreateOrUpdateTextFile } from "@octokit/plugin-create-or-update-text-file";
import { getPackageJsonFilePath } from "./utils.js";

/**
 * Removes 'renovate' entry in the package.json of a repository
 *
 * @param {import('@octoherd/cli').Octokit} octokit
 * @param {import('@octoherd/cli').Repository} repository
 * @param {object} options
 * @param {string} [options.path] if your package.json is not in the root folder of your repository, specify its path
 */
export async function script(octokit, repository, { path }) {
  const owner = repository.owner.login;
  const repo = repository.name;
  const packageJsonTilePath = getPackageJsonFilePath(path);

  if (repository.archived) {
    octokit.log.info(
      { owner, repo, updated: false },
      `${repository.html_url} is archived`
    );
    return;
  }

  const {
    updated,
    data: { commit },
  } = await composeCreateOrUpdateTextFile(octokit, {
    owner,
    repo,
    path: packageJsonTilePath,
    content: ({ exists, content }) => {
      if (!exists) {
        octokit.log.info(`${packageJsonTilePath} does not exist`);
        return content;
      }

      let pkg = JSON.parse(content);

      if (!pkg.renovate) {
        octokit.log.info(
          `${packageJsonTilePath} does not not have any 'renovate' entry`
        );
        return content;
      }

      delete pkg.renovate;

      return JSON.stringify(pkg, null, "  ") + "\n";
    },
    message: `build: remove renovate setup from ${packageJsonTilePath}`,
  });

  octokit.log.info(
    { owner, repo, updated },
    !updated
      ? `"no changes applied to ${packageJsonTilePath}`
      : `"${packageJsonTilePath}" updated in ${commit.html_url}`
  );
}
