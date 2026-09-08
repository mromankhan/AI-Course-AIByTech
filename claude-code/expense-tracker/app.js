/* Ledger — expense tracker.
   Port of the Claude Design canvas "Expense Tracker.dc.html" (Nocturne DS)
   to a standalone app: vanilla state + render, no framework. */

const CATS = {
  food:      { label: "Food",      icon: "ph-fork-knife",   color: "#b5abfc", tint: "rgba(181,171,252,.14)" },
  transport: { label: "Transport", icon: "ph-car-profile",  color: "#9690c9", tint: "rgba(150,144,201,.16)" },
  home:      { label: "Home",      icon: "ph-house-line",   color: "#796cbf", tint: "rgba(121,108,191,.18)" },
  shopping:  { label: "Shopping",  icon: "ph-shopping-bag", color: "#d2cefd", tint: "rgba(210,206,253,.12)" },
  fun:       { label: "Fun",       icon: "ph-film-slate",   color: "#8f93ab", tint: "rgba(143,147,171,.16)" },
  health:    { label: "Health",    icon: "ph-pill",         color: "#5d5294", tint: "rgba(93,82,148,.22)" }
};

const SEED = [
  ["Blue Tokai", "food", 480, "Aug 28", "9:12 AM"],
  ["Uber to work", "transport", 310, "Aug 28", "8:40 AM"],
  ["Swiggy — dinner", "food", 745, "Aug 27", "8:55 PM"],
  ["Metro card", "transport", 120, "Aug 27", "6:20 PM"],
  ["Apollo Pharmacy", "health", 430, "Aug 27", "11:05 AM"],
  ["Big Basket", "food", 3120, "Aug 26", "7:30 PM"],
  ["PVR — Kalki 2", "fun", 640, "Aug 26", "4:10 PM"],
  ["Zara", "shopping", 2299, "Aug 24", "5:44 PM"],
  ["Third Wave Coffee", "food", 260, "Aug 24", "10:02 AM"],
  ["Indian Oil", "transport", 2400, "Aug 21", "8:15 AM"],
  ["Amazon", "shopping", 1149, "Aug 21", "1:30 PM"],
  ["Uber — airport", "transport", 268, "Aug 21", "6:02 AM"],
  ["Toit — dinner out", "food", 1840, "Aug 12", "9:20 PM"],
  ["BESCOM electricity", "home", 1450, "Aug 12", "10:00 AM"],
  ["ACT Fibernet", "home", 799, "Aug 5", "9:00 AM"],
  ["Spotify", "fun", 199, "Aug 5", "9:00 AM"],
  ["Rent — August", "home", 12000, "Aug 1", "10:30 AM"]
];

const MONTHS = [["Mar", 31200], ["Apr", 35800], ["May", 29400], ["Jun", 38900], ["Jul", 33100]];
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"];
const SIX_MONTH_AVG = 33880;
const TOAST_MS = 3200;

/* ── state ─────────────────────────────────────────────────────────────── */

const state = {
  screen: "home",
  txns: SEED.map((s, i) => ({ id: i + 1, name: s[0], cat: s[1], amount: s[2], day: s[3], time: s[4] })),
  amount: "",
  cat: null,
  note: null,
  filter: "all",
  openId: null,
  toast: null,
  ringReady: false
};

const props = { homeVariant: "Arc", entryVariant: "Keypad first", monthlyBudget: 40000 };

let toastTimer = null;

function setState(patch) {
  Object.assign(state, typeof patch === "function" ? patch(state) : patch);
  render();
}

const fmt = n => "₹" + Math.round(n).toLocaleString("en-IN");

function go(screen) { setState({ screen, openId: null }); }

function press(k) {
  setState(s => {
    let a = s.amount;
    if (k === "del") a = a.slice(0, -1);
    else if (k === ".") a = a.includes(".") ? a : (a === "" ? "0." : a + ".");
    else if (a.replace(".", "").length < 7) a = (a === "0" ? "" : a) + k;
    return { amount: a };
  });
}

/* schedules the toast's own dismissal and hands the message back to the caller */
function flashToast(message) {
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => setState({ toast: null }), TOAST_MS);
  return message;
}

function save() {
  const amt = parseFloat(state.amount);
  if (!amt) return;
  const cat = state.cat || "food";
  const name = state.note || (state.cat ? CATS[cat].label + " — cash" : "Quick expense");
  const txn = { id: Date.now(), name, cat, amount: amt, day: "Aug 28", time: "9:41 AM" };
  setState(s => ({
    txns: [txn, ...s.txns], amount: "", cat: null, note: null, screen: "home",
    toast: flashToast(fmt(amt) + " logged to " + CATS[cat].label + ". Still under pace — nice one.")
  }));
}

/* ── derived values ────────────────────────────────────────────────────── */

function derive() {
  const S = state;
  const budget = props.monthlyBudget;
  const spent = S.txns.reduce((a, t) => a + t.amount, 0);
  const left = Math.max(budget - spent, 0);
  const daysLeft = 4;
  const pct = Math.min(spent / budget, 1);
  const today = S.txns.filter(t => t.day === "Aug 28").reduce((a, t) => a + t.amount, 0);

  const byCat = {};
  S.txns.forEach(t => { byCat[t.cat] = (byCat[t.cat] || 0) + t.amount; });
  const catList = Object.keys(byCat).sort((a, b) => byCat[b] - byCat[a]);
  const maxCat = byCat[catList[0]] || 1;

  const deco = t => ({ icon: CATS[t.cat].icon, color: CATS[t.cat].color, tint: CATS[t.cat].tint });
  const meta = t => CATS[t.cat].label + " · " + t.time;

  /* ledger groups, in the order the days first appear */
  const filtered = S.filter === "all" ? S.txns : S.txns.filter(t => t.cat === S.filter);
  const order = [];
  filtered.forEach(t => { if (!order.includes(t.day)) order.push(t.day); });
  const groups = order.map(day => {
    const items = filtered.filter(t => t.day === day);
    return {
      label: day === "Aug 28" ? "Today" : day === "Aug 27" ? "Yesterday" : day,
      totalFmt: fmt(items.reduce((a, t) => a + t.amount, 0)),
      items: items.map(t => ({
        name: t.name, amountFmt: fmt(t.amount), meta: meta(t), ...deco(t),
        open: S.openId === t.id,
        rowBg: S.openId === t.id ? "#2a2d3e" : "var(--color-surface)",
        catLabel: CATS[t.cat].label,
        share: Math.round((t.amount / byCat[t.cat]) * 100) + "%",
        detail: "Paid by UPI · " + t.day + ", " + t.time + " · counted in your August "
          + CATS[t.cat].label.toLowerCase() + " total of " + fmt(byCat[t.cat]) + ".",
        toggle: () => setState(s => ({ openId: s.openId === t.id ? null : t.id }))
      }))
    };
  });

  const chipDef = [["all", "All"]].concat(catList.map(c => [c, CATS[c].label]));
  const filterChips = chipDef.map(([k, label]) => {
    const on = S.filter === k;
    return {
      label, select: () => setState({ filter: k, openId: null }),
      bg: on ? "rgba(145,132,217,.18)" : "transparent",
      fg: on ? "var(--color-accent-200)" : "color-mix(in srgb, var(--color-text) 62%, transparent)",
      border: on ? "var(--color-accent-600)" : "var(--color-divider)"
    };
  });

  /* donut — each arc offset by the running share before it */
  let acc = 0;
  const C = 2 * Math.PI * 15.9;
  const donut = catList.map(c => {
    const share = byCat[c] / spent;
    const len = S.ringReady ? share * C : 0;
    const seg = {
      label: CATS[c].label, color: CATS[c].color, pct: Math.round(share * 100) + "%",
      dash: len.toFixed(2) + " " + (C - len).toFixed(2),
      offset: (-acc * C).toFixed(2)
    };
    acc += share;
    return seg;
  });

  const monthVals = MONTHS.concat([["Aug", spent]]);
  const maxM = Math.max(...monthVals.map(m => m[1]));
  const months = monthVals.map(([k, v], i) => ({
    k, label: fmt(v / 1000).replace("₹", "") + "k",
    h: S.ringReady ? Math.round(14 + (v / maxM) * 86) + "%" : "0%",
    fill: i === monthVals.length - 1 ? "linear-gradient(to top,#5d5294,#b5abfc)" : "#2f3247",
    glow: i === monthVals.length - 1 ? "0 0 18px rgba(145,132,217,.35)" : "none"
  }));

  const counts = {};
  S.txns.forEach(t => {
    const key = t.name.split(" — ")[0];
    counts[key] = counts[key] || { name: key, count: 0, total: 0, cat: t.cat };
    counts[key].count++; counts[key].total += t.amount;
  });
  const merchants = Object.values(counts).sort((a, b) => b.total - a.total).slice(0, 3)
    .map(m => ({ name: m.name, count: m.count, totalFmt: fmt(m.total), ...deco(m) }));

  const catTiles = Object.keys(CATS).map(k => {
    const on = S.cat === k;
    return {
      label: CATS[k].label, icon: CATS[k].icon, color: CATS[k].color,
      bg: on ? "rgba(145,132,217,.16)" : "#20222f",
      border: on ? "var(--color-accent-500)" : "#313445",
      select: () => setState({ cat: k })
    };
  });

  const notePresets = ["Cash", "UPI", "Card"].map(n => {
    const on = S.note === n;
    return {
      label: n,
      bg: on ? "rgba(145,132,217,.14)" : "transparent",
      border: on ? "var(--color-accent-600)" : "var(--color-divider)",
      select: () => setState(s => ({ note: s.note === n ? null : n }))
    };
  });

  const keys = KEYS.map(k => ({
    label: k, isIcon: k === "del", icon: "ph-backspace",
    bg: k === "del" ? "transparent" : "#20222f",
    border: k === "del" ? "transparent" : "#2e3142",
    fg: k === "del" ? "color-mix(in srgb, var(--color-text) 60%, transparent)" : "var(--color-text)",
    press: () => press(k)
  }));

  const canSave = parseFloat(S.amount) > 0;
  const navItem = (id, label, icon) => ({
    label, go: () => go(id),
    icon: (S.screen === id ? "ph-fill " : "ph ") + icon,
    color: S.screen === id ? "var(--color-accent-300)" : "color-mix(in srgb, var(--color-text) 48%, transparent)"
  });

  return {
    isHome: S.screen === "home", isLedger: S.screen === "ledger",
    isInsights: S.screen === "insights", isAdd: S.screen === "add",
    showNav: S.screen !== "add", toast: S.toast,
    homeArc: props.homeVariant === "Arc", homeLedger: props.homeVariant === "Ledger",
    entryKeypadFirst: props.entryVariant === "Keypad first",
    entryChipsFirst: props.entryVariant === "Category first",

    spentFmt: fmt(spent), budgetFmt: fmt(budget), leftFmt: fmt(left),
    todayFmt: fmt(today), dailyFmt: fmt(left / daysLeft), daysLeft,
    usedPct: Math.round(pct * 100) + "%",
    ringDash: (S.ringReady ? (pct * 2 * Math.PI * 52).toFixed(1) : "0") + " 999",
    txnCount: S.txns.length,
    paceCopy: "August is tracking " + fmt(Math.abs(spent - SIX_MONTH_AVG)) + " "
      + (spent < SIX_MONTH_AVG ? "below" : "above")
      + " your six-month average. Food and home carry most of it — rent alone is "
      + Math.round(((byCat.home || 0) / spent) * 100) + "% of the month.",

    topCats: catList.slice(0, 4).map(c => ({
      label: CATS[c].label, icon: CATS[c].icon, color: CATS[c].color, tint: CATS[c].tint,
      amountFmt: fmt(byCat[c]),
      pct: (S.ringReady ? Math.round((byCat[c] / maxCat) * 100) : 0) + "%",
      open: () => setState({ screen: "ledger", filter: c, openId: null })
    })),
    recent: S.txns.slice(0, 3).map(t => ({ name: t.name, amountFmt: fmt(t.amount), meta: meta(t), ...deco(t) })),
    groups, filterChips, donut, months, merchants, catTiles, notePresets, keys,
    filterSummary: S.filter === "all" ? "All categories · August" : CATS[S.filter].label + " · August",
    filteredTotalFmt: fmt(filtered.reduce((a, t) => a + t.amount, 0)),

    amountDisplay: S.amount === "" ? "0" : S.amount,
    amountColor: S.amount === "" ? "color-mix(in srgb, var(--color-text) 32%, transparent)" : "var(--color-text)",
    amountStepLabel: props.entryVariant === "Category first" ? "2 · How much" : "How much",
    saveLabel: canSave ? "Save expense" : "Enter an amount",
    saveBg: canSave ? "rgba(145,132,217,.14)" : "transparent",
    saveBorder: canSave ? "var(--color-accent)" : "var(--color-divider)",
    saveFg: canSave ? "var(--color-accent-200)" : "color-mix(in srgb, var(--color-text) 45%, transparent)",
    saveOpacity: canSave ? 1 : 0.55,
    save, cancel: () => go("home"),
    goAdd: () => setState({ screen: "add" }),
    goLedger: () => setState({ screen: "ledger", filter: "all", openId: null }),
    goInsights: () => go("insights"),
    navLeft: [navItem("home", "Home", "ph-house"), navItem("ledger", "Ledger", "ph-list-dashes")],
    navRight: [navItem("insights", "Insights", "ph-chart-donut"), {
      label: "You", icon: "ph ph-user",
      color: "color-mix(in srgb, var(--color-text) 30%, transparent)",
      go: () => setState({ toast: flashToast("Profile & settings aren't in this round — say the word and I'll design them.") })
    }]
  };
}

/* ── template helpers ──────────────────────────────────────────────────── */

const esc = s => String(s).replace(/[&<>"']/g, c =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

let handlers = [];
/* registers a click handler and returns the attribute that binds it */
const on = fn => (handlers.push(fn), ` data-act="${handlers.length - 1}"`);

const MUTED = p => `color-mix(in srgb, var(--color-text) ${p}%, transparent)`;
const LABEL = `font-size:11px;letter-spacing:.09em;text-transform:uppercase;color:${MUTED(45)}`;

const iconChip = (o, size) => `
  <div style="width:${size}px;height:${size}px;flex:none;border-radius:${size > 30 ? 9 : 8}px;
    display:grid;place-items:center;font-size:${size > 30 ? 16 : 15}px;
    background:${o.tint};color:${o.color}"><i class="ph ${o.icon}"></i></div>`;

const txnRow = t => `
  <div style="display:flex;align-items:center;gap:12px;padding:11px 12px;border-radius:12px;
    background:var(--color-surface);box-shadow:var(--shadow-sm)">
    ${iconChip(t, 30)}
    <div style="flex:1;min-width:0">
      <div style="font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(t.name)}</div>
      <div style="font-size:11.5px;color:${MUTED(50)}">${esc(t.meta)}</div>
    </div>
    <div style="font-family:var(--font-heading);font-size:14.5px;font-weight:500">${t.amountFmt}</div>
  </div>`;

/* ── screens ───────────────────────────────────────────────────────────── */

function homeScreen(v) {
  return `
  <div class="page">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
      <div style="display:flex;flex-direction:column;gap:2px">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.09em;color:${MUTED(45)}">August · Day 28</div>
        <div style="font-family:var(--font-heading);font-weight:500;font-size:21px;letter-spacing:-.015em">Hey Aanya</div>
      </div>
      <div style="width:38px;height:38px;border-radius:50%;display:grid;place-items:center;
        background:var(--color-accent-900);box-shadow:0 0 0 1px var(--color-accent-700);
        font-size:17px;color:var(--color-accent-300)"><i class="ph ph-bell"></i></div>
    </div>

    ${v.homeArc ? `
    <div style="position:relative;border-radius:18px;padding:22px 20px 20px;
      background:linear-gradient(165deg,#242741,#1b1d2c 70%);
      box-shadow:0 0 0 1px #34374a,0 10px 30px rgba(0,0,0,.4);overflow:hidden">
      <div style="position:absolute;inset:-40% -30% auto auto;width:260px;height:260px;border-radius:50%;
        background:radial-gradient(circle,rgba(145,132,217,.22),transparent 65%)"></div>
      <div style="position:relative;display:flex;align-items:center;gap:20px">
        <div style="position:relative;width:118px;height:118px;flex:none">
          <svg viewBox="0 0 120 120" style="width:118px;height:118px;transform:rotate(-90deg)">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#2f3247" stroke-width="9"></circle>
            <circle cx="60" cy="60" r="52" fill="none" stroke="#9184d9" stroke-width="9" stroke-linecap="round"
              stroke-dasharray="${v.ringDash}" style="transition:stroke-dasharray .9s cubic-bezier(.2,.8,.2,1)"></circle>
          </svg>
          <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px">
            <div style="font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:${MUTED(45)}">used</div>
            <div style="font-family:var(--font-heading);font-size:25px;font-weight:500;letter-spacing:-.02em">${v.usedPct}</div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;min-width:0">
          <div>
            <div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:${MUTED(45)}">Left to spend</div>
            <div style="font-family:var(--font-heading);font-size:31px;font-weight:500;letter-spacing:-.03em;line-height:1.1">${v.leftFmt}</div>
          </div>
          <div style="font-size:12.5px;line-height:1.45;color:${MUTED(62)};text-wrap:pretty">${v.spentFmt} of ${v.budgetFmt} spent · ${v.daysLeft} days to go</div>
        </div>
      </div>
      <div style="position:relative;margin-top:18px;display:flex;align-items:center;gap:9px;padding:10px 12px;
        border-radius:10px;background:rgba(145,132,217,.12);box-shadow:0 0 0 1px rgba(145,132,217,.28)">
        <i class="ph-fill ph-confetti" style="font-size:16px;color:var(--color-accent-300)"></i>
        <div style="font-size:12.5px;line-height:1.4;color:var(--color-accent-200)">You're pacing under budget — <strong style="font-weight:600">${v.dailyFmt}/day</strong> keeps it that way.</div>
      </div>
    </div>` : ""}

    ${v.homeLedger ? `
    <div style="display:flex;flex-direction:column;gap:14px">
      <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:12px">
        <div>
          <div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:${MUTED(45)}">Spent this month</div>
          <div style="font-family:var(--font-heading);font-size:44px;font-weight:500;letter-spacing:-.035em;line-height:1.05">${v.spentFmt}</div>
        </div>
        <div style="text-align:right;font-size:12px;line-height:1.4;color:${MUTED(58)}">of ${v.budgetFmt}<br><span style="color:var(--color-accent-300)">${v.leftFmt} left</span></div>
      </div>
      <div style="height:7px;border-radius:99px;background:#2f3247;overflow:hidden">
        <div style="height:100%;border-radius:99px;background:linear-gradient(90deg,#5d5294,#b5abfc);
          width:${v.usedPct};transition:width .9s cubic-bezier(.2,.8,.2,1)"></div>
      </div>
      <div style="display:flex;gap:9px">
        ${[["Safe daily", v.dailyFmt], ["Today", v.todayFmt], ["Days left", v.daysLeft]].map(([k, val]) => `
        <div style="flex:1;padding:11px 12px;border-radius:12px;background:var(--color-surface);box-shadow:var(--shadow-sm)">
          <div style="font-size:10.5px;letter-spacing:.07em;text-transform:uppercase;color:${MUTED(45)}">${k}</div>
          <div style="font-family:var(--font-heading);font-size:19px;font-weight:500;margin-top:2px">${val}</div>
        </div>`).join("")}
      </div>
    </div>` : ""}

    <div style="display:flex;flex-direction:column;gap:11px">
      <div style="display:flex;align-items:baseline;justify-content:space-between">
        <div style="${LABEL}">Where it went</div>
        <button${on(v.goInsights)} class="btn btn-ghost" style="font-size:12px">All insights</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${v.topCats.map(c => `
        <button${on(c.open)} class="cat-row" style="display:flex;align-items:center;gap:11px;width:100%;
          text-align:left;background:transparent;border:0;padding:0;cursor:pointer;
          font-family:var(--font-body);color:var(--color-text)">
          ${iconChip(c, 32)}
          <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:5px">
            <div style="display:flex;justify-content:space-between;gap:8px;font-size:13.5px">
              <span>${esc(c.label)}</span><span style="color:${MUTED(70)}">${c.amountFmt}</span>
            </div>
            <div style="height:4px;border-radius:99px;background:#2b2e3d;overflow:hidden">
              <div style="height:100%;border-radius:99px;background:${c.color};width:${c.pct};transition:width .8s ease"></div>
            </div>
          </div>
        </button>`).join("")}
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:10px">
      <div style="display:flex;align-items:baseline;justify-content:space-between">
        <div style="${LABEL}">Latest</div>
        <button${on(v.goLedger)} class="btn btn-ghost" style="font-size:12px">See all</button>
      </div>
      ${v.recent.map(txnRow).join("")}
    </div>
  </div>`;
}

function ledgerScreen(v) {
  return `
  <div class="page" style="gap:16px">
    <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:12px">
      <div>
        <div style="font-family:var(--font-heading);font-size:23px;font-weight:500;letter-spacing:-.02em">Transactions</div>
        <div style="font-size:12px;color:${MUTED(52)}">${esc(v.filterSummary)}</div>
      </div>
      <div style="font-family:var(--font-heading);font-size:20px;font-weight:500">${v.filteredTotalFmt}</div>
    </div>

    <div class="scr" style="display:flex;gap:7px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px">
      ${v.filterChips.map(f => `
      <button${on(f.select)} class="tag tag-outline" style="flex:none;border-radius:99px;padding:6px 12px;
        font-size:12.5px;cursor:pointer;background:${f.bg};color:${f.fg};border-color:${f.border}">${esc(f.label)}</button>`).join("")}
    </div>

    <div style="display:flex;flex-direction:column;gap:18px">
      ${v.groups.map(g => `
      <div style="display:flex;flex-direction:column;gap:8px">
        <div style="display:flex;justify-content:space-between;align-items:baseline;font-size:11px;
          letter-spacing:.08em;text-transform:uppercase;color:${MUTED(42)}">
          <span>${esc(g.label)}</span><span>${g.totalFmt}</span>
        </div>
        ${g.items.map(t => `
        <button${on(t.toggle)} style="display:block;width:100%;text-align:left;padding:0;border:0;cursor:pointer;
          background:${t.rowBg};border-radius:12px;box-shadow:var(--shadow-sm);
          font-family:var(--font-body);color:var(--color-text);overflow:hidden;transition:background .2s">
          <div style="display:flex;align-items:center;gap:12px;padding:11px 12px">
            ${iconChip(t, 30)}
            <div style="flex:1;min-width:0">
              <div style="font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(t.name)}</div>
              <div style="font-size:11.5px;color:${MUTED(50)}">${esc(t.meta)}</div>
            </div>
            <div style="font-family:var(--font-heading);font-size:14.5px;font-weight:500">${t.amountFmt}</div>
          </div>
          ${t.open ? `
          <div style="padding:0 12px 12px 54px;display:flex;flex-direction:column;gap:8px;animation:riseIn .22s ease both">
            <div style="height:1px;background:linear-gradient(to right,transparent,rgba(233,233,237,.16) 24px,rgba(233,233,237,.16) calc(100% - 24px),transparent)"></div>
            <div style="font-size:12px;line-height:1.5;color:${MUTED(62)}">${esc(t.detail)}</div>
            <div style="display:flex;gap:7px">
              <span class="tag tag-outline" style="font-size:11px">${esc(t.catLabel)}</span>
              <span class="tag tag-accent" style="font-size:11px">${t.share} of ${esc(t.catLabel)}</span>
            </div>
          </div>` : ""}
        </button>`).join("")}
      </div>`).join("")}
    </div>
  </div>`;
}

function insightsScreen(v) {
  return `
  <div class="page" style="gap:22px">
    <div>
      <div style="font-family:var(--font-heading);font-size:23px;font-weight:500;letter-spacing:-.02em">Insights</div>
      <div style="font-size:12px;color:${MUTED(52)}">August 2026 · ${v.txnCount} expenses</div>
    </div>

    <div style="display:flex;align-items:center;gap:18px;padding:18px 16px;border-radius:16px;
      background:linear-gradient(165deg,#242741,#1b1d2c 70%);box-shadow:0 0 0 1px #34374a">
      <div style="position:relative;width:132px;height:132px;flex:none">
        <svg viewBox="0 0 42 42" style="width:132px;height:132px;transform:rotate(-90deg)">
          ${v.donut.map(d => `
          <circle cx="21" cy="21" r="15.9" fill="none" stroke="${d.color}" stroke-width="5.4"
            stroke-dasharray="${d.dash}" stroke-dashoffset="${d.offset}"
            style="transition:stroke-dasharray .9s ease"></circle>`).join("")}
        </svg>
        <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
          <div style="font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:${MUTED(45)}">total</div>
          <div style="font-family:var(--font-heading);font-size:19px;font-weight:500;letter-spacing:-.02em">${v.spentFmt}</div>
        </div>
      </div>
      <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:7px">
        ${v.donut.map(d => `
        <div style="display:flex;align-items:center;gap:8px;font-size:12px">
          <span style="width:8px;height:8px;border-radius:3px;flex:none;background:${d.color}"></span>
          <span style="flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(d.label)}</span>
          <span style="color:${MUTED(55)}">${d.pct}</span>
        </div>`).join("")}
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:12px">
      <div style="${LABEL}">Last 6 months</div>
      <div style="display:flex;align-items:flex-end;gap:10px;height:132px;padding:0 2px">
        ${v.months.map(m => `
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:7px;height:100%;justify-content:flex-end">
          <div style="font-size:10.5px;color:${MUTED(55)};flex:none">${m.k}</div>
          <div style="flex:1;min-height:0;width:100%;position:relative">
            <div style="position:absolute;left:0;right:0;bottom:0;border-radius:6px 6px 3px 3px;
              height:${m.h};background:${m.fill};box-shadow:${m.glow};
              transition:height .8s cubic-bezier(.2,.8,.2,1)"></div>
          </div>
          <div style="font-size:10.5px;color:${MUTED(45)};flex:none">${m.label}</div>
        </div>`).join("")}
      </div>
      <div style="font-size:12.5px;line-height:1.5;color:${MUTED(62)};text-wrap:pretty">${esc(v.paceCopy)}</div>
    </div>

    <div style="display:flex;flex-direction:column;gap:10px">
      <div style="${LABEL}">Repeat spots</div>
      ${v.merchants.map(m => `
      <div style="display:flex;align-items:center;gap:12px;padding:11px 12px;border-radius:12px;
        background:var(--color-surface);box-shadow:var(--shadow-sm)">
        ${iconChip(m, 30)}
        <div style="flex:1;min-width:0">
          <div style="font-size:13.5px">${esc(m.name)}</div>
          <div style="font-size:11.5px;color:${MUTED(50)}">${m.count} visits</div>
        </div>
        <div style="font-family:var(--font-heading);font-size:14.5px;font-weight:500">${m.totalFmt}</div>
      </div>`).join("")}
    </div>
  </div>`;
}

function addScreen(v) {
  return `
  <div style="min-height:100%;display:flex;flex-direction:column;padding:8px 20px 20px">
    <div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0 10px">
      <button${on(v.cancel)} class="btn btn-icon btn-secondary" style="border-radius:10px"><i class="ph ph-x" style="font-size:16px"></i></button>
      <div style="font-size:12.5px;letter-spacing:.06em;text-transform:uppercase;color:${MUTED(50)}">New expense</div>
      <div style="width:36px"></div>
    </div>

    ${v.entryChipsFirst ? `
    <div style="display:flex;flex-direction:column;gap:9px;margin:6px 0 14px">
      <div style="${LABEL}">1 · What for</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
        ${v.catTiles.map(c => `
        <button${on(c.select)} style="display:flex;flex-direction:column;align-items:flex-start;gap:6px;
          padding:10px;border-radius:12px;cursor:pointer;font-family:var(--font-body);
          background:${c.bg};border:1px solid ${c.border};color:var(--color-text)">
          <i class="ph ${c.icon}" style="font-size:17px;color:${c.color}"></i>
          <span style="font-size:11.5px">${esc(c.label)}</span>
        </button>`).join("")}
      </div>
    </div>` : ""}

    <div style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:14px 0 10px">
      <div style="${LABEL}">${v.amountStepLabel}</div>
      <div style="display:flex;align-items:baseline;gap:4px">
        <span style="font-family:var(--font-heading);font-size:26px;font-weight:500;color:${MUTED(45)}">₹</span>
        <span style="font-family:var(--font-heading);font-size:52px;font-weight:500;letter-spacing:-.04em;
          line-height:1;color:${v.amountColor}">${v.amountDisplay}</span>
      </div>
      <div style="height:2px;width:120px;border-radius:2px;background:linear-gradient(to right,transparent,var(--color-accent-600),transparent)"></div>
    </div>

    ${v.entryKeypadFirst ? `
    <div class="scr" style="display:flex;gap:7px;overflow-x:auto;scrollbar-width:none;padding:4px 0 12px">
      ${v.catTiles.map(c => `
      <button${on(c.select)} style="flex:none;display:flex;align-items:center;gap:6px;padding:7px 12px;
        border-radius:99px;cursor:pointer;font-family:var(--font-body);font-size:12.5px;
        background:${c.bg};border:1px solid ${c.border};color:var(--color-text)">
        <i class="ph ${c.icon}" style="font-size:14px;color:${c.color}"></i>${esc(c.label)}
      </button>`).join("")}
    </div>` : ""}

    <div style="display:flex;gap:8px;padding:2px 0 12px">
      ${v.notePresets.map(n => `
      <button${on(n.select)} style="flex:1;padding:8px 6px;border-radius:10px;cursor:pointer;
        font-family:var(--font-body);font-size:12px;background:${n.bg};border:1px solid ${n.border};
        color:${MUTED(82)}">${esc(n.label)}</button>`).join("")}
    </div>

    <div style="flex:1"></div>

    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:9px">
      ${v.keys.map(k => `
      <button${on(k.press)} class="key" style="height:52px;border-radius:14px;cursor:pointer;
        font-family:var(--font-heading);font-weight:500;font-size:21px;background:${k.bg};
        border:1px solid ${k.border};color:${k.fg};display:grid;place-items:center">
        ${k.isIcon ? `<i class="ph ${k.icon}" style="font-size:19px"></i>` : esc(k.label)}
      </button>`).join("")}
    </div>

    <button${on(v.save)} class="btn btn-primary btn-block" style="margin-top:12px;height:50px;border-radius:14px;
      font-size:15px;gap:8px;background:${v.saveBg};border-color:${v.saveBorder};color:${v.saveFg};
      opacity:${v.saveOpacity};transition:opacity .2s">
      <i class="ph ph-check" style="font-size:17px"></i>${v.saveLabel}
    </button>
  </div>`;
}

function navBar(v) {
  const item = n => `
    <button${on(n.go)} style="display:flex;flex-direction:column;align-items:center;gap:3px;width:58px;
      padding:2px 0;background:transparent;border:0;cursor:pointer;font-family:var(--font-body);color:${n.color}">
      <i class="${n.icon}" style="font-size:20px"></i>
      <span style="font-size:10px;letter-spacing:.02em">${esc(n.label)}</span>
    </button>`;

  return `
  <div style="position:absolute;left:0;right:0;bottom:0;padding:0 16px 14px;
    background:linear-gradient(to top,var(--color-bg) 58%,rgba(22,24,38,0))">
    <div style="position:relative;display:flex;align-items:center;justify-content:space-between;
      padding:9px 18px;border-radius:20px;background:#20222f;
      box-shadow:0 0 0 1px #33364a,0 -6px 24px rgba(0,0,0,.45)">
      ${v.navLeft.map(item).join("")}
      <button${on(v.goAdd)} class="fab" style="width:54px;height:54px;margin:-22px 2px 0;border-radius:18px;
        cursor:pointer;display:grid;place-items:center;background:linear-gradient(160deg,#9184d9,#5d5294);
        border:1px solid #b5abfc;color:#161826;box-shadow:0 8px 22px rgba(145,132,217,.4);transition:transform .18s">
        <i class="ph-fill ph-plus" style="font-size:23px"></i>
      </button>
      ${v.navRight.map(item).join("")}
    </div>
    <div style="display:flex;justify-content:center;padding-top:9px">
      <div style="width:112px;height:4px;border-radius:99px;background:#4a4d5e"></div>
    </div>
  </div>`;
}

function toastEl(v) {
  if (!v.toast) return "";
  return `
  <div style="position:absolute;left:16px;right:16px;bottom:96px;display:flex;align-items:center;gap:10px;
    padding:12px 14px;border-radius:14px;background:#2b2741;
    box-shadow:0 0 0 1px var(--color-accent-700),0 12px 30px rgba(0,0,0,.5);
    animation:toastIn .3s cubic-bezier(.2,.8,.2,1) both">
    <i class="ph-fill ph-check-circle" style="font-size:19px;color:var(--color-accent-300)"></i>
    <div style="flex:1;font-size:12.5px;line-height:1.4;color:var(--color-accent-100)">${esc(v.toast)}</div>
  </div>`;
}

/* ── render ────────────────────────────────────────────────────────────── */

const device = document.querySelector(".device");
const viewport = document.getElementById("viewport");
const navHost = document.getElementById("nav");
const toastHost = document.getElementById("toast");

let lastScreen = null;

function render() {
  handlers = [];
  const v = derive();

  /* keep the reader's place, except when the screen itself changes */
  const keepScroll = lastScreen === state.screen ? viewport.scrollTop : 0;

  viewport.innerHTML =
    v.isHome ? homeScreen(v) :
    v.isLedger ? ledgerScreen(v) :
    v.isInsights ? insightsScreen(v) :
    addScreen(v);

  navHost.innerHTML = v.showNav ? navBar(v) : "";
  toastHost.innerHTML = toastEl(v);

  viewport.scrollTop = keepScroll;
  lastScreen = state.screen;
}

device.addEventListener("click", e => {
  const el = e.target.closest("[data-act]");
  if (el) handlers[+el.dataset.act]();
});

/* ── tweaks panel ──────────────────────────────────────────────────────── */

document.getElementById("tw-home").addEventListener("change", e => {
  props.homeVariant = e.target.value;
  render();
});
document.getElementById("tw-entry").addEventListener("change", e => {
  props.entryVariant = e.target.value;
  render();
});

const budgetInput = document.getElementById("tw-budget");
const budgetOut = document.getElementById("tw-budget-out");
budgetInput.addEventListener("input", () => {
  props.monthlyBudget = +budgetInput.value;
  budgetOut.textContent = fmt(props.monthlyBudget);
  render();
});

/* ── mount ─────────────────────────────────────────────────────────────── */

render();
requestAnimationFrame(() => setTimeout(() => setState({ ringReady: true }), 120));
