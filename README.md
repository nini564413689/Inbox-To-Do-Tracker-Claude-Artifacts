# Inbox To-Do Tracker — Team Setup Guide

A simple way to turn your Outlook inbox into a living to-do list that Claude keeps up to date. It pulls the emails that actually need action, lets you mark things **To Do / Waiting / Done**, tracks your own manual to-dos, and auto-calculates your recurring deadlines. Your statuses save automatically and carry over between sessions.

> You build your **own** copy — it reads *your* mailbox, not anyone else's. Nothing here is shared with the person who sent you this guide.

---

## Before you start

You'll need the **Microsoft 365 connector** turned on in Claude (so it can read your Outlook inbox and Sent Items). If it isn't connected, Claude will prompt you, or you can enable it from the connectors/tools menu.

---

## 1. Create your tracker

Open a chat with Claude and paste:

> **Scan my Outlook inbox for the emails that need action, and build me an interactive to-do tracker. For each item include a plain-language summary, the specific action needed from me, a status I can set (To Do / Waiting / Done), and a link to open the original email. Add a section where I can type my own to-dos, and flag any suspicious/phishing emails separately instead of as tasks.**

Claude will scan, then create the tracker as an artifact you can interact with.

---

## 2. Use it day to day

- **Change a status** — click the circle to cycle To Do → Waiting → Done, or tap a status label directly.
- **Add your own to-do** — type it in the *My To-Dos* box and press Enter.
- **Open an email** — use the *Open in Outlook* link on any card.
- **Refresh it** — each morning (or whenever), just say **"update"** or **"re-scan my inbox."** Claude pulls in new emails, checks your **Sent Items**, and moves anything you've already replied to into *Waiting* or *Done*. Your manual to-dos and your own marks are left alone.

---

## 3. Set up your recurring deadlines

This is the part you customize. Tell Claude your recurring tasks in plain language and it will add them to a **Recurring Deadlines** section that auto-calculates the next due date every time you open the tracker. When you mark one done, it rolls forward to the next cycle on its own.

Supported patterns include:

| Pattern | How to phrase it |
|---|---|
| Monthly on a fixed day | "X is due on the 15th of each month" |
| Relative to month-end | "Y is due 3 workdays before the end of each month" |
| Every N weeks on a weekday | "Z is due every 2 weeks on Monday; the last one was [date]" |
| Weekend handling | "If it lands on a weekend, make it due the **earlier** (or **later**) nearest workday" |

**Example prompt:**

> **Add these recurring deadlines to my tracker:**
> - **[Task name]** — due on the [Nth] of each month
> - **[Task name]** — due [N] workdays before month-end
> - **[Task name]** — due every [N] weeks on [weekday], last one was [MM/DD/YYYY]
> **If any monthly date falls on a weekend, make it due the earlier nearest workday.**

### Changing a recurring task later

Just tell Claude what changed, e.g.:

> "Change my [task] to the 20th instead of the 15th."
> "My remittance is now weekly on Fridays."
> "Remove the [task] recurring deadline."

---

## 4. Make it stick across new chats (optional)

Ask Claude to **remember** your setup:

> "Please remember my recurring deadlines and that I keep an inbox to-do tracker."

Then in any future chat you can simply say **"rebuild my tracker"** and your recurring rules come back automatically — no need to re-explain them.

---

## 5. A note on the "Verify" zone

Claude parks anything that looks like phishing or payment fraud (e.g. unexpected "please arrange this payment" messages, unknown external senders) in a separate **Verify — do not action** box rather than turning it into a task. Always confirm those through a known channel before acting on them.

---

## Quick reference — handy phrases

- *"Update / re-scan my inbox"* — refresh tasks and reply statuses
- *"Add a recurring deadline: …"* — set up an auto-calculated due date
- *"Change my [task] to …"* — edit a recurring rule
- *"Mark [task] as done / waiting"* — set a status by chat
- *"Rebuild my tracker"* — recreate it in a new chat (after Claude remembers your setup)
