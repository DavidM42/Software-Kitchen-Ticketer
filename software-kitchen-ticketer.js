const { getBoardId, getNewestIssue } = require("./modules/jira");
const { printText, getLineFeed } = require("./modules/printer");
const { BOARD_NAME } = require("./config");

async function main() {
  const boardName = BOARD_NAME;
  const boardId = await getBoardId(boardName);
  if (!boardId) {
    console.error(`Board "${boardName}" not found.`);
    return;
  }

  const issue = await getNewestIssue(boardId);
  if (!issue) {
    console.error("No issues found.");
    return;
  }

  let ticketInfo = `${new Date(issue.fields.created).toLocaleString("de-DE")} ${getLineFeed(1)} (${issue.fields.issuetype.name}) ${issue.key}: ${issue.fields.summary}`;
  if (issue.fields.description && issue.fields.description.trim().length > 0) {
    ticketInfo += `${getLineFeed(2)} ${issue.fields.description}`;
  }
  console.log("Newest ticket:", ticketInfo);
  printText(ticketInfo);
}

main();
