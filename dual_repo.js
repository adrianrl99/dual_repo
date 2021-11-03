const argv = require("minimist")(process.argv.slice(2));
const fs = require("fs");
const path = require("path");
const simpleGit = require("simple-git");
var shell = require("shelljs");

const Env = {
  rootPath: () => process.env.ROOT_PATH,
  repoOrigin: () => process.env.REPO_ORIGIN,
  repoUpstream: () => process.env.REPO_UPSTREAM,
};

const initEnvVar = () => {
  /**
   * Get env variable
   */
  const path = argv["e"] || argv["env"];

  if (!path) throw new Error("Missing flag -e or --env");

  if (typeof path !== "string")
    throw new Error("Flag -e or --env should be a string");

  if (!fs.existsSync(path)) throw new Error("Env file does not exists");

  require("dotenv").config({ path });
};

const verifyRootDir = (basePath) => {
  if (!fs.existsSync(basePath))
    fs.mkdirSync(basePath, {
      recursive: true,
    });
};

(main = async () => {
  try {
    initEnvVar();

    verifyRootDir(Env.rootPath());

    shell.cd(Env.rootPath());

    const git = simpleGit(Env.rootPath(), {
      binary: "git",
      maxConcurrentProcesses: 6,
    });

    {
      if (!fs.existsSync(path.join(Env.rootPath(), ".git"))) {
        await git.clone(Env.repoOrigin(), Env.rootPath());

        if (fs.existsSync(path.join(Env.rootPath(), ".git_origin")))
          shell.rm(".git_origin");

        shell.mv(".git", `.git_origin`);

        await git.init().add("*").commit("First commit");

        shell.exec("git branch -M main");

        await git
          .addRemote("origin", Env.repoUpstream())
          .push(["-fu", "origin", "main"]);

        if (fs.existsSync(path.join(Env.rootPath(), ".git_upstream")))
          shell.rm(".git_upstream");

        shell.mv(".git", `.git_upstream`);
        shell.mv(`.git_origin`, ".git");
      } else {
        await git.pull();

        shell.mv(".git", `.git_origin`);
        shell.mv(`.git_upstream`, ".git");

        await git
          .add("*")
          .commit("update files")
          .push(["-f", "origin", "main"]);

        shell.mv(".git", `.git_upstream`);
        shell.mv(`.git_origin`, ".git");
      }
    }
  } catch (error) {
    console.error(error);
  }
})();
