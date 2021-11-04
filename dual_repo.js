const argv = require("minimist")(process.argv.slice(2));
const fs = require("fs");
const path = require("path");
const simpleGit = require("simple-git");
const shell = require("shelljs");
const cron = require("node-cron");

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

let running = false;
let actions = [];

const Env = {
  rootPath: () => process.env.ROOT_PATH,
  repoOrigin: () => process.env.REPO_ORIGIN,
  repoUpstream: () => process.env.REPO_UPSTREAM,
  cronTime: () => process.env.CRON_TIME,
};

const Logger = {
  log: (message) => console.log(message),
};

const initEnvVar = () => {
  {
    /**
     * Get env variable
     */
    const path = argv["e"] || argv["env"];

    if (!path) throw new Error("Missing flag -e or --env");

    if (typeof path !== "string")
      throw new Error("Flag -e or --env should be a string");

    if (!fs.existsSync(path)) throw new Error("Env file does not exists");

    require("dotenv").config({ path });
  }

  {
    /**
     * Get cron variables
     */
    const cron = argv["c"] || argv["cron"];

    if (cron) {
      const time = argv["t"] || argv["time"];

      if (!time) throw new Error("Missing flag -t or --time");

      if (isNaN(Number(time)))
        throw new Error("Flag -t or --time must be a number");

      process.env.CRON_TIME = time;
    }
  }
};

const verifyRootDir = (basePath) => {
  if (!fs.existsSync(basePath))
    fs.mkdirSync(basePath, {
      recursive: true,
    });
};

const generateCronTime = () => {
  let time = Number(Env.cronTime());

  if (isNaN(time)) throw new Error("Flag -t or --time must be a number");

  if (time < MINUTE) {
    return `*/${time} * * * * *`;
  }

  if (time >= MINUTE && time < HOUR) {
    time = Math.round(time / MINUTE);
    return `*/${time} * * * *`;
  }

  if (time >= HOUR && time < DAY) {
    time = Math.round(time / HOUR);
    return `* */${time} * * *`;
  }

  if (time >= DAY) {
    time = Math.round(time / DAY);
    return `* * */${time} * *`;
  }

  return `* * * * * *`;
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

    const update = async () => {
      Logger.log("Preparing for update repo");
      if (!running) {
        running = true;
        if (!fs.existsSync(path.join(Env.rootPath(), ".git"))) {
          Logger.log(
            `Origin repo does not exist, cloning it from ${Env.repoOrigin()} in path ${Env.rootPath()}`
          );
          await git.clone(Env.repoOrigin(), Env.rootPath());

          if (fs.existsSync(path.join(Env.rootPath(), ".git_origin"))) {
            Logger.log("Removing .git_origin");
            shell.rm(".git_origin");
          }

          Logger.log("Renaming .git to .git_origin");
          shell.mv(".git", `.git_origin`);

          Logger.log("Committing all changes as 'First commit'");
          await git.init().add("*").commit("First commit");

          Logger.log("Renaming branch to main");
          shell.exec("git branch -M main");

          Logger.log(
            `Adding remote upstream ${Env.repoUpstream()} and pushing it`
          );
          await git
            .addRemote("origin", Env.repoUpstream())
            .push(["-fu", "origin", "main"]);

          if (fs.existsSync(path.join(Env.rootPath(), ".git_upstream"))) {
            Logger.log("Removing .git_upstream");
            shell.rm(".git_upstream");
          }

          Logger.log("Renaming .git to .git_upstream");
          shell.mv(".git", `.git_upstream`);

          Logger.log("Renaming .git_origin to .git");
          shell.mv(`.git_origin`, ".git");
        } else {
          Logger.log("Pulling");
          await git.pull();

          Logger.log("Renaming .git to .git_origin");
          shell.mv(".git", `.git_origin`);

          Logger.log("Renaming .git_upstream to .git");
          shell.mv(`.git_upstream`, ".git");

          Logger.log("Committing changes as update files and pushing it");
          await git
            .add("*")
            .commit("update files")
            .push(["-f", "origin", "main"]);

          Logger.log("Renaming .git to .git_upstream");
          shell.mv(".git", `.git_upstream`);

          Logger.log("Renaming .git_origin to .git");
          shell.mv(`.git_origin`, ".git");

          if (actions.includes(update.name)) {
            Logger.log(`Executing pending action ${update.name}`);
            await update(false);
            actions = actions.filter((i) => i !== update.name);
          }
        }
        running = false;
        Logger.log("Repo updated");
      } else {
        Logger.log(`Adding pending action ${update.name}`);
        actions.push(update.name);
      }
    };

    await update();

    if (Env.cronTime())
      cron.schedule(generateCronTime(), async () => {
        Logger.log("Initializing cron job");
        await update();
        Logger.log("Finished cron job");
      });
  } catch (error) {
    console.error(error);
  }
})();
