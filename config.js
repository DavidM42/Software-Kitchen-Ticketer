require("dotenv").config();

module.exports = {
  JIRA_BASE_URL: process.env.JIRA_BASE_URL,
  JIRA_EMAIL: process.env.JIRA_EMAIL,
  JIRA_KEY: process.env.JIRA_KEY,
  BOARD_NAME: process.env.BOARD_NAME,
  DEVICE_NAME: process.env.DEVICE_NAME,
  // Optional: comma-separated list of fixVersion names to filter by, e.g. "4.2.0,5.0.0"
  JQL_VERSIONS: process.env.JQL_VERSIONS || "",
};
