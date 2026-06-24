// ============================================================
// INBOX TO-DO TRACKER — DEMO VERSION
// Everything below uses MADE-UP sample data. No real names,
// companies, invoices, or email links. Safe to share publicly.
//
// Plain-language map of what the pieces do:
//   - SAMPLE_TASKS .... the example to-do cards (fake)
//   - RECURRING ....... deadlines that calculate their own next date
//   - "storage" ....... how it remembers your checkmarks after you close it
// ============================================================

import { useState, useEffect } from "react";
import { Check, Clock, Circle, Mail, AlertTriangle, Paperclip, Star, RefreshCw, ExternalLink, ArrowRight, Plus, X, ListChecks, CalendarClock, Undo2, User } from "lucide-react";

// --- The example email tasks (all fake) ---
// "detected" = the status the auto-scan would set. null means "leave it alone".
const SAMPLE_TASKS = [
  { id: "vendor", subject: "New vendor setup request", senderName: "Procurement Team", date: "Today", importance: "normal", attachment: true, detected: null,
    summary: "A teammate sent the forms to add a new vendor to the system.",
    action: "Set the vendor up, then confirm once it's done." },
  { id: "approve", subject: "Payments pending your approval", senderName: "Payments Portal", date: "Today", importance: "normal", attachment: false, detected: null,
    summary: "Automated reminder that some payments are waiting for your sign-off.",
    action: "Review and approve the pending payments." },
  { id: "contract", subject: "Contract for your review", senderName: "Legal", date: "Yesterday", importance: "high", attachment: true, detected: null,
    summary: "Legal sent an agreement that needs a look before signing.",
    action: "Review the agreement and the attachment." },
  { id: "bill-question", subject: "Question: which department to bill?", senderName: "Sam Lee", date: "Yesterday", importance: "normal", attachment: false, detected: null,
    summary: "Sam isn't sure which department an invoice belongs to and is asking you.",
    action: "Tell Sam which department to bill.",
    report: "Sam reports to you, but is asking for your help — so this stays on your list." },
  { id: "recon", subject: "Monthly reconciliation follow-up", senderName: "Finance Ops", date: "2 days ago", importance: "normal", attachment: false, detected: "waiting",
    summary: "You replied with a question and are now waiting to hear back.",
    action: "Awaiting their answer before you can close this out." },
  { id: "resend", subject: "Invoice #1042 — attachment missing", senderName: "Alex Carter", date: "2 days ago", importance: "normal", attachment: false, detected: "done",
    summary: "Alex pointed out a file was missing. You re-sent it.",
    action: "Re-send the file — done.",
    report: "Alex (your report) flagged it; you've handled it, so it's marked Done." },
];

// --- Example phishing / verify item (fake) ---
const SUSPICIOUS = [
  { id: "s1", subject: "URGENT: please arrange this payment", sender: "unknown external sender",
    note: "Unexpected payment request from someone you don't recognize. Verify through a known channel before doing anything — never act on it directly." },
];

// ============================================================
// RECURRING DEADLINES
// These three examples calculate their OWN next due date every
// time the page opens — you never type a date.
// ============================================================
const stripTime = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const isWeekend = (d) => d.getDay() === 0 || d.getDay() === 6;          // Sun=0, Sat=6
const lastOfMonth = (y, m) => new Date(y, m + 1, 0);
const subWorkdays = (date, n) => { const d = new Date(date); let r = n; while (r > 0) { d.setDate(d.getDate() - 1); if (!isWeekend(d)) r--; } return d; };
const rollBack = (date) => { const d = new Date(date); while (isWeekend(d)) d.setDate(d.getDate() - 1); return d; }; // weekend -> earlier workday
const TODAY = stripTime(new Date());

const RECURRING = [
  { id: "reportA", title: "Report A due", rule: "Monthly · the 15th (earlier workday if weekend)",
    gen: () => { const out = []; for (let i = 0; i < 24; i++) out.push(rollBack(new Date(TODAY.getFullYear(), TODAY.getMonth() + i, 15))); return out.filter(d => d >= TODAY).sort((a, b) => a - b); } },
  { id: "reportB", title: "Report B due", rule: "Monthly · 3 workdays before month-end",
    gen: () => { const out = []; for (let i = 0; i < 24; i++) out.push(rollBack(subWorkdays(lastOfMonth(TODAY.getFullYear(), TODAY.getMonth() + i), 3))); return out.filter(d => d >= TODAY).sort((a, b) => a - b); } },
  { id: "remit", title: "Remittance due", rule: "Every 2 weeks · Monday",
    gen: () => { const anchor = new Date(2026, 0, 5); let d = new Date(anchor); while (d < TODAY) d.setDate(d.getDate() + 14); const out = []; for (let i = 0; i < 27; i++) { const x = new Date(d); x.setDate(d.getDate() + i * 14); out.push(x); } return out; } },
];

const pad = (n) => String(n).padStart(2, "0");
const isoKey = (id, d) => `${id}:${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MO = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtDate = (d) => `${WD[d.getDay()]}, ${MO[d.getMonth()]} ${d.getDate()}`;
const daysUntil = (d) => Math.round((d - TODAY) / 86400000);

// --- Storage keys: the "labels" under which it saves your data ---
const STATUS_KEY = "demo-status";
const MANUAL_KEY = "demo-manual";
const RECUR_KEY = "demo-recur";
const STATUS = { todo: { label: "To Do", icon: Circle }, waiting: { label: "Waiting", icon: Clock }, done: { label: "Done", icon: Check } };
const ORDER = ["todo", "waiting", "done"];
const TONE = {
  todo: { bg: "bg-white", chip: "bg-slate-100 text-slate-600" },
  waiting: { bg: "bg-amber-50/60", chip: "bg-amber-100 text-amber-700" },
  done: { bg: "bg-emerald-50/50", chip: "bg-emerald-100 text-emerald-700" },
};

export default function TrackerDemo() {
  const [statuses, setStatuses] = useState({});
  const [manual, setManual] = useState([]);
  const [recurDone, setRecurDone] = useState({});
  const [draft, setDraft] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState("all");

  // When the page opens, load anything saved from last time.
  useEffect(() => {
    (async () => {
      let st = {}, man = [], rec = {};
      try { const r = await window.storage.get(STATUS_KEY); if (r && r.value) st = JSON.parse(r.value); } catch (e) {}
      try { const m = await window.storage.get(MANUAL_KEY); if (m && m.value) man = JSON.parse(m.value); } catch (e) {}
      try { const rc = await window.storage.get(RECUR_KEY); if (rc && rc.value) rec = JSON.parse(rc.value); } catch (e) {}
      // Apply the sample "detected" statuses the first time only.
      if (Object.keys(st).length === 0) { SAMPLE_TASKS.forEach(t => { if (t.detected) st[t.id] = t.detected; }); }
      setStatuses(st); setManual(man); setRecurDone(rec); setLoaded(true);
    })();
  }, []);

  const saveStatuses = async (n) => { setStatuses(n); try { await window.storage.set(STATUS_KEY, JSON.stringify(n)); } catch (e) {} };
  const saveManual = async (n) => { setManual(n); try { await window.storage.set(MANUAL_KEY, JSON.stringify(n)); } catch (e) {} };
  const saveRecur = async (n) => { setRecurDone(n); try { await window.storage.set(RECUR_KEY, JSON.stringify(n)); } catch (e) {} };

  const getStatus = (id) => statuses[id] || "todo";
  const cycle = (id) => saveStatuses({ ...statuses, [id]: ORDER[(ORDER.indexOf(getStatus(id)) + 1) % ORDER.length] });
  const setStatus = (id, s) => saveStatuses({ ...statuses, [id]: s });

  const addManual = () => { const t = draft.trim(); if (!t) return; saveManual([{ id: "m" + Date.now(), text: t, status: "todo" }, ...manual]); setDraft(""); };
  const cycleManual = (id) => saveManual(manual.map(m => m.id === id ? { ...m, status: ORDER[(ORDER.indexOf(m.status) + 1) % ORDER.length] } : m));
  const setManualStatus = (id, s) => saveManual(manual.map(m => m.id === id ? { ...m, status: s } : m));
  const removeManual = (id) => saveManual(manual.filter(m => m.id !== id));

  const recurState = (item) => { const occs = item.gen(); let i = 0; while (i < occs.length && recurDone[isoKey(item.id, occs[i])]) i++; return { current: occs[Math.min(i, occs.length - 1)], idx: i, occs }; };
  const markRecurDone = (item) => { const { current } = recurState(item); saveRecur({ ...recurDone, [isoKey(item.id, current)]: true }); };
  const undoRecur = (item) => { const { occs, idx } = recurState(item); if (idx > 0) { const n = { ...recurDone }; delete n[isoKey(item.id, occs[idx - 1])]; saveRecur(n); } };

  const matches = (s) => filter === "all" || s === filter;
  const allCount = SAMPLE_TASKS.length + manual.length;
  const countOf = (k) => SAMPLE_TASKS.filter(t => getStatus(t.id) === k).length + manual.filter(m => m.status === k).length;
  const visTasks = SAMPLE_TASKS.filter(t => matches(getStatus(t.id)));
  const visManual = manual.filter(m => matches(m.status));

  if (!loaded) return <div className="p-8 text-slate-400 text-sm">Loading…</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 font-sans text-slate-800">
      <div className="flex items-center gap-2 mb-1">
        <div className="bg-indigo-600 text-white rounded-lg p-2"><Mail size={20} /></div>
        <div>
          <h1 className="text-xl font-bold leading-tight">Inbox To-Do Tracker</h1>
          <p className="text-xs text-slate-500">Demo with sample data · {SAMPLE_TASKS.length} examples</p>
        </div>
      </div>
      <p className="text-[11px] text-slate-400 mb-4 italic">Everything shown here is made up — a safe preview of the tool.</p>

      {/* RECURRING DEADLINES */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2"><CalendarClock size={16} className="text-indigo-600" /><h2 className="font-semibold text-sm">Recurring Deadlines</h2><span className="text-xs text-slate-400">auto-calculated</span></div>
        <div className="grid gap-2 sm:grid-cols-3">
          {RECURRING.map(item => {
            const { current, idx } = recurState(item);
            const dleft = daysUntil(current);
            const urgent = dleft <= 1, soon = dleft <= 3, week = dleft <= 7;
            const tone = urgent ? "border-rose-300 bg-rose-50" : soon ? "border-rose-200 bg-rose-50/60" : week ? "border-amber-200 bg-amber-50/60" : "border-slate-200 bg-white";
            const dtone = urgent || soon ? "text-rose-700" : week ? "text-amber-700" : "text-slate-500";
            const label = dleft === 0 ? "Due today" : dleft === 1 ? "Due tomorrow" : dleft < 0 ? `${-dleft}d overdue` : `in ${dleft} days`;
            return (
              <div key={item.id} className={`rounded-xl border p-3 ${tone}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0"><h3 className="font-semibold text-sm">{item.title}</h3><p className="text-[11px] text-slate-400 mt-0.5">{item.rule}</p></div>
                  <button onClick={() => markRecurDone(item)} title="Mark this cycle done" className="shrink-0 h-6 w-6 rounded-full border border-slate-300 text-slate-300 hover:border-emerald-400 hover:text-emerald-500 flex items-center justify-center"><Check size={14} /></button>
                </div>
                <div className="mt-2"><p className="text-sm font-semibold">{fmtDate(current)}</p><p className={`text-xs font-medium ${dtone}`}>{label}</p></div>
                {idx > 0 && <button onClick={() => undoRecur(item)} className="mt-2 inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600"><Undo2 size={11} /> undo last done</button>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {[["all", `All (${allCount})`], ["todo", `To Do (${countOf("todo")})`], ["waiting", `Waiting (${countOf("waiting")})`], ["done", `Done (${countOf("done")})`]].map(([k, label]) => (
          <button key={k} onClick={() => setFilter(k)} className={`text-xs font-medium px-3 py-1.5 rounded-full border transition ${filter === k ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}>{label}</button>
        ))}
      </div>

      {/* MY TO-DOS */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2"><ListChecks size={16} className="text-indigo-600" /><h2 className="font-semibold text-sm">My To-Dos</h2><span className="text-xs text-slate-400">added by you</span></div>
        <div className="flex gap-2 mb-3">
          <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addManual(); }} placeholder="Add a to-do and press Enter…" className="flex-1 text-sm rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" />
          <button onClick={addManual} className="inline-flex items-center gap-1 bg-indigo-600 text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-indigo-700 transition"><Plus size={16} /> Add</button>
        </div>
        {visManual.length === 0 ? <p className="text-xs text-slate-400 px-1">{manual.length === 0 ? "No personal to-dos yet — add one above." : "None in this view."}</p> : (
          <div className="space-y-2">
            {visManual.map(m => {
              const Icon = STATUS[m.status].icon; const done = m.status === "done";
              return (
                <div key={m.id} className={`rounded-xl border border-slate-200 p-3 flex gap-3 items-start ${TONE[m.status].bg}`}>
                  <button onClick={() => cycleManual(m.id)} className={`shrink-0 h-6 w-6 rounded-full border flex items-center justify-center mt-0.5 ${done ? "bg-emerald-500 border-emerald-500 text-white" : m.status === "waiting" ? "border-amber-400 text-amber-500" : "border-slate-300 text-slate-300"}`}><Icon size={14} /></button>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${done ? "line-through text-slate-400" : "text-slate-700"}`}>{m.text}</p>
                    <div className="flex gap-1.5 mt-2">{ORDER.map(k => <button key={k} onClick={() => setManualStatus(m.id, k)} className={`text-[11px] px-2 py-0.5 rounded-md border transition ${m.status === k ? "border-transparent " + TONE[k].chip + " font-semibold" : "border-slate-200 text-slate-400 hover:text-slate-600"}`}>{STATUS[k].label}</button>)}</div>
                  </div>
                  <button onClick={() => removeManual(m.id)} className="shrink-0 text-slate-300 hover:text-rose-500 mt-0.5"><X size={16} /></button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FROM INBOX */}
      <div className="flex items-center gap-2 mb-2"><Mail size={16} className="text-indigo-600" /><h2 className="font-semibold text-sm">From Inbox</h2></div>
      <div className="space-y-3">
        {visTasks.map(t => {
          const s = getStatus(t.id); const Icon = STATUS[s].icon; const done = s === "done";
          return (
            <div key={t.id} className={`rounded-xl border border-slate-200 p-3 sm:p-4 flex gap-3 ${TONE[s].bg} transition`}>
              <button onClick={() => cycle(t.id)} className={`shrink-0 h-6 w-6 rounded-full border flex items-center justify-center mt-0.5 ${done ? "bg-emerald-500 border-emerald-500 text-white" : s === "waiting" ? "border-amber-400 text-amber-500" : "border-slate-300 text-slate-300"}`}><Icon size={14} /></button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap"><h3 className={`font-semibold text-sm ${done ? "line-through text-slate-400" : ""}`}>{t.subject}</h3>{t.importance === "high" && <Star size={13} className="text-rose-500 fill-rose-500 shrink-0" />}{t.attachment && <Paperclip size={12} className="text-slate-400 shrink-0" />}</div>
                <p className="text-xs mt-0.5 text-slate-500">{t.senderName} · {t.date}</p>
                <p className={`text-sm mt-2 ${done ? "text-slate-400" : "text-slate-600"}`}>{t.summary}</p>
                <div className={`mt-2 flex items-start gap-1.5 text-sm rounded-lg px-2.5 py-1.5 ${done ? "bg-slate-50 text-slate-400" : "bg-indigo-50 text-indigo-900"}`}><ArrowRight size={15} className="mt-0.5 shrink-0" /><span><span className="font-semibold">Action: </span>{t.action}</span></div>
                {t.report && <div className="mt-1.5 flex items-start gap-1.5 text-xs text-violet-700 bg-violet-50 rounded-lg px-2.5 py-1.5"><User size={13} className="mt-0.5 shrink-0" /><span><span className="font-semibold">Your report: </span>{t.report}</span></div>}
                <div className="flex items-center justify-between mt-2.5 gap-2 flex-wrap">
                  <div className="flex gap-1.5">{ORDER.map(k => <button key={k} onClick={() => setStatus(t.id, k)} className={`text-[11px] px-2 py-0.5 rounded-md border transition ${s === k ? "border-transparent " + TONE[k].chip + " font-semibold" : "border-slate-200 text-slate-400 hover:text-slate-600"}`}>{STATUS[k].label}</button>)}</div>
                  <a href="#" onClick={(e) => e.preventDefault()} className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-400 cursor-default" title="In the real version this opens the email">Open email (sample) <ExternalLink size={11} /></a>
                </div>
              </div>
            </div>
          );
        })}
        {visTasks.length === 0 && <p className="text-sm text-slate-400 py-4 text-center">No items in this view.</p>}
      </div>

      {/* VERIFY ZONE */}
      <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4">
        <div className="flex items-center gap-2 mb-2"><AlertTriangle size={16} className="text-rose-600" /><h2 className="font-semibold text-sm text-rose-800">Verify — do not action (possible phishing)</h2></div>
        <div className="space-y-2">{SUSPICIOUS.map(s => (
          <div key={s.id} className="text-xs text-rose-900/90 bg-white/60 rounded-lg p-2.5"><p className="font-semibold">{s.subject}</p><p className="text-rose-700/80">{s.sender}</p><p className="mt-1">{s.note}</p></div>
        ))}</div>
      </div>

      <div className="mt-4 flex items-start gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg p-3"><RefreshCw size={14} className="mt-0.5 shrink-0" /><p>Your checkmarks save automatically and come back next time. Recurring deadlines work out their own next date. Try it: click a circle, add a to-do, or tick a recurring deadline and watch it roll to the next cycle.</p></div>
    </div>
  );
}
