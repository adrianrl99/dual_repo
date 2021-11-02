const argv = require("minimist")(process.argv.slice(2));
const fs = require("fs");

let branchFrom;
let branchTo;
let path;

{
  const branches = argv["r"] || argv["remotes"];

  if (!branches) throw new Error("Missing flag -r or --remotes");

  if (typeof branches !== "string")
    throw new Error("Flag -r or --remotes should be format from/to");

  const splittedBranches = branches.split("/");

  if (splittedBranches.length !== 2)
    throw new Error("Flag -r or --remotes should be format from/to");

  branchFrom = splittedBranches[0];
  branchTo = splittedBranches[1];

  if (!branchFrom || !branchTo)
    throw new Error("Flag -r or --remotes should be format from/to");
}

{
  path = argv["_"][0];

  if (!path) throw new Error("Missing path");

  if (!fs.existsSync(path)) throw new Error("Path not exist");
}
