# Dual Repo

This program is a utility for to update a repo from another repo

## How to use

Example command

```shell
node dual_repo.js -p /path/to/git/repo -b main -r origin/upstream
```

## API

| API                  | What it does                                                                                         |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| `-p` or `--path`     | Path of local git repo                                                                               |
| `-r` or `--remotes`  | Remotes repos with format `from/to` (ex: `origin/upstream` this update upstream from origin)         |
| `-b` or `--branches` | Branch to update with format `branch_name` or `from/to`, if from and to are equal, use `branch_name` |
| `-` or `--`          |                                                                                                      |
