const axios = require("axios");
const { JIRA_BASE_URL, JIRA_EMAIL, JIRA_KEY } = require("../config");

const auth = {
  username: JIRA_EMAIL,
  password: JIRA_KEY,
};

async function getBoardId(boardName) {
  try {
    const response = await axios.get(`${JIRA_BASE_URL}/rest/agile/1.0/board`, {
      auth,
    });
    const boards = response.data.values;
    const board = boards.find((b) => b.name === boardName);
    return board ? board.id : null;
  } catch (error) {
    console.error("Error fetching boards:", error);
    return null;
  }
}

async function getNewestIssue(boardId) {
  try {
    const response = await axios.get(
      `${JIRA_BASE_URL}/rest/agile/1.0/board/${boardId}/issue`,
      {
        auth,
        params: {
          maxResults: 50,
          jql: 'issuetype != "Sub-task" ORDER BY created DESC',
        },
      },
    );
    const issues = response.data.issues;

    const backLogresponse = await axios.get(
      `${JIRA_BASE_URL}/rest/agile/1.0/board/${boardId}/backlog`,
      {
        auth,
        params: {
          maxResults: 50,
          jql: 'issuetype != "Sub-task" ORDER BY created DESC',
        },
      },
    );
    const backlogIssues = backLogresponse.data.issues;

    // Filter for unassigned or assigned to me
    const filteredIssues = [...issues, ...backlogIssues].filter(
      (issue) =>
        !issue.fields.assignee ||
        issue.fields.assignee.emailAddress === JIRA_EMAIL,
    );
    // console.log(
    //   "Available issues:",
    //   filteredIssues.map(
    //     (i) =>
    //       `${new Date(i.fields.created).toLocaleString("de-DE")} ${i.key}: ${i.fields.summary}, assignee: ${i.fields.assignee ? i.fields.assignee.displayName : "Unassigned"}`,
    //   ),
    // );
    // return null;
    // Return the most recently updated from filtered
    return filteredIssues.length > 0 ? filteredIssues[0] : null;
  } catch (error) {
    console.error("Error fetching issues:", error);
    return null;
  }
}

module.exports = { getBoardId, getNewestIssue };
