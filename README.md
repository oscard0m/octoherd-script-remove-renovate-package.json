# octoherd-script-remove-renovate-package.json

> Removes 'renovate' entry in the package.json of a repository

[![@latest](https://img.shields.io/npm/v/octoherd-script-remove-renovate-package.json.svg)](https://www.npmjs.com/package/octoherd-script-remove-renovate-package.json)
[![Build Status](https://github.com/oscard0m/octoherd-script-remove-renovate-package.json/workflows/Test/badge.svg)](https://github.com/oscard0m/octoherd-script-remove-renovate-package.json/actions?query=workflow%3ATest+branch%3Amain)

## Usage

Minimal usage

```js
npx octoherd-script-remove-renovate-package.json
```

Pass all options as CLI flags to avoid user prompts

```js
npx octoherd-script-remove-renovate-package.json \
  -T ghp_0123456789abcdefghjklmnopqrstuvwxyzA \
  -R "oscard0m/*" \
  --path "packages/server/package.json"
```

## Options

| option                       | type             | description                                                                                                                                                                                                                                 |
| ---------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--path`                     | string           | if your package.json is not in the root folder of your repository, specify its path. Defaults to """"                                                                                                                                       |
| `--octoherd-token`, `-T`     | string           | A personal access token ([create](https://github.com/settings/tokens/new?scopes=repo)). Script will create one if option is not set                                                                                                         |
| `--octoherd-repos`, `-R`     | array of strings | One or multiple space-separated repositories in the form of `repo-owner/repo-name`. `repo-owner/*` will find all repositories for one owner. `*` will find all repositories the user has access to. Will prompt for repositories if not set |
| `--octoherd-bypass-confirms` | boolean          | Bypass prompts to confirm mutating requests                                                                                                                                                                                                 |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## About Octoherd

[@octoherd](https://github.com/octoherd/) is project to help you keep your GitHub repositories in line.

## License

[ISC](LICENSE.md)
