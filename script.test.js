import { test, beforeEach, before, after } from "node:test";
import assert from "node:assert/strict";
import { Octokit } from "@octoherd/cli";
import { script } from "./script.js";
import { repository } from "./tests/fixtures/repository-example.js";
import nock from "nock";

const getOctokitForTests = () => {
  return new Octokit({
    retry: { enabled: false },
    throttle: { enabled: false },
  });
};

before(() => {
  nock.disableNetConnect();
});

beforeEach(() => {
  nock.cleanAll();
});

after(() => {
  nock.restore();
});

test("removes 'renovate' entry in package.json if entry existed", async () => {
  const originalPackageJson = {
    name: "octoherd-cli",
    version: "0.0.0",
    description: "",
    main: "index.js",
    scripts: {
      test: 'echo "Error: no test specified" && exit 1',
    },
    renovate: {
      extends: ["renovate-config-base"],
    },
    author: "",
    license: "ISC",
  };

  const path = "package.json";

  nock("https://api.github.com")
    .get(`/repos/${repository.owner.login}/${repository.name}/contents/${path}`)
    .reply(200, {
      type: "file",
      sha: "randomSha",
      content: Buffer.from(JSON.stringify(originalPackageJson)).toString(
        "base64"
      ),
    })
    .put(
      `/repos/${repository.owner.login}/${repository.name}/contents/${path}`,
      (body) => {
        const pkg = JSON.parse(Buffer.from(body.content, "base64").toString());

        delete originalPackageJson.renovate;

        assert.deepEqual(pkg, originalPackageJson);
        assert.deepEqual(
          body.message,
          `build: remove renovate setup from ${path}`
        );

        return true;
      }
    )
    .reply(200, { commit: { html_url: "link to commit" } });

  await script(getOctokitForTests(), repository, {
    path,
  });
});

test("preserves spacing for JSON files", async () => {
  const path = "package.json";

  const originalPackageJson = {
    name: "octoherd-cli",
    version: "0.0.0",
    description: "",
    main: "index.js",
    scripts: {
      test: 'echo "Error: no test specified" && exit 1',
    },
    renovate: {
      extends: ["renovate-config-base"],
    },
    author: "",
    license: "ISC",
  };

  nock("https://api.github.com")
    .get(`/repos/${repository.owner.login}/${repository.name}/contents/${path}`)
    .reply(200, {
      type: "file",
      sha: "randomSha",
      content: Buffer.from(JSON.stringify(originalPackageJson)).toString(
        "base64"
      ),
    })
    .put(
      `/repos/${repository.owner.login}/${repository.name}/contents/${path}`,
      (body) => {
        assert.deepEqual(
          Buffer.from(body.content, "base64").toString(),
          "{\n" +
            '  "name": "octoherd-cli",\n' +
            '  "version": "0.0.0",\n' +
            '  "description": "",\n' +
            '  "main": "index.js",\n' +
            '  "scripts": {\n' +
            '    "test": "echo \\"Error: no test specified\\" && exit 1"\n' +
            "  },\n" +
            '  "author": "",\n' +
            '  "license": "ISC"\n' +
            "}\n"
        );

        return true;
      }
    )
    .reply(200, { commit: { html_url: "link to commit" } });

  await script(getOctokitForTests(), repository, {
    path,
  });
});

test("'path' option recognizes paths containing package.json as package.json files", async () => {
  const path = "my/random/path/package.json";

  const originalPackageJson = {
    name: "octoherd-cli",
    version: "0.0.0",
    description: "",
    main: "index.js",
    scripts: {
      test: 'echo "Error: no test specified" && exit 1',
    },
    author: "",
    license: "ISC",
  };

  nock("https://api.github.com")
    .get(
      `/repos/${repository.owner.login}/${
        repository.name
      }/contents/${encodeURIComponent(path)}`
    )
    .reply(200, {
      type: "file",
      sha: "randomSha",
      content: Buffer.from(JSON.stringify(originalPackageJson)).toString(
        "base64"
      ),
    })
    .put(
      `/repos/${repository.owner.login}/${
        repository.name
      }/contents/${encodeURIComponent(path)}`,
      (body) => {
        const pkg = JSON.parse(Buffer.from(body.content, "base64").toString());

        assert.deepEqual(pkg, {
          ...originalPackageJson,
          renovate: { extends: ["github>octoherd/.github"] },
        });

        return true;
      }
    )
    .reply(200, { commit: { html_url: "link to commit" } });

  await script(getOctokitForTests(), repository, {
    extends: "github>octoherd/.github",
    path,
  });
});

test.only("throws if JSON file provided is NOT a file", async () => {
  const path = "package.json";
  nock("https://api.github.com")
    .get(`/repos/${repository.owner.login}/${repository.name}/contents/${path}`)
    .reply(200, {
      sha: "randomSha",
      type: "dir",
    });

  try {
    await script(getOctokitForTests(), repository, {
      path,
    });
    assert.fail("should have thrown");
  } catch (error) {
    assert.deepEqual(
      error.message,
      "[@octokit/plugin-create-or-update-text-file] https://api.github.com/repos/octocat/Hello-World/contents/package.json is not a file, but a dir"
    );
  }
});

test("throws if server fails when retrieving the JSON file", async () => {
  const path = "package.json";
  nock("https://api.github.com")
    .get(`/repos/${repository.owner.login}/${repository.name}/contents/${path}`)
    .reply(500);

  try {
    await script(getOctokitForTests(), repository, {
      path,
    });
    assert.fail("should have thrown");
  } catch (error) {
    assert.deepEqual(error.status, 500);
    assert.deepEqual(error.name, "HttpError");
  }
});

test("returns if repository is archived", async () => {
  const respositoryArchived = { ...repository, archived: true };

  try {
    await script(getOctokitForTests(), respositoryArchived, {});
  } catch (error) {
    assert.fail("should have NOT thrown");
  }

  assert.deepEqual(nock.pendingMocks().length, 0);
});

test("skips if file does NOT exist in the repository", async () => {
  const path = "package.json";

  nock("https://api.github.com")
    .get(`/repos/${repository.owner.login}/${repository.name}/contents/${path}`)
    .reply(404)
    .put(`/repos/${repository.owner.login}/${repository.name}/contents/${path}`)
    .reply(201, { commit: { html_url: "link to commit" } });

  try {
    await script(getOctokitForTests(), repository, {
      path,
    });
  } catch (error) {
    assert.fail("should have NOT thrown");
  }
});

test("skips if file does NOT have a 'renovate' entry", async () => {
  const originalPackageJson = {
    name: "octoherd-cli",
    version: "0.0.0",
    description: "",
    main: "index.js",
    scripts: {
      test: 'echo "Error: no test specified" && exit 1',
    },
    author: "",
    license: "ISC",
  };

  const path = "package.json";

  nock("https://api.github.com")
    .get(`/repos/${repository.owner.login}/${repository.name}/contents/${path}`)
    .reply(200, {
      type: "file",
      sha: "randomSha",
      content: Buffer.from(JSON.stringify(originalPackageJson)).toString(
        "base64"
      ),
    })
    .put(
      `/repos/${repository.owner.login}/${repository.name}/contents/${path}`,
      () => {
        assert.fail("file should not be updated");

        return true;
      }
    )
    .reply(200, { commit: { html_url: "link to commit" } });

  await script(getOctokitForTests(), repository, {
    path,
  });
});

test("finds package.json file in root level if file no 'path' option is provided", async () => {
  nock("https://api.github.com")
    .get(
      `/repos/${repository.owner.login}/${repository.name}/contents/package.json`
    )
    .reply(404)
    .put(
      `/repos/${repository.owner.login}/${repository.name}/contents/package.json`
    )
    .reply(201, { commit: { html_url: "link to commit" } });

  try {
    await script(getOctokitForTests(), repository, {});
  } catch (error) {
    assert.fail("should have NOT thrown");
  }
});
