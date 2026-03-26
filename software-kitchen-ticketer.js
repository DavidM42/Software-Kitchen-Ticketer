const {
  loadLastPrintedIssueKey,
  saveLastPrintedIssueKey,
} = require("./modules/last-printed-state-file");
const { getBoardId, getNewestIssue } = require("./modules/jira");
const { formatDate } = require("./modules/format-date");
const { printText, getLineFeed } = require("./modules/printer");
const { BOARD_NAME } = require("./config");

const POLL_INTERVAL_MS = 2 * 60 * 1000; // 2 minute
const WORK_HOUR_START = 9; // 9 AM
const WORK_HOUR_END = 17; // 5 PM

let lastPrintedIssueKey = loadLastPrintedIssueKey();

function stripMarkup(text) {
  return (
    text
      // Jira wiki: image attachments !image.png! or !image.png|thumbnail!
      .replace(/![^!|]+(\|[^!]*)?\!/g, "")
      // Jira wiki: headings h1. h2. etc.
      .replace(/^h[1-6]\.\s*/gm, "")
      // Jira wiki: named links [text|url] -> text
      .replace(/\[([^\]|]+)\|[^\]]+\]/g, "$1")
      // Jira wiki: plain links [url]
      .replace(/\[[^\]]+\]/g, "")
      // Jira wiki: {code}, {noformat}, {panel}, {quote} blocks
      .replace(/\{[^}]+\}/g, "")
      // Jira wiki: bold *text*, italic _text_, strikethrough -text-
      .replace(/([*_])(.*?)\1/g, "$2")
      // HTML tags
      .replace(/<[^>]*>/g, " ")
      // HTML entities
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // Collapse horizontal whitespace only (preserve newlines)
      .replace(/[^\S\n]+/g, " ")
      // Collapse more than 2 consecutive newlines
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

function isWithinWorkingHours() {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday
  return (
    day >= 1 && day <= 5 && hour >= WORK_HOUR_START && hour < WORK_HOUR_END
  );
}

async function checkAndPrint(boardId) {
  if (!isWithinWorkingHours()) {
    console.log(
      `[${formatDate()}] Outside working hours (${WORK_HOUR_START}:00–${WORK_HOUR_END}:00). Skipping.`,
    );
    return;
  }

  // Printer connection check is not relevant because printer is in same idle state all the time
  // if (!isPrinterConnected()) {
  //   console.log(`[${formatDate()}] Printer not connected. Skipping.`);
  //   return;
  // }

  const issue = await getNewestIssue(boardId);
  if (!issue) {
    console.log(`[${formatDate()}] No issues found.`);
    return;
  }

  if (issue.key === lastPrintedIssueKey) {
    console.log(
      `[${formatDate()}] No new ticket. Latest is still ${issue.key}. Skipping print.`,
    );
    return;
  }

  let ticketInfo = `${formatDate(issue.fields.created)}${getLineFeed(1)}${issue.key} (${issue.fields.issuetype.name})${getLineFeed(1)}${stripMarkup(issue.fields.summary)}`;
  if (issue.fields.description && issue.fields.description.trim().length > 0) {
    ticketInfo += `${getLineFeed(2)}${stripMarkup(issue.fields.description)}`;
  }

  console.log(`[${formatDate()}] Printing new ticket: ${issue.key}`);
  printText(ticketInfo);
  lastPrintedIssueKey = issue.key;
  saveLastPrintedIssueKey(issue.key);
}

async function mainLoop() {
  const boardName = BOARD_NAME;
  const boardId = await getBoardId(boardName);
  if (!boardId) {
    console.error(`Board "${boardName}" not found.`);
    process.exit(1);
  }

  console.log(
    `Polling board "${boardName}" (ID: ${boardId}) every ${POLL_INTERVAL_MS / 1000}s between ${WORK_HOUR_START}:00 and ${WORK_HOUR_END}:00...`,
  );

  // Run immediately on start, then every minute
  await checkAndPrint(boardId);
  setInterval(() => checkAndPrint(boardId), POLL_INTERVAL_MS);
}

mainLoop();
