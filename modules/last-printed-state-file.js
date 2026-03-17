const fs = require("fs");
const path = require("path");
const os = require("os");

const STATE_FILE = path.join(
  os.tmpdir(),
  "software-kitchen-ticketer-state.json",
);

function loadLastPrintedIssueKey() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const data = JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
      return data.lastPrintedIssueKey || null;
    }
  } catch (err) {
    console.warn("Could not read state file, starting fresh:", err.message);
  }
  return null;
}

function saveLastPrintedIssueKey(key) {
  try {
    fs.writeFileSync(
      STATE_FILE,
      JSON.stringify({ lastPrintedIssueKey: key }),
      "utf-8",
    );
  } catch (err) {
    console.warn("Could not write state file:", err.message);
  }
}

module.exports = { loadLastPrintedIssueKey, saveLastPrintedIssueKey };
