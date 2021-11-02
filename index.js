const argv = require("minimist")(process.argv.slice(2));
const fs = require("fs");
const simpleGit = require("simple-git");

(async () => {
  try {
    let path;

    let remoteFrom;
    let remoteTo;

    let branchFrom;
    let branchTo;

    {
      /**
       * Get path variable
       */
      path = argv["p"] || argv["path"];

      if (!path) throw new Error("Missing flag -p or --path");

      if (typeof path !== "string")
        throw new Error("Flag -p or --path should be a string");

      if (!fs.existsSync(path)) throw new Error("Path does not exists");
    }

    {
      /**
       * Get remoteFrom and remoteTo variables
       */
      const remotes = argv["r"] || argv["remotes"];

      if (!remotes) throw new Error("Missing flag -r or --remotes");

      if (typeof remotes !== "string")
        throw new Error("Flag -r or --remotes should be a string");

      const splittedRemotes = remotes.split("/");

      if (splittedRemotes.length !== 2)
        throw new Error("Flag -r or --remotes should be format from/to");

      remoteFrom = splittedRemotes[0];
      remoteTo = splittedRemotes[1];

      if (!remoteFrom || !remoteTo)
        throw new Error("Flag -r or --remotes should be format from/to");

      if (remoteFrom === remoteTo)
        throw new Error("Flag -r or --remotes can't be equal");
    }

    {
      /**
       * Get branchFrom and branchTo variables
       */
      const branches = argv["b"] || argv["branches"];

      if (!branches) throw new Error("Missing flag -b or --branches");

      if (typeof branches !== "string")
        throw new Error("Flag -b or --branches should be a string");

      const splittedBranches = branches.split("/");

      if (splittedBranches.length > 2 && splittedBranches.length < 1)
        throw new Error(
          "Flag -b or --branches should be format (name or from/to)"
        );

      branchFrom = splittedBranches[0];
      branchTo = splittedBranches[1] || branchFrom;

      if (!branchFrom && !branchTo)
        throw new Error(
          "Flag -b or --branches should be format (name or from/to)"
        );
    }

    const git = simpleGit(path, {
      binary: "git",
      maxConcurrentProcesses: 6,
    });

    {
      /**
       * Check if remotes exists
       */
      const remotes = await git.getRemotes();

      if (!remotes.filter((i) => i.name === remoteFrom).length)
        throw new Error(`Remote from (${remoteFrom}) does not exists`);
      if (!remotes.filter((i) => i.name === remoteTo).length)
        throw new Error(`Remote to (${remoteTo}) does not exists`);
    }

    {
      /**
       * Check if branches exists
       */
      const branches = await git.branchLocal();

      if (!branches.all.includes(branchFrom))
        throw new Error(`Branch from (${branchFrom}) does not exists`);
      if (!branches.all.includes(branchTo))
        throw new Error(`Branch to (${branchTo}) does not exists`);
    }

    console.log("Changing to branch", branchFrom);
    await git.checkout([branchFrom]);
    console.log("Changed");
    console.log("Pulling from remote", remoteFrom, "branch", branchFrom);
    await git.pull(remoteFrom, branchFrom, { "--rebase": "true" });
    console.log("Pulled");
    console.log("Pushing to remote", remoteTo, "branch", branchTo);
    await git.push(remoteTo, branchTo);
    console.log("Pushed");
  } catch (error) {
    console.error(error);
  }
})();
