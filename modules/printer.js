const { exec } = require("child_process");
const { DEVICE_NAME } = require("../config");

function getLineFeed(numberOfLines) {
  // ESC d 3 - Feed n lines
  return `\x1B\x64${String.fromCharCode(numberOfLines)}`;
}

function executeShellCommand(command) {
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing command: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Command stderr: ${stderr}`);
    }
    console.log(`Command output: ${stdout}`);
  });
}

function printText(text) {
  const postLineFeed = getLineFeed(3);
  // echo to output text, iconv to convert UTF-8 to CP850, then send to printer with lp
  const printerCommand = `echo "${text + postLineFeed}" | iconv -f UTF-8 -t CP850 | lp -o raw -d ${DEVICE_NAME}`;
  executeShellCommand(printerCommand);
}

module.exports = { printText, getLineFeed };
