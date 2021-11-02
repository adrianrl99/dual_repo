const argv = require("minimist")(process.argv.slice(2));
const fs = require("fs");

let remoteFrom;
let remoteTo;
let path;

{
  const remotes = argv["r"] || argv["remotes"];

  if (!remotes) throw new Error("Missing flag -r or --remotes");

  if (typeof remotes !== "string")
    throw new Error("Flag -r or --remotes should be format from/to");

  const splittedRemote = remotes.split("/");

  if (splittedRemote.length !== 2)
    throw new Error("Flag -r or --remotes should be format from/to");

  remoteFrom = splittedRemote[0];
  remoteTo = splittedRemote[1];

  if (!remoteFrom || !remoteTo)
    throw new Error("Flag -r or --remotes should be format from/to");
}

{
  path = argv["_"][0];

  if (!path) throw new Error("Missing path");

  if (!fs.existsSync(path)) throw new Error("Path not exist");
}
