import { getPackageJsonFilePath } from "./utils.js";
import { suite } from "uvu";
import { equal } from "uvu/assert";

const test = suite("getPackageJsonFilePath");

test("returns 'package.json' if no path provided", () => {
  equal(getPackageJsonFilePath(), "package.json");
});

test("returns 'package.json' if no path is exactly 'package.json'", () => {
  equal(getPackageJsonFilePath("package.json"), "package.json");
});

test("does not add 'package.json' at the end if the path provided already ends with 'package.json' keyword", () => {
  equal(
    getPackageJsonFilePath("my/path/to/package.json"),
    "my/path/to/package.json"
  );
});

test("adds 'package.json' at the end if the path provided if does not end with 'package.json' keyword", () => {
  equal(getPackageJsonFilePath("my/path/to/"), "my/path/to/package.json");
});

test("adds '/package.json' at the end if the path provided if does not end with 'package.json' keyword", () => {
  equal(getPackageJsonFilePath("my/path/to"), "my/path/to/package.json");
});

test.run();
