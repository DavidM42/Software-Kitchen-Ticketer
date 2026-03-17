# 🎫 Software-Kitchen-Ticketer

Want to feel like you're working on something useful like cooking even though you're just staring at a computer?
This is a Node.js service that polls a Jira board for new issues and automatically prints them on a thermal receipt printer — so you always have a physical ticket to work on at your desk.

## How It Works

1. The script polls your Jira board (including backlog) every 2 minutes
2. It picks the newest issue that is either **unassigned** or **assigned to you**
3. If it's a new ticket (not already printed), it sends it to a connected thermal printer via `lp`
4. The last printed issue key is persisted to a temp file, so duplicate prints are avoided — even across script restarts

### Scheduling Rules

- **Weekdays only** — Monday to Friday (no weekends)
- **Working hours only** — 9:00 AM to 5:00 PM (local time)
- Outside these windows the script stays running but skips polling

## Prerequisites

- **Node.js** (v18+)
- **macOS** (uses `lp` for printing and `iconv` for character encoding)
- A **thermal receipt printer** connected and configured via CUPS (e.g. a USB thermal printer like the H58)
- A **Jira Cloud** instance with API access

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/DavidM42/Software-Kitchen-Ticketer.git
cd Software-Kitchen-Ticketer
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

| Variable        | Required | Description                                                                                       |
| --------------- | -------- | ------------------------------------------------------------------------------------------------- |
| `JIRA_BASE_URL` | ✅       | Your Jira instance URL, e.g. `https://yourteam.atlassian.net`                                     |
| `JIRA_EMAIL`    | ✅       | Email address of your Jira account                                                                |
| `JIRA_KEY`      | ✅       | Jira API token ([generate one here](https://id.atlassian.com/manage-profile/security/api-tokens)) |
| `BOARD_NAME`    | ✅       | Exact name of the Jira board to monitor                                                           |
| `DEVICE_NAME`   | ✅       | CUPS printer name (find it with `lpstat -p`)                                                      |
| `JQL_VERSIONS`  | ❌       | Optional comma-separated fixVersion filter, e.g. `4.2.0,5.0.0`                                    |

### 4. Verify your printer

Make sure your printer shows up in CUPS:

```bash
lpstat -p
```

## Usage

### Run manually

```bash
npm run script
```

### Run as a background service on macOS (launchd)

A `launchd` plist file is included in the repo. To install it as a service that starts automatically on login:

```bash
cp com.davidmerz.software-kitchen-ticketer.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.davidmerz.software-kitchen-ticketer.plist
```

> **Note:** The plist file contains absolute paths. If your project directory or Node.js path differs, edit the plist before loading it.

**Check service status:**

```bash
launchctl list | grep software-kitchen
```

**View logs:**

```bash
tail -f ~/Library/Logs/software-kitchen-ticketer.log
tail -f ~/Library/Logs/software-kitchen-ticketer.err.log
```

**Stop the service:**

```bash
launchctl unload ~/Library/LaunchAgents/com.davidmerz.software-kitchen-ticketer.plist
```

## Project Structure

```
├── software-kitchen-ticketer.js   # Main entry point — polling loop & print logic
├── config.js                      # Loads environment variables via dotenv
├── modules/
│   ├── jira.js                    # Jira API client — board lookup & issue fetching
│   ├── printer.js                 # Thermal printer output via lp/iconv
│   ├── format-date.js             # Date formatting helper (de-DE locale)
│   └── last-printed-state-file.js # Persists last printed issue key to temp file
├── com.davidmerz.software-kitchen-ticketer.plist  # macOS launchd service config
├── .env.example                   # Example environment variables
└── package.json
```

## Filtering by Version

To only print tickets tagged with specific fixVersions, set the `JQL_VERSIONS` environment variable in your `.env`:

```bash
JQL_VERSIONS=4.2.0,5.0.0
```

This adds `AND fixVersion IN ("4.2.0", "5.0.0")` to the JQL query. Leave it empty or omit it to fetch all issues regardless of version.

## License

[MIT](LICENSE)
