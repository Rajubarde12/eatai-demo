(function () {
  const E = window.EatAI;

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function $(id) { return document.getElementById(id); }

  E.current = function () {
    const stack = E.state.nav.stack;
    return stack[stack.length - 1];
  };
  E.currentParams = function () { return (E.current() || {}).params || {}; };

  function clearTimers() {
    clearInterval(E._calc); clearInterval(E._an); clearInterval(E._resend);
    clearTimeout(E._calcDone); clearTimeout(E._bar);
  }

  function toast(msg, kind) {
    E.state.toast = { msg: msg, kind: kind || "ok" };
    const host = $("overlay");
    if (host && E._rendered) {
      let el = host.querySelector(".toast");
      if (!el) { el = document.createElement("button"); host.appendChild(el); }
      el.type = "button";
      el.className = "toast" + (kind === "err" ? " err" : "");
      el.textContent = msg;
      el.onclick = function () { el.remove(); E.state.toast = null; };
    }
    clearTimeout(E._toast);
    E._toast = setTimeout(function () {
      E.state.toast = null;
      const el = document.querySelector("#overlay .toast");
      if (el) el.remove();
    }, 2600);
  }
  E.toast = toast;

  function ask(opts) {
    E.state.confirm = opts;
    E.render({ animate: false, keepScroll: true });
  }

  function tabbar() {
    const tab = E.state.nav.tab;
    const unread = (E.state.chats || []).reduce(function (n, c) { return n + (c.unread || 0); }, 0) + ((E.state.requests || []).length ? 0 : 0);
    const chatUnread = (E.state.chats || []).reduce(function (n, c) { return n + (c.unread || 0); }, 0);
    function item(id, icon, label) {
      const badge = id === "chat" && chatUnread ? '<em class="badge">' + (chatUnread > 9 ? "9+" : chatUnread) + "</em>" : "";
      return '<button type="button" class="tab ' + (tab === id ? "on" : "") + '" data-action="tab" data-tab="' + id + '">' + E.icon(icon) + "<span>" + label + "</span>" + badge + "</button>";
    }
    return '<div class="tabbar">' + item("home", "house", "Home") + item("diary", "book-open", "Diary") +
      '<div class="tab-gap"></div><button type="button" class="scan-fab" data-action="open-scan" aria-label="Scan meal">' + E.icon("scan") + "</button>" +
      item("chat", "message-circle", "Chat") + item("profile", "user", "You") + "</div>";
  }

  function overlay() {
    let html = "";
    if (E.state.modal && E.modals[E.state.modal.id]) html += E.modals[E.state.modal.id]();
    if (E.state.lightbox) {
      html += '<div class="modal-wrap" style="background:#000;display:grid;place-items:center"><button type="button" class="backdrop" data-action="close-light"></button><img alt="" src="' + E.esc(E.state.lightbox) + '" style="max-width:92%;max-height:78%;position:relative;border-radius:16px"></div>';
    }
    if (E.state.sheet && E.state.sheet.kind === "profile") {
      html += '<div class="sheet-wrap"><button type="button" class="backdrop" data-action="close-sheet"></button><div class="sheet action-sheet"><div class="grabber"></div>' +
        '<button type="button" class="row-btn danger" data-action="report-profile">Report</button>' +
        '<button type="button" class="row-btn danger" data-action="block-profile">Block</button></div></div>';
    }
    if (E.state.sheet && E.state.sheet.kind === "msg") {
      html += '<div class="sheet-wrap"><button type="button" class="backdrop" data-action="close-sheet"></button><div class="sheet action-sheet"><div class="grabber"></div>' +
        '<button type="button" class="row-btn" data-action="copy-msg">Copy</button>' +
        '<button type="button" class="row-btn" data-action="delete-msg">Delete</button>' +
        '<button type="button" class="row-btn" data-action="report-msg">Report</button>' +
        '<button type="button" class="row-btn danger" data-action="block-chat">Block</button></div></div>';
    }
    if (E.state.confirm) {
      const c = E.state.confirm;
      html += '<div class="dialog-wrap"><button type="button" class="backdrop" data-action="close-confirm"></button><div class="dialog"><div class="heading">' + E.esc(c.title) + '</div><p class="body muted mt8">' + E.esc(c.message) + '</p><div class="grid2 mt16">' +
        (c.hideCancel ? "" : E.btn(c.cancel || "Cancel", { variant: "secondary", size: "md", attrs: 'data-action="close-confirm"' })) +
        E.btn(c.ok || "OK", { variant: c.danger ? "danger" : "primary", size: "md", attrs: 'data-action="confirm-ok"' }) + "</div></div></div>";
    }
    if (E.state.toast) html += '<button type="button" class="toast' + (E.state.toast.kind === "err" ? " err" : "") + '" data-action="dismiss-toast">' + E.esc(E.state.toast.msg) + "</button>";
    return html;
  }

  E.render = function (opts) {
    opts = opts || {};
    clearTimers();
    const prevScroll = document.querySelector("#stage .scroll");
    const top = prevScroll ? prevScroll.scrollTop : 0;
    const focus = document.activeElement;
    const fid = focus && focus.id;
    const caret = focus && focus.selectionStart;
    const screen = E.current();
    let html = "";
    try {
      const fn = E.screens[screen.id] || E.screens.home;
      html = fn();
    } catch (err) {
      console.error(err);
      html = '<div class="page"><div class="scroll"><p class="danger body">This screen hit a snag. ' + E.esc(err.message) + "</p></div></div>";
    }
    const trans = opts.transition || "fade";
    const anim = opts.animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    $("stage").innerHTML = '<div class="screen' + (anim ? " anim-" + (trans === "up" ? "up" : trans === "right" ? "right" : "fade") : "") + '">' + html + "</div>";
    const roots = { home: 1, diary: 1, messages: 1, profile: 1 };
    $("tabbar").innerHTML = roots[screen.id] ? tabbar() : "";
    $("overlay").innerHTML = overlay();
    $("viewport").dataset.theme = (screen.id === "scan" || (E.state.modal && E.state.modal.id === "paywall")) ? "dark" : "light";
    if (window.lucide) {
      try { window.lucide.createIcons({ icons: window.lucide.icons }); } catch (err) { /* icon set optional */ }
    }
    if (opts.keepScroll) {
      const sc = document.querySelector("#stage .scroll");
      if (sc) sc.scrollTop = top;
    }
    if (fid) {
      const n = document.getElementById(fid);
      if (n) {
        n.focus();
        if (caret != null && n.setSelectionRange) {
          try { n.setSelectionRange(caret, caret); } catch (err) { /* number inputs */ }
        }
      }
    }
    mount(screen);
    if (anim && window.gsap) {
      window.gsap.from("#stage .rise", { y: 12, opacity: 0, duration: 0.4, stagger: 0.04, ease: "power2.out" });
    }
    E._rendered = true;
    E.save();
  };

  function mount(screen) {
    if (window.Swiper) {
      document.querySelectorAll(".eat-swiper").forEach(function (el) {
        if (el.swiper) return;
        new window.Swiper(el, { slidesPerView: "auto", spaceBetween: 12, freeMode: true });
      });
      document.querySelectorAll(".day-swiper").forEach(function (el) {
        if (el.swiper) return;
        new window.Swiper(el, { slidesPerView: "auto", spaceBetween: 8, freeMode: true, centeredSlides: true, initialSlide: 10 });
      });
    }
    const list = document.getElementById("msg-list");
    if (list) {
      const sc = list.closest(".scroll");
      if (sc) sc.scrollTop = sc.scrollHeight;
    }
    if (screen.id === "progress") mountCharts();
    if (screen.id === "verify") {
      E._resend = setInterval(function () {
        const btn = document.getElementById("resend-btn");
        if (!btn) return;
        const left = Math.max(0, Math.ceil(((E.state.ui.resendAt || 0) - Date.now()) / 1000));
        btn.textContent = left ? "Resend code in " + left + "s" : "Resend code";
        btn.disabled = !!left;
      }, 400);
    }
    if (screen.id === "onboarding") {
      const ob = E.state.onboarding;
      const steps = E.onboardingSteps(ob);
      if (steps[ob.i] === "calculating") {
        const tips = ["Reading your goal…", "Balancing protein, carbs, and fats…", "Leaving room for dosa night…"];
        let i = 0;
        E._calc = setInterval(function () {
          i = (i + 1) % tips.length;
          const el = document.getElementById("calc-tip");
          if (el) el.textContent = tips[i];
        }, 650);
        E._calcDone = setTimeout(function () {
          if (E.current().id === "onboarding" && E.onboardingSteps(E.state.onboarding)[E.state.onboarding.i] === "calculating") {
            actions["ob-next"]();
          }
        }, 2000);
      }
    }
    if (screen.id === "scan" && E.state.ui.scanMode === "barcode" && !E.state.ui.analyzing) {
      E._bar = setTimeout(function () {
        if (E.current().id === "scan" && E.state.ui.scanMode === "barcode") actions.shutter();
      }, 1700);
    }
    if (E.state.ui.analyzing) {
      const tips = ["Identifying every item…", "Checking portions…", "Adding up the plate…"];
      let i = 0;
      E._an = setInterval(function () {
        i = (i + 1) % tips.length;
        const el = document.getElementById("analyze-tip");
        if (el) el.textContent = tips[i];
      }, 700);
    }
    const sc = document.querySelector("#stage .scroll[data-pull]");
    if (sc) {
      let y = 0;
      sc.addEventListener("pointerdown", function (e) {
        if (e.target.closest("button, input, textarea, a")) { y = 0; return; }
        y = sc.scrollTop <= 1 ? e.clientY : 0;
      });
      sc.addEventListener("pointerup", function (e) {
        if (y && e.clientY - y > 72) toast("Updated just now");
        y = 0;
      });
    }
  }

  function mountCharts() {
    if (!window.Chart) return;
    const cal = document.getElementById("cal-chart");
    if (cal) {
      const week = E.state.ui.progressWeek || 0;
      const now = new Date();
      const monday = (now.getDay() === 0 ? -6 : 1 - now.getDay()) + week * 7;
      const labels = []; const data = []; const goal = [];
      let sum = 0; let psum = 0; let on = 0; let counted = 0;
      for (let i = 0; i < 7; i++) {
        const d = E.addDays(monday + i);
        const iso = E.iso(d);
        labels.push(d.toLocaleDateString("en-IN", { weekday: "narrow" }));
        const totals = E.dayTotals(iso);
        data.push(totals.kcal);
        goal.push(E.state.user.plan.kcal);
        if (iso <= E.todayIso()) {
          counted++; sum += totals.kcal; psum += totals.p;
          if (totals.kcal > 0 && totals.kcal <= E.state.user.plan.kcal * 1.05) on++;
        }
      }
      const label = document.getElementById("week-label");
      if (label) label.textContent = E.shortDate(E.iso(E.addDays(monday))) + " – " + E.shortDate(E.iso(E.addDays(monday + 6)));
      const ak = document.getElementById("avg-kcal");
      const ap = document.getElementById("avg-p");
      const ot = document.getElementById("on-target");
      if (ak) ak.textContent = E.num(counted ? sum / counted : 0);
      if (ap) ap.textContent = Math.round(counted ? psum / counted : 0) + "g";
      if (ot) ot.textContent = on + "/" + counted;
      if (E._cal) E._cal.destroy();
      E._cal = new window.Chart(cal, {
        type: "bar",
        data: { labels: labels, datasets: [
          { type: "bar", data: data, backgroundColor: "#121210", borderRadius: 8, barThickness: 14 },
          { type: "line", data: goal, borderColor: "#C6F135", borderWidth: 2, pointRadius: 0, borderDash: [4, 4] }
        ] },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { display: false } } }
      });
    }
    const wt = document.getElementById("wt-chart");
    if (wt) {
      const range = E.state.ui.weightRange || "1M";
      const days = range === "1W" ? 7 : range === "1M" ? 31 : range === "3M" ? 92 : 9999;
      const from = E.iso(E.addDays(-days));
      const logs = (E.state.weightLog || []).filter(function (w) { return range === "All" || w.date >= from; });
      if (E._wt) E._wt.destroy();
      if (!logs.length) return;
      E._wt = new window.Chart(wt, {
        type: "line",
        data: { labels: logs.map(function (l) { return l.date.slice(5); }), datasets: [{ data: logs.map(function (l) { return l.kg; }), borderColor: "#121210", backgroundColor: "rgba(198,241,53,.45)", fill: true, tension: 0.35, pointRadius: 3, pointBackgroundColor: "#C6F135" }] },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { maxTicksLimit: 5 } }, y: { ticks: { font: { size: 10 } } } } }
      });
    }
  }

  function push(id, params, transition) {
    E.state.nav.stack.push({ id: id, params: params || {}, transition: transition || "right" });
    E.render({ animate: true, transition: transition || "right" });
  }
  function pop() {
    if (E.state.nav.stack.length > 1) E.state.nav.stack.pop();
    E.render({ animate: true, transition: "fade" });
  }
  function goTab(tab) {
    if (tab === "chat" && E.state.user.isGuest) {
      toast("Create a free account to message people.", "err");
      push("register", {}, "right");
      return;
    }
    const map = { home: "home", diary: "diary", chat: "messages", profile: "profile" };
    E.state.nav.tab = tab;
    E.state.nav.stack = [{ id: map[tab] || "home", transition: "fade" }];
    E.render({ animate: true, transition: "fade" });
  }
  function openModal(id, extra) {
    E.state.modal = Object.assign({ id: id }, extra || {});
    E.render({ animate: false, keepScroll: true });
  }
  function lockedScan() { return E.state.flags.scanLimit && !E.isPro(); }

  function finishOnboarding() {
    const ob = E.state.onboarding;
    const plan = E.calcPlan(ob);
    const u = E.state.user;
    if (ob.mode === "edit") {
      E.state.goals.unshift({
        id: E.uid("g"), type: u.goal, kcal: u.plan.kcal, p: u.plan.p, c: u.plan.c, f: u.plan.f,
        from: E.iso(E.addDays(-40)), to: E.todayIso(), manual: !!u.plan.manual, active: false
      });
    }
    u.name = (ob.name || u.name || "Friend").trim();
    u.goal = ob.goal || "health";
    u.gender = ob.gender || u.gender;
    u.birthMonth = ob.month;
    u.birthYear = ob.year;
    u.heightCm = ob.heightCm;
    u.weightKg = ob.weightKg;
    u.targetKg = ob.targetKg || ob.weightKg;
    u.pace = ob.pace;
    u.activity = ob.activity;
    u.exercise = ob.exercise;
    u.diet = ob.diet;
    u.training = (ob.training || []).slice();
    u.discovery = E.age(ob.year, ob.month) >= 18 && !!ob.discovery;
    u.pregnancyStatus = ob.gender === "female" ? (ob.pregnancy || null) : null;
    u.kidMode = E.protectedMode(ob) === "kid";
    if (E.protectedMode(ob) || ob.goal === "health") u.goal = "health";
    u.plan = plan;
    u.onboarded = true;
    u.ageBlocked = E.age(ob.year, ob.month) < 18;
    if (u.ageBlocked) { u.discovery = false; u.chatReady = false; }
    E.state.goals = (E.state.goals || []).map(function (g) { g.active = false; return g; });
    E.state.goals.unshift({ id: E.uid("g"), type: u.goal, kcal: plan.kcal, p: plan.p, c: plan.c, f: plan.f, from: E.todayIso(), to: null, manual: false, active: true });
    if (!E.state.weightLog.length) E.state.weightLog.push({ date: E.todayIso(), kg: ob.weightKg });
    if (ob.mode === "edit") {
      toast("Plan updated");
      E.state.nav = { tab: "profile", stack: [{ id: "profile" }, { id: "goals" }] };
    } else {
      toast("Your plan is ready");
      E.state.nav = { tab: "home", stack: [{ id: "home" }] };
    }
    E.render({ animate: true, transition: "fade" });
  }

  function refreshScanTotals() {
    const scan = E.state.scan;
    if (!scan) return;
    const totals = E.mealTotals(scan);
    const plan = E.state.user.plan;
    const after = plan.kcal - E.dayTotals(E.todayIso()).kcal - totals.kcal;
    const kcalEl = document.getElementById("scan-meal-kcal");
    const afterEl = document.getElementById("scan-meal-after");
    const macroEl = document.getElementById("scan-meal-macros");
    if (kcalEl) kcalEl.textContent = E.num(totals.kcal);
    if (afterEl) afterEl.textContent = after >= 0
      ? "After this meal you'll have " + E.num(after) + " kcal left."
      : "After this meal you'll be " + E.num(Math.abs(after)) + " kcal over today. That's allowed.";
    if (macroEl) macroEl.innerHTML = E.macros({ p: totals.p, c: totals.c, f: totals.f }, { p: Math.max(totals.p, 1), c: Math.max(totals.c, 1), f: Math.max(totals.f, 1) });
    (scan.items || []).forEach(function (it, idx) {
      const line = document.querySelector('[data-scan-macros="' + idx + '"]');
      if (line) line.textContent = (it.serving || "") + " · P " + it.p + " · C " + it.c + " · F " + it.f;
    });
  }

  function applyModel(el) {
    const key = el.dataset.model;
    const val = el.type === "checkbox" ? el.checked : el.value;
    const ui = E.state.ui;
    const ob = E.state.onboarding;
    if (key === "email") ui.email = val;
    else if (key === "password") ui.password = val;
    else if (key === "ob-name") ob.name = val;
    else if (key === "newEmail") ui.newEmail = val;
    else if (key === "describe") ui.describeText = val;
    else if (key === "scan-name" && E.state.scan) E.state.scan.name = val;
    else if ((key === "item-name" || key === "item-kcal") && E.state.scan) {
      const it = (E.state.scan.items || [])[Number(el.dataset.idx)];
      if (it && key === "item-name") it.name = val;
      if (it && key === "item-kcal") {
        const n = Number(val);
        if (!isNaN(n) && n >= 0) {
          if (!it._base) it._base = { kcal: it.kcal || 1, p: it.p, c: it.c, f: it.f };
          const ratio = n / Math.max(1, it._base.kcal);
          it.kcal = n;
          it.p = Math.round(it._base.p * ratio);
          it.c = Math.round(it._base.c * ratio);
          it.f = Math.round(it._base.f * ratio);
          refreshScanTotals();
        }
      }
    }
    else if (key === "chat-q") ui.chatQuery = val;
    else if (key === "disc-q") ui.discoverQuery = val;
    else if (key === "comm-q") ui.communityQuery = val;
    else if (key === "bio") E.state.user.bio = val;
    else if (key === "city-q") ui.cityQuery = val;
    else if (key === "group-name") ui.groupName = val;
    else if (key === "share-note") ui.shareNote = val;
    else if (key === "composer") ui.composer = val;
    else if (key === "comm-name") ui.commName = val;
    else if (key === "comm-city") ui.commCity = val;
    else if (key === "comm-rules") ui.commRules = val;
    else if (key === "comm-about") ui.commAbout = val;
    else if (key === "offer-code") { ui.offerCode = val; ui.offerError = ""; }
    else if (key === "reply-draft") ui.replyDraft = val;
    else if (key === "post-draft") ui.postDraft = val;
    else if (key === "custom-title") ui.customTitle = val;
    else if (key === "new-comm") ui.newComm = val;
    else if (key === "new-about") ui.newAbout = val;
    else if (key === "new-city") ui.newCity = val;
    else if (key === "delete-ack") ui.deleteAck = !!val;
    else if (key === "edit-name") ui.editName = val;
    else if (key === "water-time") E.state.prefs.water.reminderTime = val;
    else if (key === "mw") ui.measureWaist = val;
    else if (key === "mh") ui.measureHips = val;
    else if (key === "mc") ui.measureChest = val;
    const live = { email: 1, password: 1, "ob-name": 1, "chat-q": 1, "disc-q": 1, "comm-q": 1, bio: 1, "city-q": 1, "group-name": 1, "delete-ack": 1, "new-comm": 1 };
    if (live[key]) E.render({ animate: false, keepScroll: true });
  }

  function setPath(path) {
    const parts = path.split(".");
    let obj = E.state;
    for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
    const k = parts[parts.length - 1];
    obj[k] = !obj[k];
    if (path.indexOf("privacy") >= 0) toast("Privacy updated");
    E.render({ animate: false, keepScroll: true });
  }

  function chatById(id) { return (E.state.chats || []).find(function (c) { return c.id === id; }); }

  function autoReply(chat, text) {
    E.state.typing = chat.id;
    E.render({ animate: false, keepScroll: true });
    setTimeout(function () {
      if (!chatById(chat.id)) return;
      E.state.typing = null;
      const reply = /lunch|eat|dosa|meal/i.test(text) ? "Nice — I'll log mine too. We've got this." : "I'm in. Let's keep it honest this week.";
      chat.messages.push({ id: E.uid("x"), from: "them", name: chat.type === "group" ? "Meera" : "", text: reply, at: Date.now(), status: "read" });
      chat.preview = reply;
      chat.time = Date.now();
      E.render({ animate: false });
    }, 1000);
  }

  let lastScan = null;
  async function runScan(builder) {
    if (lockedScan()) { openModal("paywall"); return; }
    lastScan = builder;
    E.state.ui.scanError = "";
    E.state.ui.scanProgress = "Compressing photo…";
    E.state.ui.analyzing = true;
    E.render({ animate: false, keepScroll: true });
    await sleep(800);
    if (E.state.flags.slowNet && E.current() && E.current().id === "scan") {
      E.state.ui.scanProgress = "Still uploading on a slow connection…";
      E.render({ animate: false, keepScroll: true });
      await sleep(1400);
      E.state.ui.analyzing = false;
      E.state.ui.scanError = "This is taking too long. Check your connection and try again.";
      E.render({ animate: false, keepScroll: true });
      return;
    }
    await sleep(900);
    E.state.ui.analyzing = false;
    E.state.ui.scanProgress = "";
    E.state.scan = builder();
    push("scan-result", {}, "up");
  }
  function resumePaywall() {
    const pending = E.state.pendingCheckout;
    if (!pending || !E.state.user || E.state.user.isGuest || !E.state.user.isEmailVerified) return false;
    E.state.ui.selectedPlan = pending.plan || "yearly";
    E.state.pendingCheckout = null;
    E.state.modal = { id: "paywall" };
    return true;
  }

  const actions = {
    back: function () {
      if (E.state.modal) { E.state.modal = null; E.render({ animate: false, keepScroll: true }); return; }
      pop();
    },
    go: function (el) {
      const params = {};
      if (el.dataset.id) params.id = el.dataset.id;
      push(el.dataset.screen, params, "right");
    },
    tab: function (el) { goTab(el.dataset.tab); },
    "guest-start": function () {
      const fresh = E.freshOnboarding();
      fresh.nav.stack[0].transition = "up";
      E.state = fresh;
      E.render({ animate: true, transition: "up" });
    },
    "toggle-password": function () {
      E.state.ui.showPassword = !E.state.ui.showPassword;
      E.render({ animate: false, keepScroll: true });
    },
    login: async function () {
      const ui = E.state.ui;
      if (!E.validEmail(ui.email)) { ui.authError = "Enter a valid email address."; E.render({ animate: false, keepScroll: true }); return; }
      if (ui.password === "wrong") { ui.authError = "That password doesn't match. Try again."; E.render({ animate: false, keepScroll: true }); return; }
      ui.busy = "login"; ui.authError = "";
      E.render({ animate: false, keepScroll: true });
      await sleep(800);
      const email = ui.email.trim().toLowerCase();
      const map = { "priya@eat.ai": "priya", "rahul@eat.ai": "rahul", "sam@demo.app": "sam", "aisha@eat.ai": "aisha" };
      const pending = E.state.pendingCheckout;
      if (map[email]) E.state = E.createState(map[email]);
      else if (email.indexOf("unverified") >= 0) {
        E.state = E.createState("sam");
        E.state.user.email = email;
        E.state.user.name = "Sam";
      } else {
        const pretty = email.split("@")[0].replace(/[.\-_]/g, " ").replace(/\b\w/g, function (s) { return s.toUpperCase(); });
        E.state = E.createState("fresh");
        E.state.user.email = email;
        E.state.user.name = pretty;
        E.state.user.isEmailVerified = true;
        E.state.onboarding.name = pretty;
        E.state.nav = { tab: "home", stack: [{ id: "onboarding" }] };
      }
      if (pending) E.state.pendingCheckout = pending;
      toast("Welcome back");
      if (resumePaywall()) toast("Pick up Pro where you left it");
      E.render({ animate: true, transition: "fade" });
    },
    register: async function () {
      const ui = E.state.ui;
      if (!E.validEmail(ui.email) || !E.passwordOk(ui.password)) {
        ui.authError = "Use a real email and a stronger password.";
        E.render({ animate: false, keepScroll: true });
        return;
      }
      ui.busy = "register";
      E.render({ animate: false, keepScroll: true });
      await sleep(800);
      const email = ui.email.trim();
      const guest = E.state.user && E.state.user.isGuest && E.state.user.onboarded;
      const pretty = email.split("@")[0].replace(/[.\-_]/g, " ").replace(/\b\w/g, function (s) { return s.toUpperCase(); });
      if (!guest) {
        E.state.user.name = pretty;
        E.state.user.onboarded = false;
        E.state.onboarding = E.blankOnboarding({ name: pretty });
      }
      E.state.user.isGuest = false;
      E.state.user.email = email;
      E.state.user.isEmailVerified = false;
      E.state.ui.otp = ["", "", "", "", "", ""];
      E.state.ui.resendAt = Date.now() + 30000;
      E.state.ui.otpExpiresAt = Date.now() + 60000;
      E.state.ui.busy = null;
      E.state.ui.authError = "";
      E.state.ui.editingEmail = false;
      E.state.nav = { tab: "home", stack: [{ id: "verify" }] };
      E.render({ animate: true, transition: "up" });
    },
    google: async function () {
      E.state.ui.busy = "google";
      E.render({ animate: false, keepScroll: true });
      await sleep(800);
      E.state = E.createState("fresh");
      E.state.user.name = "Alex Demo";
      E.state.user.email = "alex@demo.app";
      E.state.user.isEmailVerified = true;
      E.state.user.onboarded = false;
      E.state.onboarding = E.blankOnboarding({ name: "Alex Demo" });
      E.state.nav = { tab: "home", stack: [{ id: "onboarding" }] };
      toast("Signed in with Google");
      E.render({ animate: true, transition: "fade" });
    },
    forgot: async function () {
      if (!E.validEmail(E.state.ui.email)) { E.state.ui.authError = "Enter a valid email address."; E.render({ animate: false, keepScroll: true }); return; }
      E.state.ui.busy = "forgot";
      E.render({ animate: false, keepScroll: true });
      await sleep(700);
      E.state.ui.busy = null;
      E.state.ui.sentReset = true;
      E.state.ui.authError = "";
      toast("If that email exists, we sent a link");
      E.render({ animate: false, keepScroll: true });
    },
    verify: async function () {
      const code = (E.state.ui.otp || []).join("");
      if ((E.state.ui.otpExpiresAt || 0) && Date.now() > E.state.ui.otpExpiresAt) {
        E.state.ui.authError = "This code has expired. Resend a new one.";
        E.render({ animate: false, keepScroll: true });
        return;
      }
      if (code !== "123456") {
        E.state.ui.authError = "That code doesn't match. Use 123456 for this demo.";
        E.render({ animate: false, keepScroll: true });
        return;
      }
      E.state.ui.busy = "verify";
      E.render({ animate: false, keepScroll: true });
      await sleep(600);
      E.state.user.isEmailVerified = true;
      E.state.ui.busy = null;
      E.state.ui.authError = "";
      const next = E.state.user.onboarded ? "home" : "onboarding";
      E.state.nav = { tab: "home", stack: [{ id: next }] };
      toast("Email verified");
      if (resumePaywall()) toast("Pick up Pro where you left it");
      E.render({ animate: true, transition: "fade" });
    },
    resend: function () {
      if ((E.state.ui.resendAt || 0) > Date.now()) return;
      E.state.ui.resendAt = Date.now() + 30000;
      E.state.ui.otpExpiresAt = Date.now() + 60000;
      E.state.ui.authError = "";
      toast("Code sent again");
      E.render({ animate: false, keepScroll: true });
    },
    "edit-email": function () {
      E.state.ui.editingEmail = true;
      E.state.ui.newEmail = E.state.user.email;
      E.render({ animate: false, keepScroll: true });
    },
    "save-email": function () {
      if (!E.validEmail(E.state.ui.newEmail)) { toast("Enter a valid email", "err"); return; }
      E.state.user.email = E.state.ui.newEmail.trim();
      E.state.ui.editingEmail = false;
      E.state.ui.resendAt = Date.now() + 30000;
      E.state.ui.otpExpiresAt = Date.now() + 60000;
      E.state.ui.otp = ["", "", "", "", "", ""];
      toast("Code sent to " + E.state.user.email);
      E.render({ animate: false, keepScroll: true });
    },
    "ask-logout": function () {
      const guest = E.state.user.isGuest;
      ask({ title: guest ? "Reset guest session?" : "Log out?", message: guest ? "This clears the guest demo on this device." : "You'll return to the welcome screen. This demo stays on your device.", ok: guest ? "Reset" : "Log out", danger: true, action: "do-logout" });
    },
    "do-logout": function () {
      E.state = E.newInstall();
      toast("You're signed out");
      E.render({ animate: true, transition: "fade" });
    },
    logout: function () { actions["ask-logout"](); },
    "ob-pick": function (el) {
      const ob = E.state.onboarding;
      const step = E.onboardingSteps(ob)[ob.i];
      const field = { goal: "goal", gender: "gender", pace: "pace", activity: "activity", exercise: "exercise", diet: "diet" }[step];
      if (field) ob[field] = el.dataset.value;
      if (field === "gender" && ob.gender !== "female") ob.pregnancy = null;
      E.render({ animate: false, keepScroll: true });
    },
    "ob-preg": function (el) {
      E.state.onboarding.pregnancy = el.dataset.value || null;
      E.render({ animate: false, keepScroll: true });
    },
    "ob-tag": function (el) {
      const list = E.state.onboarding.training;
      const v = el.dataset.value;
      const i = list.indexOf(v);
      if (i >= 0) list.splice(i, 1);
      else if (list.length >= 3) { toast("Pick up to 3"); return; }
      else list.push(v);
      E.render({ animate: false, keepScroll: true });
    },
    "ob-month": function (el) {
      E.state.onboarding.month = (E.state.onboarding.month + Number(el.dataset.dir) + 12) % 12;
      E.render({ animate: false, keepScroll: true });
    },
    "ob-year": function (el) {
      E.state.onboarding.year = Math.min(2015, Math.max(1940, E.state.onboarding.year + Number(el.dataset.dir)));
      E.render({ animate: false, keepScroll: true });
    },
    "ob-hunit": function (el) { E.state.onboarding.heightUnit = el.dataset.value; E.render({ animate: false, keepScroll: true }); },
    "ob-wunit": function (el) { E.state.onboarding.weightUnit = el.dataset.value; E.render({ animate: false, keepScroll: true }); },
    "ob-height": function (el) {
      E.state.onboarding.heightCm = Math.min(210, Math.max(140, E.state.onboarding.heightCm + Number(el.dataset.dir)));
      E.render({ animate: false, keepScroll: true });
    },
    "ob-weight": function (el) {
      const which = el.dataset.which === "target" ? "targetKg" : "weightKg";
      const next = Math.round((E.state.onboarding[which] + Number(el.dataset.dir) * 0.5) * 10) / 10;
      E.state.onboarding[which] = Math.min(180, Math.max(40, next));
      E.render({ animate: false, keepScroll: true });
    },
    "ob-discovery": function () {
      E.state.onboarding.discovery = !E.state.onboarding.discovery;
      E.render({ animate: false, keepScroll: true });
    },
    "ob-back": function () {
      const ob = E.state.onboarding;
      if (ob.i > 0) { ob.i -= 1; E.render({ animate: true, transition: "fade" }); return; }
      if (ob.mode === "edit") { pop(); return; }
      ask({ title: "Leave setup?", message: "You can start again from the welcome screen.", ok: "Leave", action: "leave-setup" });
    },
    "leave-setup": function () {
      E.state.nav = { tab: "home", stack: [{ id: "welcome" }] };
      E.render({ animate: true, transition: "fade" });
    },
    "ob-skip": function () {
      E.state.onboarding.i += 1;
      E.render({ animate: true, transition: "right" });
    },
    "ob-next": function () {
      const ob = E.state.onboarding;
      const steps = E.onboardingSteps(ob);
      const step = steps[ob.i];
      if (step === "reveal") { finishOnboarding(); return; }
      if (step !== "calculating" && !E.stepValid(ob)) return;
      ob.i += 1;
      if (ob.i >= E.onboardingSteps(ob).length) ob.i = E.onboardingSteps(ob).length - 1;
      E.render({ animate: true, transition: "right" });
    },
    recalc: function () {
      const u = E.state.user;
      E.state.onboarding = E.blankOnboarding({
        mode: "edit", goal: u.goal, name: u.name, gender: u.gender, month: u.birthMonth, year: u.birthYear,
        heightCm: u.heightCm, weightKg: u.weightKg, targetKg: u.targetKg, pace: u.pace, activity: u.activity,
        exercise: u.exercise, diet: u.diet, training: u.training, discovery: u.discovery
      });
      push("onboarding", {}, "up");
    },
    "open-scan": function (el) {
      E.state.ui.scanMode = "photo";
      E.state.ui.scanMealPreset = el && el.dataset.meal ? el.dataset.meal : null;
      E.state.ui.analyzing = false;
      E.state.ui.torch = false;
      push("scan", {}, "up");
    },
    "scan-mode": function (el) {
      E.state.ui.scanMode = el.dataset.mode;
      E.state.ui.analyzing = false;
      E.render({ animate: false, keepScroll: true });
    },
    torch: function () { E.state.ui.torch = !E.state.ui.torch; E.render({ animate: false, keepScroll: true }); },
    "allow-camera": function () { E.state.flags.cameraDenied = false; toast("Camera ready"); E.render({ animate: false }); },
    "open-gallery": function () { openModal("gallery"); },
    "pick-gallery": function (el) {
      const sets = [
        function () { return E.scanPreset("photo", E.img.thali); },
        function () { const s = E.mealFromText("masala dosa"); s.source = "photo"; return s; },
        function () { const s = E.mealFromText("paneer salad"); s.source = "photo"; s.image = E.img.bowl; return s; },
        function () { const s = E.mealFromText("oats"); s.source = "photo"; return s; }
      ];
      E.state.modal = null;
      runScan(sets[Number(el.dataset.idx)] || sets[0]);
    },
    shutter: function () {
      if (E.state.flags.cameraDenied && E.state.ui.scanMode === "photo") return;
      const mode = E.state.ui.scanMode;
      runScan(function () { return E.scanPreset(mode === "barcode" ? "barcode" : "photo"); });
    },
    "describe-chip": function (el) {
      E.state.ui.describeText = el.dataset.value;
      E.render({ animate: false, keepScroll: true });
    },
    "describe-submit": function () {
      const text = (E.state.ui.describeText || "").trim();
      if (!text) { toast("Describe what you ate", "err"); return; }
      runScan(function () { return E.mealFromText(text); });
    },
    "open-paywall": function () { openModal("paywall"); },
    "guest-pro": function () {
      E.state.pendingCheckout = { plan: E.state.ui.selectedPlan || "yearly" };
      E.state.modal = null;
      push("register", {}, "right");
    },
    "retry-scan": function () { if (lastScan) runScan(lastScan); },
    "scan-qty": function (el) {
      const it = E.state.scan.items[Number(el.dataset.idx)];
      if (!it) return;
      it.qty = Math.max(1, (it.qty || 1) + Number(el.dataset.dir));
      E.render({ animate: false, keepScroll: true });
    },
    "scan-remove": function (el) {
      E.state.scan.items.splice(Number(el.dataset.idx), 1);
      if (!E.state.scan.items.length) toast("Add at least one food before saving");
      E.render({ animate: false, keepScroll: true });
    },
    "scan-type": function (el) { E.state.scan.mealType = el.dataset.value; E.render({ animate: false, keepScroll: true }); },
    "scan-save-toggle": function () { E.state.scan.saveLater = !E.state.scan.saveLater; E.render({ animate: false, keepScroll: true }); },
    "add-diary": function () {
      const scan = E.state.scan;
      if (!scan || !scan.items.length) { toast("Nothing to add", "err"); return; }
      const entry = { id: E.uid("m"), name: scan.name || "Meal", emoji: scan.emoji || "🍽️", image: scan.image, items: scan.items, mealType: scan.mealType || E.mealTypeByTime(), date: E.todayIso(), time: E.clock() };
      E.state.meals.push(entry);
      if (scan.saveLater) E.state.saved.unshift(JSON.parse(JSON.stringify(entry)));
      E.state.scan = null;
      E.state.nav = { tab: "diary", stack: [{ id: "diary" }] };
      toast("Added to your diary");
      E.render({ animate: true, transition: "fade" });
    },
    "discard-scan": function () {
      ask({ title: "Leave without adding?", message: "This scan won't be saved.", ok: "Discard", danger: true, action: "do-discard" });
    },
    "do-discard": function () {
      E.state.scan = null;
      if (E.current().id === "scan-result" && E.state.nav.stack.length > 1) E.state.nav.stack.pop();
      if (E.current().id === "scan" && E.state.nav.stack.length > 1) E.state.nav.stack.pop();
      toast("Scan discarded");
      E.render({ animate: true, transition: "fade" });
    },
    "open-meal": function (el) { push("food", { id: el.dataset.id }, "right"); },
    "delete-meal": function (el) {
      const id = el.dataset.id || (E.currentParams() || {}).id;
      ask({ title: "Remove this meal?", message: "It leaves today's totals. You can log it again later.", ok: "Remove", danger: true, action: "do-delete-meal", id: id });
    },
    "do-delete-meal": function (c) {
      E.state.meals = E.state.meals.filter(function (m) { return m.id !== c.id; });
      if (E.current().id === "food") E.state.nav.stack.pop();
      toast("Meal removed");
      E.render({ animate: true, transition: "fade" });
    },
    "quick-add": function (el) {
      const src = (E.state.saved || []).find(function (s) { return s.id === el.dataset.id; });
      if (!src) return;
      const copy = JSON.parse(JSON.stringify(src));
      copy.id = E.uid("m");
      copy.date = E.todayIso();
      copy.time = E.clock();
      copy.mealType = E.state.ui.scanMealPreset || E.mealTypeByTime();
      E.state.meals.push(copy);
      toast(copy.name + " added to today");
      E.render({ animate: false, keepScroll: true });
    },
    "delete-saved": function (el) {
      ask({ title: "Remove saved meal?", message: "It won't delete meals already in your diary.", ok: "Remove", danger: true, action: "do-delete-saved", id: el.dataset.id });
    },
    "do-delete-saved": function (c) {
      E.state.saved = E.state.saved.filter(function (m) { return m.id !== c.id; });
      toast("Saved meal removed");
      E.render({ animate: false, keepScroll: true });
    },
    "water-add": function () { actions.glass(); },
    glass: function () {
      const iso = E.todayIso();
      let rec = E.state.waterLog.find(function (w) { return w.date === iso; });
      if (!rec) { rec = { date: iso, glasses: 0 }; E.state.waterLog.push(rec); }
      const cap = E.state.prefs.water.target + 4;
      if (rec.glasses >= cap) { toast("That's plenty of water for now"); return; }
      rec.glasses += 1;
      if (rec.glasses === E.state.prefs.water.target) toast("Water target hit");
      E.render({ animate: false, keepScroll: true });
    },
    "water-undo": function () {
      const rec = E.state.waterLog.find(function (w) { return w.date === E.todayIso(); });
      if (!rec || rec.glasses <= 0) { toast("Nothing to undo"); return; }
      rec.glasses -= 1;
      E.render({ animate: false, keepScroll: true });
    },
    "diary-day": function (el) {
      E.state.ui.diaryOffset = Number(el.dataset.offset);
      E.render({ animate: false, keepScroll: true });
    },
    "open-day": function (el) {
      const target = E.parseIso(el.dataset.iso);
      const today = new Date(); today.setHours(12, 0, 0, 0);
      E.state.ui.diaryOffset = Math.round((target - today) / 86400000);
      goTab("diary");
    },
    refresh: function () { toast("Updated just now"); },
    "week-shift": function (el) {
      const dir = Number(el.dataset.dir);
      E.state.ui.progressWeek = Math.min(0, (E.state.ui.progressWeek || 0) + dir);
      E.render({ animate: false, keepScroll: true });
    },
    "weight-range": function (el) { E.state.ui.weightRange = el.dataset.value; E.render({ animate: false, keepScroll: true }); },
    "open-weight": function () {
      const logs = E.state.weightLog || [];
      E.state.ui.weightDraft = logs.length ? logs[logs.length - 1].kg : E.state.user.weightKg;
      openModal("log-weight");
    },
    "weight-step": function (el) {
      const next = Math.round((Number(E.state.ui.weightDraft) + Number(el.dataset.dir) * 0.1) * 10) / 10;
      E.state.ui.weightDraft = Math.min(220, Math.max(35, next));
      E.render({ animate: false, keepScroll: true });
    },
    "save-weight": function () { commitWeight(false); },
    "save-weight-replace": function () { commitWeight(true); },
    "close-modal": function () { E.state.modal = null; E.render({ animate: false, keepScroll: true }); },
    "close-sheet": function () { E.state.sheet = null; E.render({ animate: false, keepScroll: true }); },
    "close-confirm": function () { E.state.confirm = null; E.render({ animate: false, keepScroll: true }); },
    "close-light": function () { E.state.lightbox = null; E.render({ animate: false, keepScroll: true }); },
    "dismiss-toast": function () { E.state.toast = null; const el = document.querySelector("#overlay .toast"); if (el) el.remove(); },
    "confirm-ok": function () {
      const c = E.state.confirm;
      E.state.confirm = null;
      if (c && actions[c.action]) actions[c.action](c);
      else E.render({ animate: false, keepScroll: true });
    },
    "chat-tab": function (el) { E.state.ui.chatTab = el.dataset.value; E.render({ animate: false, keepScroll: true }); },
    "open-thread": function (el) {
      const chat = chatById(el.dataset.id);
      if (chat) chat.unread = 0;
      push("thread", { id: el.dataset.id }, "right");
    },
    "open-group": function (el) { push("group-info", { id: el.dataset.id }, "right"); },
    noop: function () {},
    send: function () {
      const chat = chatById(E.currentParams().id);
      const text = (E.state.ui.composer || "").trim();
      if (!chat || !text) return;
      chat.messages.push({ id: E.uid("x"), from: "me", text: text, at: Date.now(), status: "read" });
      chat.preview = text; chat.time = Date.now(); chat.unread = 0;
      E.state.ui.composer = "";
      if (!chat.pending && !chat.blocked) autoReply(chat, text);
      else E.render({ animate: false });
    },
    ice: function (el) { E.state.ui.composer = el.dataset.value; actions.send(); },
    attach: function () {
      const chat = chatById(E.currentParams().id);
      if (!chat) return;
      chat.messages.push({ id: E.uid("x"), from: "me", text: "", image: E.img.thali, at: Date.now(), status: "read" });
      chat.preview = "Photo"; chat.time = Date.now();
      E.render({ animate: false });
    },
    lightbox: function (el) { E.state.lightbox = el.dataset.src; E.render({ animate: false, keepScroll: true }); },
    "msg-actions": function (el) {
      E.state.sheet = { kind: "msg", mid: el.dataset.mid, chatId: E.currentParams().id };
      E.render({ animate: false, keepScroll: true });
    },
    "copy-msg": function () {
      const chat = chatById(E.state.sheet.chatId);
      const msg = chat && chat.messages.find(function (m) { return m.id === E.state.sheet.mid; });
      E.state.sheet = null;
      if (msg && navigator.clipboard) navigator.clipboard.writeText(msg.text || "Meal").catch(function () {});
      toast("Copied");
      E.render({ animate: false, keepScroll: true });
    },
    "delete-msg": function () {
      const sheet = E.state.sheet;
      const chat = chatById(sheet.chatId);
      if (chat) chat.messages = chat.messages.filter(function (m) { return m.id !== sheet.mid; });
      E.state.sheet = null;
      toast("Message deleted");
      E.render({ animate: false, keepScroll: true });
    },
    "report-msg": function () {
      E.state.reports.unshift({ id: E.uid("rp"), name: "Chat message", reason: "Reported from a conversation", status: "Pending", date: E.todayIso() });
      E.state.sheet = null;
      toast("Report filed");
      E.render({ animate: false, keepScroll: true });
    },
    "block-chat": function () {
      const chat = chatById(E.state.sheet.chatId);
      if (chat) {
        chat.blocked = true;
        E.state.blocked.push({ id: E.uid("b"), name: chat.name, color: chat.color, initials: chat.initials });
      }
      E.state.sheet = null;
      toast("Blocked " + (chat ? chat.name : "user"));
      E.render({ animate: false, keepScroll: true });
    },
    "accept-req": function (el) { acceptRequest(el.dataset.id); },
    "decline-req": function (el) {
      E.state.requests = E.state.requests.filter(function (r) { return r.id !== el.dataset.id; });
      toast("Request declined");
      E.render({ animate: false, keepScroll: true });
    },
    "accept-thread": function () {
      const chat = chatById(E.currentParams().id);
      if (chat) chat.pending = null;
      toast("You can chat now");
      E.render({ animate: false, keepScroll: true });
    },
    "decline-thread": function () {
      const id = E.currentParams().id;
      E.state.chats = E.state.chats.filter(function (c) { return c.id !== id; });
      pop();
      toast("Request declined");
    },
    "open-user": function (el) { push("user-profile", { id: el.dataset.id }, "right"); },
    "say-hi": function (el) {
      const person = (E.state.discover || []).find(function (p) { return p.id === el.dataset.id; });
      if (!person) return;
      let chat = (E.state.chats || []).find(function (c) { return c.name === person.name; });
      if (!chat) {
        chat = { id: E.uid("c"), type: "dm", name: person.name, color: person.color, initials: E.initials(person.name), online: true, preview: "Hey — want to keep each other on track?", time: Date.now(), unread: 0, messages: [{ id: E.uid("x"), from: "me", text: "Hey — want to keep each other on track?", at: Date.now(), status: "read" }] };
        E.state.chats.unshift(chat);
        E.state.modal = null;
        E.state.nav.stack = E.state.nav.stack.filter(function (s) { return s.id !== "user-profile"; });
        E.state.nav.stack.push({ id: "thread", params: { id: chat.id } });
        autoReply(chat, "hi");
        return;
      }
      push("thread", { id: chat.id }, "right");
    },
    "demo-photo": function () { E.state.user.photoSet = true; toast("Photo added"); E.render({ animate: false, keepScroll: true }); },
    "social-tag": function (el) {
      const list = E.state.user.training = E.state.user.training || [];
      const v = el.dataset.value;
      const i = list.indexOf(v);
      if (i >= 0) list.splice(i, 1);
      else if (list.length >= 3) toast("Pick up to 3");
      else list.push(v);
      E.render({ animate: false, keepScroll: true });
    },
    "pick-city": function (el) { E.state.user.city = el.dataset.value; E.state.ui.cityQuery = el.dataset.value; E.render({ animate: false, keepScroll: true }); },
    "finish-chat": function () {
      E.state.user.chatReady = true;
      toast("Chat is ready");
      E.render({ animate: true, transition: "fade" });
    },
    "chat-next": function () {
      const u = E.state.user;
      const ui = E.state.ui;
      const fields = E.pendingChatFields(u);
      const field = fields[Math.min(ui.chatStep || 0, Math.max(0, fields.length - 1))];
      if (field === "name") {
        const n = (ui.editName || u.name || "").trim();
        if (n.length < 2) { toast("Add your name", "err"); return; }
        u.name = n;
      }
      if (field === "photo" && !u.photoSet) { toast("Add a photo first", "err"); return; }
      if (field === "birth" && E.age(u.birthYear, u.birthMonth) < 18) {
        u.ageBlocked = true;
        toast("Chat stays closed until you're 18", "err");
        return;
      }
      if (field === "tags" && !(u.training || []).length) { toast("Pick at least one tag", "err"); return; }
      if (field === "discovery" && !u.discovery) { toast("Turn on Discover to continue", "err"); return; }
      if (field === "city" && String(u.city || ui.cityQuery || "").trim().length < 2) { toast("Add your city", "err"); return; }
      if (field === "city" && ui.cityQuery) u.city = ui.cityQuery;
      if (field === "bio" && String(u.bio || "").trim().length < 10) { toast("Write a short bio, or skip", "err"); return; }
      ui.chatStep = 0;
      if (!E.pendingChatFields(u).length) {
        u.chatReady = true;
        toast("Chat is ready");
      }
      E.render({ animate: true, transition: "right" });
    },
    "chat-skip-bio": function () {
      E.state.user.bioSkipped = true;
      E.state.ui.chatStep = 0;
      if (!E.pendingChatFields(E.state.user).length) {
        E.state.user.chatReady = true;
        toast("Chat is ready");
      }
      E.render({ animate: true, transition: "right" });
    },
    "profile-more": function (el) {
      E.state.sheet = { kind: "profile", id: el.dataset.id };
      E.render({ animate: false, keepScroll: true });
    },
    "report-profile": function () {
      const id = (E.state.sheet || {}).id;
      const p = (E.state.discover || []).find(function (d) { return d.id === id; });
      E.state.sheet = null;
      E.state.reports.unshift({ id: E.uid("rp"), name: p ? p.name : "Profile", reason: "Reported from profile", status: "Pending", date: E.todayIso() });
      toast("Thanks for telling us. We'll review this profile.");
      E.render({ animate: false, keepScroll: true });
    },
    "block-profile": function () {
      const id = (E.state.sheet || {}).id;
      const p = (E.state.discover || []).find(function (d) { return d.id === id; });
      E.state.sheet = null;
      if (p) {
        E.state.blocked.unshift({ id: p.id, name: p.name, color: p.color, initials: E.initials(p.name) });
        E.state.discover = E.state.discover.filter(function (d) { return d.id !== p.id; });
      }
      toast(p ? "Blocked " + p.name : "Blocked");
      pop();
    },
    "open-modal": function (el) { openModal(el.dataset.modal); },
    "pick-member": function (el) {
      const picks = E.state.ui.groupPicks;
      const i = picks.indexOf(el.dataset.id);
      if (i >= 0) picks.splice(i, 1); else picks.push(el.dataset.id);
      E.render({ animate: false, keepScroll: true });
    },
    "create-group": function () {
      const name = (E.state.ui.groupName || "").trim();
      if (!name || E.state.ui.groupPicks.length < 2) { toast("Add a name and at least 2 people", "err"); return; }
      const chat = { id: E.uid("c"), type: "group", name: name, color: "#E7F8D8", initials: E.initials(name), members: ["You", "Friend", "Friend"], preview: "Group created", time: Date.now(), unread: 0, messages: [{ id: E.uid("x"), from: "them", name: "EatAI", text: "Group created. Say what you're training for.", at: Date.now() }] };
      E.state.chats.unshift(chat);
      E.state.ui.groupName = "";
      E.state.ui.groupPicks = [];
      E.state.modal = null;
      E.state.nav.tab = "chat";
      E.state.nav.stack = [{ id: "messages" }, { id: "thread", params: { id: chat.id } }];
      toast("Group created");
      E.render({ animate: true, transition: "right" });
    },
    "create-community-gate": function () {
      if (!E.isPro()) { openModal("paywall"); return; }
      openModal("create-community");
    },
    "submit-community": function () {
      const name = (E.state.ui.newComm || "").trim();
      if (!name) { toast("Add a community name", "err"); return; }
      const c = { id: E.uid("cm"), name: name, city: E.state.ui.newCity || "Bengaluru", members: 1, admin: true, joined: true, hue: 100, description: E.state.ui.newAbout || "A new demo community.", rules: "Be kind. No dating pitches.", memberList: [{ id: "me", name: "You", role: "admin" }], pending: [], posts: [{ id: E.uid("p"), author: "You", text: "Community created. This feed stays on your device.", time: "now", likes: 0, liked: false, replies: [] }] };
      E.state.communities.mine.unshift(c);
      E.state.modal = null;
      E.state.ui.communityTab = "mine";
      toast("Community created");
      push("community", { id: c.id, list: "mine" }, "right");
    },
    "comm-tab": function (el) { E.state.ui.communityTab = el.dataset.value; E.render({ animate: false, keepScroll: true }); },
    "open-community": function (el) { push("community", { id: el.dataset.id, list: el.dataset.list || "mine" }, "right"); },
    "comm-vis": function (el) {
      const c = (E.state.communities.mine || []).find(function (x) { return x.id === E.currentParams().id; });
      if (c) c.visibility = el.dataset.value;
      E.render({ animate: false, keepScroll: true });
    },
    "save-community": function (el) {
      const c = E.communityById((el && el.dataset.id) || E.currentParams().id);
      if (c) {
        if (E.state.ui.commName) c.name = E.state.ui.commName;
        if (E.state.ui.commAbout) c.description = E.state.ui.commAbout;
        if (E.state.ui.commRules != null && E.state.ui.commRules !== "") c.rules = E.state.ui.commRules;
      }
      toast("Community updated");
      E.render({ animate: false, keepScroll: true });
    },
    "comm-view": function (el) { E.state.ui.commView = el.dataset.value; E.render({ animate: false, keepScroll: true }); },
    "toggle-near": function () { E.state.ui.nearMe = !E.state.ui.nearMe; E.render({ animate: false, keepScroll: true }); },
    "join-community": function (el) {
      const c = E.communityById(el.dataset.cid);
      if (!c) return;
      if (c.visibility === "private") {
        c.pending = c.pending || [];
        if (!c.pending.some(function (m) { return m.id === "me-req"; })) c.pending.push({ id: "me-req", name: "You" });
        toast("Request sent. An admin will approve it.");
        E.render({ animate: false, keepScroll: true });
        return;
      }
      c.joined = true;
      c.members += 1;
      c.memberList = c.memberList || [];
      if (!c.memberList.some(function (m) { return m.id === "me"; })) c.memberList.unshift({ id: "me", name: "You", role: "member" });
      if (!E.state.communities.mine.some(function (x) { return x.id === c.id; })) E.state.communities.mine.unshift(c);
      toast(c.visibility === "private" ? "Request sent" : "You're in");
      E.render({ animate: false, keepScroll: true });
    },
    "leave-community": function (el) {
      const c = E.communityById(el.dataset.cid);
      if (!c) return;
      c.joined = false;
      c.members = Math.max(1, c.members - 1);
      c.memberList = (c.memberList || []).filter(function (m) { return m.id !== "me"; });
      E.state.communities.mine = E.state.communities.mine.filter(function (x) { return x.id !== c.id; });
      if (!E.state.communities.discover.some(function (x) { return x.id === c.id; })) E.state.communities.discover.unshift(c);
      toast("You left " + c.name);
      pop();
    },
    "like-post": function (el) {
      const c = E.communityById(el.dataset.cid);
      const post = c && (c.posts || []).find(function (p) { return p.id === el.dataset.id; });
      if (!post) return;
      post.liked = !post.liked;
      post.likes = Math.max(0, (post.likes || 0) + (post.liked ? 1 : -1));
      E.render({ animate: false, keepScroll: true });
    },
    "toggle-replies": function (el) {
      E.state.ui.openPost = E.state.ui.openPost === el.dataset.id ? "" : el.dataset.id;
      E.state.ui.replyDraft = "";
      E.render({ animate: false, keepScroll: true });
    },
    "send-reply": function (el) {
      const text = (E.state.ui.replyDraft || "").trim();
      if (!text) { toast("Write a reply", "err"); return; }
      const c = E.communityById(el.dataset.cid);
      const post = c && (c.posts || []).find(function (p) { return p.id === el.dataset.id; });
      if (!post) return;
      post.replies = post.replies || [];
      post.replies.push({ id: E.uid("rp"), author: "You", text: text });
      E.state.ui.replyDraft = "";
      E.render({ animate: false, keepScroll: true });
    },
    "community-post": function (el) {
      const text = (E.state.ui.postDraft || "").trim();
      if (!text) { toast("Write something first", "err"); return; }
      const c = E.communityById(el.dataset.cid);
      if (!c || !c.joined) { toast("Join to post", "err"); return; }
      c.posts = c.posts || [];
      c.posts.unshift({ id: E.uid("p"), author: "You", text: text, time: "now", likes: 0, liked: false, replies: [] });
      E.state.ui.postDraft = "";
      toast("Posted");
      E.render({ animate: false, keepScroll: true });
    },
    "approve-member": function (el) {
      const c = E.communityById(el.dataset.cid);
      const req = c && (c.pending || []).find(function (m) { return m.id === el.dataset.id; });
      if (!c || !req) return;
      c.pending = c.pending.filter(function (m) { return m.id !== req.id; });
      c.memberList = c.memberList || [];
      c.memberList.push({ id: req.id, name: req.name, role: "member" });
      c.members += 1;
      toast("Approved " + req.name);
      E.render({ animate: false, keepScroll: true });
    },
    "reject-member": function (el) {
      const c = E.communityById(el.dataset.cid);
      if (!c) return;
      c.pending = (c.pending || []).filter(function (m) { return m.id !== el.dataset.id; });
      toast("Request declined");
      E.render({ animate: false, keepScroll: true });
    },
    "remove-member": function (el) {
      ask({ title: "Remove member?", message: "They will lose access to this community.", ok: "Remove", danger: true, action: "do-remove-member", id: el.dataset.id, cid: el.dataset.cid });
    },
    "do-remove-member": function (cfn) {
      const c = E.communityById(cfn.cid);
      if (!c) return;
      c.memberList = (c.memberList || []).filter(function (m) { return m.id !== cfn.id; });
      c.members = Math.max(1, c.members - 1);
      toast("Member removed");
      E.render({ animate: false, keepScroll: true });
    },
    "ask-archive": function (el) {
      ask({ title: "Archive community?", message: "Members will lose access. This cannot be undone from the app.", ok: "Archive", danger: true, action: "do-archive", id: el.dataset.id });
    },
    "do-archive": function (cfn) {
      const c = E.communityById(cfn.id);
      if (c) c.archived = true;
      E.state.communities.mine = E.state.communities.mine.filter(function (x) { return !x.archived; });
      toast("Community archived");
      E.state.nav.stack = E.state.nav.stack.filter(function (s) { return s.id !== "community" && s.id !== "community-settings"; });
      if (!E.state.nav.stack.length) E.state.nav.stack = [{ id: "communities" }];
      E.render({ animate: true, transition: "fade" });
    },
    "share-meal": function (el) {
      E.state.ui.shareChat = null;
      E.state.ui.shareNote = "";
      openModal("share", { mealId: el.dataset.id || E.currentParams().id });
    },
    "pick-share": function (el) { E.state.ui.shareChat = el.dataset.id; E.render({ animate: false, keepScroll: true }); },
    "send-share": function () {
      const meal = (E.state.meals || []).find(function (m) { return m.id === E.state.modal.mealId; });
      const chat = chatById(E.state.ui.shareChat);
      if (!meal || !chat) return;
      const totals = E.mealTotals(meal);
      chat.messages.push({ id: E.uid("x"), from: "me", text: E.state.ui.shareNote || "", meal: { name: meal.name, kcal: totals.kcal }, at: Date.now(), status: "read" });
      chat.preview = "Shared " + meal.name;
      chat.time = Date.now();
      E.state.modal = null;
      toast("Meal shared");
      E.state.nav.stack.push({ id: "thread", params: { id: chat.id } });
      E.render({ animate: true, transition: "right" });
    },
    "pick-plan": function (el) { E.state.ui.selectedPlan = el.dataset.id; E.render({ animate: false, keepScroll: true }); },
    buy: async function () {
      if (E.state.user.isGuest) {
        E.state.pendingCheckout = { plan: E.state.ui.selectedPlan || "yearly" };
        push("register");
        return;
      }
      if (!E.state.user.isEmailVerified) { toast("Verify your email before subscribing", "err"); return; }
      E.state.ui.busy = "buy";
      E.render({ animate: false, keepScroll: true });
      await sleep(1200);
      const plan = E.state.ui.selectedPlan || "yearly";
      const sub = E.state.user.subscription;
      const razor = E.state.ui.billingProvider === "razorpay";
      sub.status = "active";
      sub.plan = plan === "sixmonth" ? "half" : plan;
      sub.provider = razor ? "Razorpay" : "App Store";
      sub.trialUsed = true;
      sub.renewsAt = E.iso(E.addDays(plan === "yearly" ? 365 : plan === "sixmonth" ? 180 : 30));
      sub.endsAt = null;
      const base = plan === "yearly" ? 1999 : plan === "sixmonth" ? 999 : 299;
      const amount = E.state.ui.offerOff ? Math.round(base * (1 - E.state.ui.offerOff)) : base;
      E.state.pendingCheckout = null;
      E.state.payments.unshift({ date: E.todayIso(), amount: amount, status: "Paid", plan: plan });
      E.state.ui.busy = null;
      E.state.modal = null;
      const label = plan === "yearly" ? "Yearly" : plan === "sixmonth" ? "6-month" : "Monthly";
      ask({ title: "You're on Pro", message: label + " plan is active via " + (razor ? "Razorpay" : "the store") + ". You were not charged.", ok: "Nice", hideCancel: true, action: "noop-render" });
    },
    trial: function () {
      const sub = E.state.user.subscription;
      sub.status = "trial";
      sub.plan = "yearly";
      sub.trialUsed = true;
      sub.endsAt = E.iso(E.addDays(3));
      sub.renewsAt = null;
      E.state.modal = null;
      toast("3-day Pro trial started");
      E.render({ animate: false, keepScroll: true });
    },
    restore: function () {
      E.state.flags.restoreFlip = !E.state.flags.restoreFlip;
      if (E.state.flags.restoreFlip) {
        E.state.user.subscription.status = "active";
        E.state.user.subscription.plan = "yearly";
        E.state.user.subscription.renewsAt = E.iso(E.addDays(300));
        toast("Restored Yearly Pro");
      } else toast("Nothing to restore");
      E.render({ animate: false, keepScroll: true });
    },
    "ask-cancel": function () {
      ask({ title: "Cancel subscription?", message: "You'll keep Pro until the end of this period. In this demo that's 30 days.", ok: "Cancel plan", danger: true, action: "do-cancel" });
    },
    "do-cancel": function () {
      const sub = E.state.user.subscription;
      sub.status = "cancelled";
      sub.renewsAt = null;
      sub.endsAt = E.iso(E.addDays(30));
      toast(sub.provider === "Razorpay" ? "Auto-renew cancelled. Pro stays until the end date." : "Cancel in the store. Pro stays until the end date.");
      E.render({ animate: false, keepScroll: true });
    },
    "resume-sub": function () {
      const sub = E.state.user.subscription;
      if (sub.provider !== "Razorpay" || sub.status !== "cancelled") {
        toast("Nothing to resume");
        return;
      }
      sub.status = "active";
      sub.renewsAt = sub.endsAt;
      sub.endsAt = null;
      toast("Pro is active again");
      E.render({ animate: false, keepScroll: true });
    },
    "billing-provider": function (el) {
      E.state.ui.billingProvider = el.dataset.value;
      if (el.dataset.value !== "razorpay") { E.state.ui.offerOff = 0; E.state.ui.offerError = ""; }
      E.render({ animate: false, keepScroll: true });
    },
    "apply-offer": function () {
      const code = (E.state.ui.offerCode || "").trim().toUpperCase();
      if (code === "SAVE20") {
        E.state.ui.offerOff = 0.2;
        E.state.ui.offerError = "";
        toast("20% off applied");
      } else {
        E.state.ui.offerOff = 0;
        E.state.ui.offerError = "That code doesn't match a live offer.";
      }
      E.render({ animate: false, keepScroll: true });
    },
    "store-link": function () { toast("Would open store subscriptions"); },
    "noop-render": function () { E.render({ animate: false, keepScroll: true }); },
    "ai-toggle": function () {
      if (!E.state.user.ai) { openModal("ai-consent"); return; }
      E.state.user.ai = false;
      toast("AI Processing turned off");
      E.render({ animate: false, keepScroll: true });
    },
    "ai-allow": function () {
      E.state.user.ai = true;
      E.state.modal = null;
      toast("AI Processing enabled");
      E.render({ animate: false, keepScroll: true });
    },
    toggle: function (el) {
      if (el.dataset.path === "user.ai") { actions["ai-toggle"](); return; }
      setPath(el.dataset.path);
    },
    "coach-time": function (el) { E.state.prefs.coach.time = el.dataset.value; toast("Coach time saved"); E.render({ animate: false, keepScroll: true }); },
    "photo-time": function (el) { E.state.prefs.photos.time = el.dataset.value; E.render({ animate: false, keepScroll: true }); },
    "photo-day": function (el) { E.state.prefs.photos.day = el.dataset.value; E.render({ animate: false, keepScroll: true }); },
    "water-start": function (el) { E.state.prefs.water.reminderStart = el.dataset.value; E.render({ animate: false, keepScroll: true }); },
    "water-end": function (el) { E.state.prefs.water.reminderEnd = el.dataset.value; E.render({ animate: false, keepScroll: true }); },
    "weighin-day": function (el) { E.state.prefs.units.weighInDay = el.dataset.value; E.render({ animate: false, keepScroll: true }); },
    "weighin-time": function (el) { E.state.prefs.units.weighInTime = el.dataset.value; E.render({ animate: false, keepScroll: true }); },
    "custom-time": function (el) { E.state.ui.customTime = el.dataset.value; E.render({ animate: false, keepScroll: true }); },
    "add-reminder": function () {
      const title = (E.state.ui.customTitle || "").trim();
      if (!title) { toast("Name the reminder", "err"); return; }
      E.state.prefs.reminders.custom = E.state.prefs.reminders.custom || [];
      E.state.prefs.reminders.custom.push({ id: E.uid("rm"), title: title, time: E.state.ui.customTime || "15:00", on: true });
      E.state.ui.customTitle = "";
      toast("Custom reminder added");
      E.render({ animate: false, keepScroll: true });
    },
    "toggle-reminder": function (el) {
      const row = (E.state.prefs.reminders.custom || []).find(function (r) { return r.id === el.dataset.id; });
      if (row) row.on = !row.on;
      E.render({ animate: false, keepScroll: true });
    },
    "streak-mode": function (el) { E.state.prefs.streak.mode = el.dataset.value; E.render({ animate: false, keepScroll: true }); },
    "unit-weight": function (el) { E.state.prefs.units.weight = el.dataset.value; E.render({ animate: false, keepScroll: true }); },
    "unit-length": function (el) { E.state.prefs.units.length = el.dataset.value; E.render({ animate: false, keepScroll: true }); },
    weighin: function (el) { E.state.prefs.units.weighIn = el.dataset.value === "Evening" ? "evening" : "morning"; E.render({ animate: false, keepScroll: true }); },
    "pref-step": function (el) {
      const dir = Number(el.dataset.dir);
      if (el.dataset.key === "glass") E.state.prefs.water.glassMl = Math.min(500, Math.max(150, E.state.prefs.water.glassMl + dir * 50));
      if (el.dataset.key === "wtarget") E.state.prefs.water.target = Math.min(16, Math.max(4, E.state.prefs.water.target + dir));
      E.render({ animate: false, keepScroll: true });
    },
    "target-step": function (el) {
      const ui = E.state.ui;
      const plan = E.state.user.plan;
      if (ui.tKcal == null) { ui.tKcal = plan.kcal; ui.tP = plan.p; ui.tC = plan.c; ui.tF = plan.f; }
      const key = el.dataset.key;
      const step = key === "tKcal" ? 10 : 1;
      ui[key] = Math.max(0, ui[key] + Number(el.dataset.dir) * step);
      E.render({ animate: false, keepScroll: true });
    },
    "save-targets": function () {
      const ui = E.state.ui;
      const plan = E.state.user.plan;
      const kcal = ui.tKcal != null ? ui.tKcal : plan.kcal;
      const p = ui.tP != null ? ui.tP : plan.p;
      const c = ui.tC != null ? ui.tC : plan.c;
      const f = ui.tF != null ? ui.tF : plan.f;
      const custom = (E.state.ui.macroMode || "auto") === "custom";
      E.state.user.plan = { kcal: kcal, p: p, c: c, f: f, manual: custom };
      toast(custom ? "Custom macros saved" : "Auto plan saved");
      E.render({ animate: false, keepScroll: true });
    },
    "restore-plan": function (el) {
      ask({ title: "Restore this plan?", message: "Today's targets switch to the older numbers. You can edit them again.", ok: "Restore", action: "do-restore", id: el.dataset.id });
    },
    "ask-delete-goal": function (el) {
      ask({ title: "Delete this goal?", message: "It will be removed from your history. Your active plan stays.", ok: "Delete", danger: true, action: "do-delete-goal", id: el.dataset.id });
    },
    "do-delete-goal": function (cfn) {
      E.state.goals = (E.state.goals || []).filter(function (g) { return g.id !== cfn.id || g.active; });
      toast("Goal removed from history");
      E.render({ animate: false, keepScroll: true });
    },
    "macro-mode": function (el) {
      E.state.ui.macroMode = el.dataset.value;
      if (el.dataset.value === "auto") {
        const u = E.state.user;
        const plan = E.calcPlan({
          year: u.birthYear, month: u.birthMonth, gender: u.gender, goal: u.goal,
          pregnancy: u.pregnancyStatus, activity: u.activity, exercise: u.exercise, pace: u.pace
        });
        E.state.ui.tKcal = plan.kcal;
        E.state.ui.tP = plan.p;
        E.state.ui.tC = plan.c;
        E.state.ui.tF = plan.f;
      }
      E.render({ animate: false, keepScroll: true });
    },
    "do-restore": function (c) {
      const g = (E.state.goals || []).find(function (x) { return x.id === c.id; });
      if (!g) return;
      E.state.user.plan = { kcal: g.kcal, p: g.p, c: g.c, f: g.f, manual: !!g.manual };
      E.state.user.goal = g.type;
      toast("Plan restored");
      E.render({ animate: false, keepScroll: true });
    },
    toast: function (el) { toast(el.dataset.msg || "Saved", el.dataset.kind); },
    "add-photo": function () {
      E.state.photos.unshift({ id: E.uid("ph"), date: E.todayIso(), caption: "Added just now", hue: Math.floor(Math.random() * 360) });
      toast("Photo added");
      E.render({ animate: false, keepScroll: true });
    },
    "save-measure": function () {
      const ui = E.state.ui;
      const waist = Number(ui.measureWaist); const hips = Number(ui.measureHips); const chest = Number(ui.measureChest);
      if (!waist || !hips || !chest) { toast("Add waist, hips, and chest", "err"); return; }
      E.state.measurements.unshift({ id: E.uid("ms"), date: E.todayIso(), waist: waist, hips: hips, chest: chest });
      ui.measureWaist = ui.measureHips = ui.measureChest = "";
      toast("Measurement saved");
      E.render({ animate: false, keepScroll: true });
    },
    pause: function (el) {
      const v = el.dataset.value;
      E.state.prefs.privacy.pausedUntil = v === "until" ? "until" : E.iso(E.addDays(Number(v)));
      E.state.prefs.privacy.discovery = false;
      toast("Discovery paused");
      E.render({ animate: false, keepScroll: true });
    },
    "resume-discovery": function () {
      E.state.prefs.privacy.pausedUntil = null;
      E.state.prefs.privacy.discovery = true;
      toast("Discovery resumed");
      E.render({ animate: false, keepScroll: true });
    },
    distance: function (el) { E.state.prefs.privacy.distance = el.dataset.value; toast("Distance updated"); E.render({ animate: false, keepScroll: true }); },
    "city-vis": function (el) {
      const map = { "Full city": "full", "State only": "state", Hidden: "hidden" };
      E.state.prefs.privacy.cityVisibility = map[el.dataset.value] || "full";
      E.render({ animate: false, keepScroll: true });
    },
    autodecline: function (el) {
      E.state.prefs.privacy.autoDecline = el.dataset.value === "Off" ? "Off" : parseInt(el.dataset.value, 10);
      toast("Chat requests updated");
      E.render({ animate: false, keepScroll: true });
    },
    unblock: function (el) {
      const b = E.state.blocked.find(function (x) { return x.id === el.dataset.id; });
      E.state.blocked = E.state.blocked.filter(function (x) { return x.id !== el.dataset.id; });
      if (b) (E.state.chats || []).forEach(function (c) { if (c.name === b.name) c.blocked = false; });
      toast("Unblocked");
      E.render({ animate: false, keepScroll: true });
    },
    "download-data": function () {
      toast("Export queued. We'll email a download link within 24 hours.");
    },
    "cancel-deletion": function () {
      E.state.user.deletion = null;
      toast("Deletion cancelled. Account stays.");
      E.render({ animate: false, keepScroll: true });
    },
    "ask-delete": function () {
      ask({ title: "Start the 30-day window?", message: "Nothing is erased today. You can cancel from this screen until the end date.", ok: "Start request", danger: true, action: "do-delete" });
    },
    "do-delete": function () {
      E.state.user.deletion = { requestedAt: E.todayIso(), endsAt: E.iso(E.addDays(30)) };
      toast("Deletion scheduled");
      E.render({ animate: false, keepScroll: true });
    },
    "cycle-color": function () {
      const colors = ["#C6F135", "#FFD0CC", "#D7E6FF", "#FFE08A", "#E7F8D8"];
      const i = colors.indexOf(E.state.user.color);
      E.state.user.color = colors[(i + 1) % colors.length];
      E.state.user.photoSet = true;
      E.render({ animate: false, keepScroll: true });
    },
    "save-profile": function () {
      const name = (E.state.ui.editName || "").trim();
      if (name.length < 2) { toast("Add your name", "err"); return; }
      E.state.user.name = name;
      toast("Profile saved");
      E.render({ animate: false, keepScroll: true });
    },
    "save-social": function () {
      if (E.state.ui.cityQuery) E.state.user.city = E.state.ui.cityQuery;
      toast("Social profile saved");
      E.render({ animate: false, keepScroll: true });
    },
    persona: function (el) {
      E.state = E.createState(el.dataset.id);
      E.state.modal = null;
      toast("Switched demo");
      E.render({ animate: true, transition: "fade" });
    },
    "sample-confirm": function () {
      ask({ title: "Remove this meal?", message: "This is a sample confirm. Nothing was deleted.", ok: "Remove", danger: true, action: "noop-render" });
    },
    "reset-demo": function () {
      localStorage.removeItem("eatai-demo-v1");
      localStorage.removeItem("eatai-demo-v2");
      E.state = E.newInstall();
      toast("Fresh start");
      E.render({ animate: true, transition: "fade" });
    },
    "retry-load": function () {
      E.state.flags.forceError = false;
      E.state.flags.forceLoading = false;
      toast("Loaded");
      E.render({ animate: false, keepScroll: true });
    },
    dev: function () { openModal("dev"); }
  };

  function commitWeight(replace) {
    const kg = Number(E.state.ui.weightDraft);
    const today = E.todayIso();
    const existing = (E.state.weightLog || []).find(function (w) { return w.date === today; });
    if (existing && !replace) {
      ask({ title: "Replace today's weigh-in?", message: "You already logged " + existing.kg + " kg today.", ok: "Replace", action: "save-weight-replace" });
      return;
    }
    if (existing) existing.kg = kg;
    else E.state.weightLog.push({ date: today, kg: kg });
    E.state.weightLog.sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    E.state.user.weightKg = kg;
    E.state.modal = null;
    toast("Weigh-in saved");
    E.render({ animate: false, keepScroll: true });
  }

  function acceptRequest(id) {
    const req = (E.state.requests || []).find(function (r) { return r.id === id; });
    if (!req) return;
    E.state.requests = E.state.requests.filter(function (r) { return r.id !== id; });
    const chat = { id: E.uid("c"), type: "dm", name: req.name, color: req.color, initials: req.initials, online: true, preview: req.preview, time: Date.now(), unread: 0, messages: [
      { id: E.uid("x"), from: "them", text: req.preview, at: req.at, status: "read" },
      { id: E.uid("x"), from: "me", text: "I'm in. Let's keep weekdays honest.", at: Date.now(), status: "read" }
    ] };
    E.state.chats.unshift(chat);
    E.state.ui.chatTab = "chats";
    toast("You can chat now");
    push("thread", { id: chat.id }, "right");
  }

  let pressTimer = null;
  let longFired = false;
  document.addEventListener("pointerdown", function (e) {
    const el = e.target.closest("[data-longpress]");
    if (!el) return;
    longFired = false;
    pressTimer = setTimeout(function () {
      longFired = true;
      if (navigator.vibrate) navigator.vibrate(12);
      const fn = actions[el.dataset.longpress];
      if (fn) fn(el);
    }, 650);
  });
  document.addEventListener("pointerup", function () { clearTimeout(pressTimer); });
  document.addEventListener("pointercancel", function () { clearTimeout(pressTimer); });
  document.addEventListener("contextmenu", function (e) {
    const el = e.target.closest("[data-longpress]");
    if (!el) return;
    e.preventDefault();
    const fn = actions[el.dataset.longpress];
    if (fn) fn(el);
  });
  document.addEventListener("click", function (e) {
    if (longFired) { longFired = false; e.preventDefault(); e.stopPropagation(); return; }
    const el = e.target.closest("[data-action]");
    if (!el || !document.getElementById("viewport").contains(el)) return;
    const fn = actions[el.dataset.action];
    if (!fn) return;
    if (navigator.vibrate) navigator.vibrate(8);
    fn(el, e);
  });
  document.addEventListener("input", function (e) {
    const t = e.target;
    if (t.dataset && t.dataset.otp != null) {
      const i = Number(t.dataset.otp);
      const v = String(t.value || "").replace(/\D/g, "").slice(-1);
      t.value = v;
      E.state.ui.otp[i] = v;
      if (v && i < 5) {
        const next = document.getElementById("otp" + (i + 1));
        if (next) next.focus();
      }
      return;
    }
    if (t.dataset && t.dataset.model) applyModel(t);
  });
  document.addEventListener("change", function (e) {
    if (e.target && e.target.dataset && e.target.dataset.model === "delete-ack") applyModel(e.target);
  });
  document.addEventListener("paste", function (e) {
    const t = e.target;
    if (!t.dataset || t.dataset.otp == null) return;
    const text = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    for (let i = 0; i < 6; i++) E.state.ui.otp[i] = text[i] || "";
    E.render({ animate: false, keepScroll: true });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target.id === "composer") { e.preventDefault(); actions.send(); }
    if (e.key === "Enter" && e.target.dataset && e.target.dataset.model === "password") {
      e.preventDefault();
      if (E.current() && E.current().id === "register") actions.register();
      else actions.login();
    }
    if (e.key === "Backspace" && e.target.dataset && e.target.dataset.otp != null && !e.target.value) {
      const i = Number(e.target.dataset.otp);
      if (i > 0) {
        const prev = document.getElementById("otp" + (i - 1));
        if (prev) prev.focus();
      }
    }
  });
  document.addEventListener("focusin", function (e) {
    if (e.target.matches && e.target.matches("input, textarea")) {
      setTimeout(function () { e.target.scrollIntoView({ block: "center", behavior: "smooth" }); }, 80);
    }
  });

  function fit() {
    const phoneW = 414;
    const phoneH = 868;
    const params = new URLSearchParams(location.search);
    const narrow = window.matchMedia("(max-width: 560px)").matches;
    const mobile = params.get("frame") === "1" ? false : params.get("frame") === "0" ? true : narrow;
    const scaler = $("scaler");
    const phone = $("phone");
    if (mobile) {
      document.body.classList.add("is-phone");
      scaler.style.width = "100%";
      scaler.style.height = "100%";
      phone.style.transform = "none";
      return;
    }
    document.body.classList.remove("is-phone");
    const s = Math.min(1, (window.innerHeight - 56) / phoneH, (window.innerWidth - 32) / phoneW);
    scaler.style.width = Math.round(phoneW * s) + "px";
    scaler.style.height = Math.round(phoneH * s) + "px";
    phone.style.transform = "scale(" + s + ")";
  }
  window.addEventListener("resize", fit);

  function tickClock() {
    document.querySelectorAll("[data-clock]").forEach(function (el) { el.textContent = E.clock(); });
  }

  async function boot() {
    fit();
    tickClock();
    const q = new URLSearchParams(location.search);
    try {
      localStorage.removeItem("eatai-demo-v1");
      localStorage.removeItem("eatai-demo-v2");
    } catch (err) { /* private mode */ }
    if (q.get("persona")) E.state = E.createState(q.get("persona"));
    else if (q.get("reset") === "1") E.state = E.createState("priya");
    else E.state = E.newInstall();
    if (q.get("screen")) {
      const id = q.get("screen");
      if (id === "paywall") {
        E.state.nav = { tab: "home", stack: [{ id: "home" }] };
        E.state.modal = { id: "paywall" };
      } else {
        E.state.nav = { tab: id === "messages" ? "chat" : id === "profile" ? "profile" : "home", stack: [{ id: id }] };
      }
    }
    if (q.get("fast") !== "1") {
      await Promise.race([document.fonts.ready.catch(function () {}), sleep(1200)]);
      await sleep(500);
    }
    E.render({ animate: true, transition: "fade" });
    setInterval(tickClock, 15000);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
