# Dual Repo

This program is a utility for to update a repo from another repo

## How to use

Make sure both repositories exist on github, REPO_UPSTREAM must be empty at least.

Example command without cron

```shell
node dual_repo.js -e /path/to/.env
```

Example command with cron

```shell
node dual_repo.js -e /path/to/.env -ct 3600
```

## API

| API              |              | What it does                     |
| ---------------- | ------------ | -------------------------------- |
| `-e` or `--env`  | required     | Path of environment file         |
| `-c` or `--cron` | optional     | Enable cron job                  |
| `-t` or `--time` | \*optional\* | Time for cron job (in `seconds`) |

### \*Optionals\*

- `-t`: If `-c` flag is true, it's required

## ENV

| VARIABLE        |          | What it is                                                       |
| --------------- | -------- | ---------------------------------------------------------------- |
| `ROOT_PATH`     | required | Path where the project is being configured or will be configured |
| `REPO_ORIGIN`   | required | Main repo                                                        |
| `REPO_UPSTREAM` | required | Secondary repo to update from main repo                          |
| `CRON_TIME`     | optional | Time for cron job (in `seconds`) (flag `-t` has higher priority) |
