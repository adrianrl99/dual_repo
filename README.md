# Dual Repo

This program is a utility for to update a repo from another repo

## How to use

Example command

```shell
node dual_repo.js -e /path/to/.env
```

## API

| API             | What it does             |
| --------------- | ------------------------ |
| `-e` or `--env` | Path of environment file |

## ENV

| VARIABLE      | What it is                                                       |
| ------------- | ---------------------------------------------------------------- |
| ROOT_PATH     | Path where the project is being configured or will be configured |
| REPO_ORIGIN   | Main repo                                                        |
| REPO_UPSTREAM | Secondary repo to update from main repo                          |
