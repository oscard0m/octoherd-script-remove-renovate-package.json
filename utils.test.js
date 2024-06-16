import { getPackageJsonFilePath } from "./utils.js";
import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("getPackageJsonFilePath", () => {
  test("returns 'package.json' if no path provided", () => {
    assert.deepEqual(getPackageJsonFilePath(), "package.json");
  });

  test("returns 'package.json' if no path is exactly 'package.json'", () => {
    assert.deepEqual(getPackageJsonFilePath("package.json"), "package.json");
  });

  test("does not add 'package.json' at the end if the path provided already ends with 'package.json' keyword", () => {
    assert.deepEqual(
      getPackageJsonFilePath("my/path/to/package.json"),
      "my/path/to/package.json"
    );
  });

  test("adds 'package.json' at the end if the path provided if does not end with 'package.json' keyword", () => {
    assert.deepEqual(
      getPackageJsonFilePath("my/path/to/"),
      "my/path/to/package.json"
    );
  });

  test("adds '/package.json' at the end if the path provided if does not end with 'package.json' keyword", () => {
    assert.deepEqual(
      getPackageJsonFilePath("my/path/to"),
      "my/path/to/package.json"
    );
  });
});
