Try it--"Copy tracker-demo.tsx, paste into Claude, and ask it to run the file."


<img width="821" height="891" alt="image" src="https://github.com/user-attachments/assets/8bbfe59a-fd6c-4701-b3a9-0a51253059c5" />

<img width="702" height="704" alt="image" src="https://github.com/user-attachments/assets/8dc23086-534f-45b1-b129-c22a9b072c51" />

# 📥 Inbox To-Do Tracker

An AI-assisted personal productivity tool that turns a busy Outlook inbox into a living to-do list. It reads the emails that actually need action, lets you mark them **To Do / Waiting / Done**, tracks your own manual to-dos, and automatically works out recurring deadlines — all in one view that remembers your progress.

Built using **Claude** (Anthropic's AI assistant) connected to **Microsoft 365**. The tool was designed by translating a real day-to-day finance/accounting workflow into a working interactive app — no email content or company data is included in this repository.

> **Requires:** Claude + the Microsoft 365 connector. Each user runs their own copy against their own mailbox.

---

## ▶️ Try the demo (no setup)

You don't need to install anything. Just:

1. Open [`tracker-demo.tsx`](./tracker-demo.tsx) and copy its contents (or download the file).
2. Paste it into a chat with **Claude**.
3. Ask Claude to **run it as an artifact**.

It opens live with safe sample data, so you can click the buttons, change statuses, add to-dos, and tick a recurring deadline. **No Microsoft 365 connector needed for the demo** — that's only required for the real version that reads your own inbox.

---

## ✨ What it does

- **Reads your inbox** and surfaces only the emails that need action — with a plain-language summary and the specific next step for each.
- **Three-state tracking** — every item is To Do, Waiting, or Done, and your choices are remembered between sessions.
- **Your own to-dos** — add personal tasks alongside the email-based ones.
- **Recurring deadlines** that calculate their own next due date (monthly, relative to month-end, or every few weeks) — including bumping off weekends to the nearest workday.
- **Reply detection** — on each refresh it checks your Sent folder and moves anything you've already answered into Waiting or Done.
- **Delegation aware** — if someone who reports to you has handled a thread, it's marked accordingly with a note; anything that asks *you* directly stays on your list.
- **Built-in safety** — suspicious or phishing-style messages (e.g. unexpected payment requests) are flagged in a separate "Verify" zone instead of becoming tasks.

---

## 🧠 How it works (in plain terms)

This project is less about heavy code and more about **turning a messy real-world process into clear, automatable rules**. A few examples of the design thinking:

- **Date math, done for you.** Instead of typing deadlines, you describe them once ("the 15th of each month," "3 workdays before month-end," "every 2 weeks on Monday"). The tool computes the next date each time it opens, and applies a weekend rule so a deadline never lands on a Saturday or Sunday.
- **It remembers.** Most simple web pages forget everything when you close them. This one saves your statuses, your personal to-dos, and which recurring cycles you've completed — so it picks up exactly where you left off.
- **It reconciles, not just lists.** A refresh doesn't wipe your work — it compares the inbox against what you've already sent and updates only what changed, leaving your manual notes untouched.
- **Judgment built into rules.** The "is this mine or my report's?" decision and the "is this real or phishing?" check are encoded as consistent rules, so nothing slips through and nothing risky is auto-actioned.

📄 See [`tracker-demo.tsx`](./tracker-demo.tsx) for the working version with safe, made-up sample data.

---

## 🗂️ What's in this repo

| File | What it is |
|---|---|
| `README.md` | This overview + the setup guide below |
| `tracker-demo.tsx` | The interactive tracker with sample data (no real information) |

---

# 📘 Team Setup Guide

A simple way to turn your Outlook inbox into a living to-do list that Claude keeps up to date. You build your **own** copy — it reads *your* mailbox, not anyone else's.

## Before you start

You'll need the **Microsoft 365 connector** turned on in Claude (so it can read your Outlook inbox and Sent Items). If it isn't connected, Claude will prompt you, or you can enable it from the connectors/tools menu.

## 1. Create your tracker

Open a chat with Claude and paste:

> **Scan my Outlook inbox for the emails that need action, and build me an interactive to-do tracker. For each item include a plain-language summary, the specific action needed from me, a status I can set (To Do / Waiting / Done), and a link to open the original email. Add a section where I can type my own to-dos, and flag any suspicious/phishing emails separately instead of as tasks.**

Claude will scan, then create the tracker as an artifact you can interact with.

## 2. Use it day to day

- **Change a status** — click the circle to cycle To Do → Waiting → Done, or tap a status label directly.
- **Add your own to-do** — type it in the *My To-Dos* box and press Enter.
- **Open an email** — use the *Open in Outlook* link on any card.
- **Refresh it** — each morning (or whenever), just say **"update"** or **"re-scan my inbox."** Claude pulls in new emails, checks your **Sent Items**, and moves anything you've already replied to into *Waiting* or *Done*. Your manual to-dos and your own marks are left alone.

> 💡 **Tip — keep updates fast and low-cost.** When you first set up your tracker, tell Claude:
> *"When I ask you to update, please make small targeted edits to only the items that changed, instead of rewriting the whole tracker — and give me a short text summary of what changed."*
> This way each refresh only touches the few tasks that actually moved, instead of re-printing the entire tracker every time.

## 3. Set up your recurring deadlines

Tell Claude your recurring tasks in plain language and it will add them to a **Recurring Deadlines** section that auto-calculates the next due date every time you open the tracker.

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

> "Change my [task] to the 20th instead of the 15th."
> "My remittance is now weekly on Fridays."
> "Remove the [task] recurring deadline."

## 4. If you have people who report to you

Tell Claude up front so it can route tasks correctly:

> **"[Name] reports to me — if they've replied to or handled a thread, mark it Done/Waiting with a note on what they did, but keep anything that asks me directly on my list."**

## 5. Make it stick across new chats (optional)

> "Please remember my recurring deadlines and that I keep an inbox to-do tracker."

Then in any future chat you can simply say **"rebuild my tracker."**

## 6. A note on the "Verify" zone

Claude parks anything that looks like phishing or payment fraud in a separate **Verify — do not action** box rather than turning it into a task. Always confirm those through a known channel before acting on them.

---

## Quick reference — handy phrases

- *"Update / re-scan my inbox"* — refresh tasks and reply statuses
- *"Update with small edits only"* — refresh cheaply, without re-printing the whole tracker
- *"Add a recurring deadline: …"* — set up an auto-calculated due date
- *"Change my [task] to …"* — edit a recurring rule
- *"[Name] reports to me…"* — turn on delegation handling
- *"Rebuild my tracker"* — recreate it in a new chat (after Claude remembers your setup)

---

*This project demonstrates using AI to design and automate a real-world workflow: defining clear rules, handling dates and edge cases, building in memory, and accounting for safety and delegation.*
