(function () {
  const E = window.EatAI;

  E.screens.profile = function () {
    const u = E.state.user;
    const pro = E.isPro();
    const plan = u.plan;
    const g = E.goalMeta[u.goal] || E.goalMeta.lose;
    const sub = u.subscription;
    const proCard = pro
      ? '<button type="button" class="card mt16" style="width:100%;text-align:left;border:0;color:inherit" data-action="go" data-screen="subscription"><div class="row gap12"><span class="ico-sq" style="background:var(--ink);color:var(--lime)">' + E.icon("gem") + '</span><span class="grow"><span class="heading" style="font-size:16px">You\'re on Pro</span><span class="caption" style="display:block">' + (sub.plan === "yearly" ? "Yearly" : sub.plan === "monthly" ? "Monthly" : "6-Month") + (sub.renewsAt ? " · renews " + E.niceDate(sub.renewsAt) : sub.endsAt ? " · ends " + E.niceDate(sub.endsAt) : "") + "</span></span>" + E.icon("chevron-right") + "</div></button>"
      : '<button type="button" class="card mt16" style="width:100%;text-align:left;border:0;background:var(--lime)" data-action="open-paywall"><div class="row gap12"><span class="ico-sq" style="background:var(--ink);color:var(--lime)">' + E.icon("gem") + '</span><span class="grow"><span class="heading" style="font-size:16px">EatAI Pro</span><span class="caption" style="display:block">Unlimited scans, coach, and trends</span></span>' + E.icon("chevron-right") + "</div></button>";
    const features = [
      ["gem", "Manage subscription", "Plan, billing, renewal", "subscription", true],
      ["trending-up", "Progress & weight", "Trends and history", "progress", false],
      ["scale", "Log weight", "A single weigh-in", "weight", false],
      ["droplet", "Water history", "Glasses and targets", "water-history", false],
      ["sparkles", "Coach history", "Daily check-ins", "coach-history", false],
      ["bookmark", "Saved meals", "Favorites and quick logging", "saved", false],
      ["camera", "Progress photos", "Weekly gallery", "photos", false],
      ["ruler", "Measurements", "Body metrics", "measurements", false],
      ["users", "Communities", "Groups and discovery", "communities", true],
      ["bell", "Reminders", "Meal and weigh-in alerts", "reminders", true],
      ["user", "Social profile", "Name, photo, bio", "social", true]
    ];
    const featureHtml = features.map(function (f) {
      const action = f[3] === "weight" ? 'data-action="open-weight"' : 'data-action="go" data-screen="' + f[3] + '"';
      return E.navRow(f[0], f[1], f[2], action);
    }).join("");
    const settings = [
      ["sparkles", "Coach", "Daily check-ins, timing, summaries", "settings-coach"],
      ["droplet", "Water", "Glass size, target, reminders", "settings-water"],
      ["flame", "Streak", "Mode, freeze, home chip", "settings-streak"],
      ["sliders-horizontal", "Tracking & units", "kg/lb, weigh-in, adaptive", "settings-tracking"],
      ["image", "Progress photo alerts", "Weekly reminder and export", "settings-photos"]
    ];
    const guest = u.isGuest ? '<div class="hero-card mt16"><div class="heading">Keep your progress</div><p class="caption mt8" style="color:rgba(255,255,255,.7)">Meals, streak, and chat live on a free account.</p><div class="mt12">' +
      E.btn("Add your email", { variant: "accent", attrs: 'data-action="ask-email" data-testid="profile-claim-email"' }) + '</div><div class="mt8">' +
      E.btn("I already have an account", { variant: "ghost", attrs: 'data-action="go" data-screen="login" style="color:white"' }) + "</div></div>" : "";
    const body = '<div class="center mt8">' + E.avatar({ name: u.name, color: u.color, size: 72 }) +
      '<div class="title mt12">' + E.esc(u.name || "You") + "</div>" +
      (u.email ? '<div class="caption">' + E.esc(u.email) + (u.isEmailVerified ? ' <span class="success">✓</span>' : "") + "</div>" : "") +
      (!u.isGuest ? '<div class="mt12">' + E.btn("Edit", { size: "sm", variant: "secondary", block: false, attrs: 'data-action="go" data-screen="edit-profile"' }) + "</div>" : "") +
      "</div>" + guest +
      (!u.isGuest && !u.isEmailVerified ? '<div class="banner amber mt12"><span>✉️</span><span>Verify your email to secure your account</span></div>' : "") +
      '<div class="grid3 mt16"><div class="stat">🔥<b>' + u.streak.current + '</b><span>Day streak</span></div><div class="stat">🏆<b>' + u.streak.best + '</b><span>Best</span></div><div class="stat">🎯<b class="nums">' + E.num(plan.kcal) + '</b><span>Daily goal</span></div></div>' +
      '<div class="card mt16"><button type="button" class="between plain" data-action="go" data-screen="goals"><span class="overline">My plan</span>' + E.icon("chevron-right") + '</button><div class="heading mt8">' + g.emoji + " " + g.label + "</div>" +
      E.macroDots(plan) + '<div class="grid2 mt12">' +
      E.btn("Goals & history", { size: "sm", attrs: 'data-action="go" data-screen="goals"' }) +
      E.btn("Edit targets", { size: "sm", variant: "secondary", attrs: 'data-action="go" data-screen="edit-targets"' }) +
      '</div><div class="caption mt12">' + u.weightKg + " kg · " + u.heightCm + " cm" +
      (u.kidMode ? " · Kid-friendly, no dieting target" : u.pregnancyStatus === "breastfeeding" ? " · Breastfeeding, about +300 kcal" : u.pregnancyStatus === "pregnant" ? " · Pregnancy, maintenance only" : "") +
      "</div></div>" +
      proCard +
      '<div class="card mt12 between"><div class="grow"><div class="heading" style="font-size:15px">AI Processing</div><div class="caption">Photo estimates stay on this demo device until you allow them.</div></div>' +
      E.switch(!!u.ai, 'data-action="ai-toggle"') + "</div>" +
      '<div class="overline mt24">Features</div><div class="list-card mt8">' + featureHtml + "</div>" +
      '<div class="overline mt24">App settings</div><div class="list-card mt8">' + settings.map(function (s) { return E.navRow(s[0], s[1], s[2], 'data-action="go" data-screen="' + s[3] + '"'); }).join("") + "</div>" +
      '<div class="overline mt24">Privacy & safety</div><div class="list-card mt8">' +
      E.navRow("shield", "Privacy & Safety", u.isGuest ? "Add your email to manage discovery" : "Discovery, pause, blocked, reports", 'data-action="go" data-screen="privacy"') + "</div>" +
      '<div class="overline mt24">Legal</div><div class="list-card mt8">' + E.navRow("scale", "Legal", "About, policies, privacy and deletion", 'data-action="go" data-screen="legal"') + "</div>" +
      '<div class="overline mt24">Account</div><div class="list-card mt8">' +
      (!u.isGuest && u.email ? E.navRow("lock", E.demoPasswords[(u.email || "").toLowerCase()] ? "Update password" : "Create a password", E.demoPasswords[(u.email || "").toLowerCase()] ? "Change the password for this email" : "Optional. You can keep using a login code.", 'data-action="open-password"') : "") +
      E.navRow("log-out", u.isGuest ? "Reset guest session" : "Log out", u.isGuest ? "Clears this demo guest" : "You'll return to the welcome screen", 'data-action="ask-logout"') +
      '<button type="button" class="nav-row" data-action="go" data-screen="delete-account"><span class="ico-sq">' + E.icon("trash-2") + '</span><span class="grow"><span class="heading danger" style="font-size:15px">Delete account</span><span class="caption" style="display:block">' + (u.deletion ? "Deletion scheduled" : "30-day grace period · full details") + "</span></span>" + E.icon("chevron-right") + "</button></div>" +
      '<button type="button" class="center mt24 caption" data-longpress="dev" style="width:100%;border:0;background:transparent;padding:12px">Version <b class="lime" style="color:var(--ink);background:var(--lime);border-radius:8px;padding:2px 6px">2.0.7</b></button>';
    return E.page({ tab: true, body: body });
  };

  E.screens.goals = function () {
    const gate = E.gate();
    const u = E.state.user;
    const g = E.goalMeta[u.goal] || E.goalMeta.lose;
    const past = (E.state.goals || []).filter(function (x) { return !x.active; });
    const body = gate || ('<div class="hero-card"><div class="overline" style="color:var(--lime)">' + g.emoji + " " + g.label + '</div><div class="kcal-num nums">' + E.num(u.plan.kcal) + '</div><div class="caption" style="color:rgba(255,255,255,.7)">kcal / day · ' + (u.plan.manual ? "Manual targets" : "Calculated") + "</div>" +
      '<div class="caption mt8" style="color:white">P ' + u.plan.p + " · C " + u.plan.c + " · F " + u.plan.f + "</div></div>" +
      '<div class="grid2 mt12">' + E.btn("Edit targets", { size: "md", attrs: 'data-action="go" data-screen="edit-targets"' }) +
      E.btn("Recalculate plan", { size: "md", variant: "secondary", attrs: 'data-action="recalc"' }) + "</div>" +
      '<div class="overline mt20">History</div>' +
      (past.length ? past.map(function (h) {
        const meta = E.goalMeta[h.type] || g;
        return '<div class="card mt12"><div class="between"><div><div class="heading" style="font-size:15px">' + meta.emoji + " " + meta.label + '</div><div class="caption">' + E.esc(h.from) + (h.to ? " – " + h.to : "") + " · " + h.kcal + ' kcal</div></div>' +
          E.btn("Restore", { size: "sm", variant: "secondary", block: false, attrs: 'data-action="restore-plan" data-id="' + h.id + '"' }) +
          E.btn("Delete", { size: "sm", variant: "ghost", block: false, attrs: 'data-action="ask-delete-goal" data-id="' + h.id + '"' }) + "</div></div>";
      }).join("") : E.empty({ emoji: "📜", title: "No earlier plans", sub: "Recalculate once and the previous plan lands here." })));
    return E.page({ top: E.topTitle("Goals & history"), pull: true, body: body });
  };

  E.screens["edit-targets"] = function () {
    const p = E.state.user.plan;
    const ui = E.state.ui;
    const mode = ui.macroMode || (p.manual ? "custom" : "auto");
    ui.macroMode = mode;
    const locked = mode !== "custom";
    const prot = E.protectedMode(E.state.user);
    const note = prot === "kid"
      ? "Under-16 plans stay on maintenance. You can nudge macros inside a safe range."
      : prot === "pregnant" || prot === "breastfeeding"
        ? "Pregnancy and breastfeeding plans stay on maintenance. No deficit targets."
        : mode === "auto"
          ? "Auto keeps the engine’s suggestion. Switch to Custom to fine-tune."
          : "Custom targets — Home will use these daily.";
    const kcal = ui.tKcal != null ? ui.tKcal : p.kcal;
    const pr = ui.tP != null ? ui.tP : p.p;
    const c = ui.tC != null ? ui.tC : p.c;
    const f = ui.tF != null ? ui.tF : p.f;
    const sum = E.macroKcal(pr, c, f);
    const off = Math.abs(sum - kcal) / Math.max(1, kcal) > 0.1;
    const field = function (label, key, val) {
      return '<div class="card mt12 between"><div><div class="caption">' + label + '</div><div class="title nums">' + val + '</div></div><div class="row gap8">' +
        E.iconBtn("minus", 'data-action="target-step" data-key="' + key + '" data-dir="-1"', "flat") +
        E.iconBtn("plus", 'data-action="target-step" data-key="' + key + '" data-dir="1"', "ink") + "</div></div>";
    };
    return E.page({
      top: E.topTitle("Edit targets", mode === "custom" ? "Custom daily limits" : "Auto daily limits"),
      body: '<div class="mt4">' + E.segmented([{ id: "auto", label: "Auto" }, { id: "custom", label: "Custom" }], mode, "macro-mode") + "</div>" +
        '<p class="caption mt12">' + note + "</p>" +
        '<div style="' + (locked ? "opacity:.55;pointer-events:none" : "") + '">' +
        field("Calories", "tKcal", kcal) + field("Protein g", "tP", pr) + field("Carbs g", "tC", c) + field("Fats g", "tF", f) + "</div>" +
        '<p class="caption mt12">Macros add up to about ' + E.num(sum) + " kcal. " + (mode === "custom" && off ? "That's more than 10% off the calorie target — nudge one side." : "Within 10%. Good to save.") + "</p>" +
        '<div class="mt16">' + E.btn("Save targets", { disabled: mode === "custom" && off, attrs: 'data-action="save-targets"' }) + "</div>" +
        '<div class="mt8">' + E.btn("Reset from body stats", { variant: "ghost", attrs: 'data-action="recalc"' }) + "</div>"
    });
  };

  E.screens.subscription = function () {
    const sub = E.state.user.subscription;
    const pro = E.isPro() || sub.status === "cancelled";
    const name = sub.plan === "yearly" ? "Yearly Pro" : sub.plan === "half" ? "6-Month Pro" : sub.plan === "monthly" ? "Monthly Pro" : "Free";
    const status = sub.status === "active" ? "Active" : sub.status === "trial" ? "Trial" : sub.status === "cancelled" ? "Cancelled" : "Free";
    const when = sub.renewsAt ? "Renews " + E.niceDate(sub.renewsAt) : sub.endsAt ? "Ends " + E.niceDate(sub.endsAt) : "No renewal scheduled";
    const days = sub.endsAt ? Math.max(0, Math.round((E.parseIso(sub.endsAt) - new Date()) / 86400000)) : null;
    const history = (E.state.payments || []).map(function (p) {
      return '<div class="between" style="padding:10px 0;border-bottom:1px solid rgba(18,18,16,.06)"><div><div class="heading" style="font-size:14px">₹' + E.num(p.amount) + '</div><div class="caption">' + E.niceDate(p.date) + " · " + E.esc(p.plan || "") + '</div></div><span class="label">' + E.esc(p.status) + "</span></div>";
    }).join("") || '<p class="caption">No payments yet.</p>';
    return E.page({
      top: E.topTitle("Subscription"),
      body: '<div class="card"><div class="overline">Current plan</div><div class="title mt8">' + name + '</div><div class="caption mt8">' + status + " · " + E.esc(sub.provider || "App Store") + "</div><div class=\"body mt8\">" + when + (days != null ? " · " + days + " days left" : "") + "</div></div>" +
        '<div class="stack mt16">' +
        E.btn("Change plan", { attrs: 'data-action="open-paywall"' }) +
        (pro && sub.status !== "cancelled" ? E.btn(sub.provider === "Razorpay" ? "Cancel auto-renew" : "Cancel in the store", { variant: "secondary", attrs: 'data-action="ask-cancel"' }) : "") +
        (sub.status === "cancelled" && sub.provider === "Razorpay" ? E.btn("Resume Pro", { attrs: 'data-action="resume-sub"' }) : "") +
        E.btn("Restore purchases", { variant: "secondary", attrs: 'data-action="restore"' }) +
        E.btn("Open store subscriptions", { variant: "ghost", attrs: 'data-action="store-link"' }) +
        "</div><div class=\"overline mt20\">Payment history</div><div class=\"card mt8\">" + history + "</div>"
    });
  };

  E.modals.paywall = function () {
    const u = E.state.user;
    const pro = E.isPro();
    const plan = E.state.ui.selectedPlan || "yearly";
    const off = E.state.ui.offerOff || 0;
    const priceOf = function (n) { return off ? "₹" + E.num(Math.round(n * (1 - off))) : "₹" + E.num(n); };
    const plans = [
      { id: "yearly", name: "Yearly", price: priceOf(1999), per: "₹167 / month", note: "Best value" },
      { id: "sixmonth", name: "6 months", price: priceOf(999), per: "₹167 / month", note: "" },
      { id: "monthly", name: "Monthly", price: priceOf(299), per: "Billed monthly", note: "" }
    ];
    if (u.isGuest) {
      return '<div class="paywall"><button type="button" class="icon-btn on-photo" data-action="close-modal">' + E.icon("x") + '</button><div class="title mt20">Add your email</div><p class="body mt8" style="color:rgba(255,255,255,.7)">We\'ll send a code and bring you back to this plan. This demo never charges you.</p><div class="mt20">' +
        E.btn("Add your email", { variant: "accent", attrs: 'data-action="guest-pro" data-testid="paywall-claim-email"' }) + "</div></div>";
    }
    const provider = E.state.ui.billingProvider || "store";
    const razor = provider === "razorpay";
    const perks = [["scan", "Unlimited AI photo and text scans"], ["barcode", "Barcode scanner"], ["sparkles", "Daily AI coach"], ["trending-up", "Weight trend and weekly reports"], ["droplet", "Water, streaks and saved meals"]];
    const chosen = plans.find(function (p) { return p.id === plan; }) || plans[0];
    const offer = razor ? '<div class="mt12">' + E.field({ label: "Offer code", id: "offer", model: "offer-code", value: E.state.ui.offerCode, placeholder: "SAVE20" }) +
      (E.state.ui.offerError ? '<p class="field-error mt8">' + E.esc(E.state.ui.offerError) + "</p>" : "") +
      '<div class="mt8">' + E.btn(off ? "Offer applied · 20% off" : "Apply code", { size: "md", variant: "light", attrs: 'data-action="apply-offer"' }) + "</div></div>" : "";
    return '<div class="paywall"><div class="between"><button type="button" class="icon-btn" style="background:rgba(255,255,255,.12);color:white" data-action="close-modal" aria-label="Close">' + E.icon("x") + '</button><span class="gold">EATAI PRO</span><span style="width:44px"></span></div>' +
      '<div class="display mt12" style="font-size:34px">' + (pro ? "You're on Pro" : "Hit your goals 2× faster") + "</div>" +
      '<div class="mt12">' + E.segmented([{ id: "store", label: "App Store / Play" }, { id: "razorpay", label: "Razorpay" }], provider, "billing-provider") + "</div>" +
      '<div class="mt16">' + perks.map(function (p) { return '<div class="row gap12" style="padding:6px 0"><span class="ico-sq" style="background:rgba(255,255,255,.08);color:var(--lime)">' + E.icon(p[0] === "barcode" ? "scan-barcode" : p[0]) + '</span><span>' + p[1] + "</span></div>"; }).join("") + "</div>" +
      '<div class="mt12" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">' + plans.map(function (p) {
        return '<button type="button" class="plan ' + (plan === p.id ? "on" : "") + '" data-action="pick-plan" data-id="' + p.id + '"><div class="caption" style="color:#e6c56a">' + p.note + '</div><div class="label">' + p.name + '</div><b>' + p.price + '</b><div class="caption" style="color:rgba(255,255,255,.65)">' + p.per + "</div></button>";
      }).join("") + "</div>" + offer +
      '<div class="mt12">' + E.btn(pro ? "You're subscribed" : "Continue · " + chosen.price, { variant: "accent", disabled: pro, busy: E.state.ui.busy === "buy", attrs: 'data-action="buy"' }) + "</div>" +
      (!u.subscription.trialUsed && !pro && !razor ? '<div class="mt8">' + E.btn("Start 3-day free trial", { variant: "light", attrs: 'data-action="trial"' }) + "</div>" : "") +
      '<p class="caption center mt12" style="color:rgba(255,255,255,.55)">Demo only — you won\'t be charged. Billed via ' + (razor ? "Razorpay" : "App Store / Play") + ". Offer codes work on Razorpay. SAVE20 is 20% off.</p></div>";
  };

  E.modals["ai-consent"] = function () {
    return '<div class="modal-wrap" style="background:var(--canvas);overflow:auto;padding:16px 20px 28px"><div class="overline">Before we estimate</div><div class="title mt8">Allow AI Processing?</div>' +
      '<p class="body muted mt12">Food scan and describe meal send the photo or the text you type so we can estimate calories. We don\'t use it for ads. You can turn this off later on Profile.</p>' +
      '<div class="mt20">' + E.btn("Allow AI Processing", { attrs: 'data-action="ai-allow" data-testid="ai-allow"' }) + "</div>" +
      '<div class="mt8">' + E.btn("Not now", { variant: "secondary", attrs: 'data-action="ai-not-now" data-testid="ai-not-now"' }) + "</div>" +
      '<p class="caption center mt12">If you choose Not now, food scan and describe stay off.</p></div>';
  };

  function settingsShell(title, sub, body) {
    return E.page({ top: E.topTitle(title, sub), body: body });
  }
  E.screens["settings-coach"] = function () {
    const c = E.state.prefs.coach;
    const pro = E.isPro();
    const times = ["17:00", "18:00", "19:00", "20:00", "21:00"];
    return settingsShell("Coach", "Daily check-ins, timing, summaries",
      (!pro ? '<button type="button" class="banner" data-action="open-paywall"><span>✨</span><span class="grow"><b>Coach timing is a Pro extra</b><div class="caption">You can still read today\'s note on Home.</div></span></button>' : "") +
      '<div class="list-card mt12">' +
      rowToggle("Daily coach", "A short note on Home", c.daily, "prefs.coach.daily", !pro) +
      rowToggle("Weekly summary", "Sunday snapshot", c.weekly, "prefs.coach.weekly", !pro) +
      rowToggle("Morning motivation", "One line with breakfast", c.morning, "prefs.coach.morning", !pro) +
      "</div><div class=\"overline mt16\">Coach time</div><div class=\"mt8\">" + E.chips(times, c.time, "coach-time") + "</div>" +
      '<div class="mt16">' + E.btn("Open coach history", { variant: "secondary", attrs: 'data-action="go" data-screen="coach-history"' }) + "</div>");
  };
  function rowToggle(title, sub, on, path, locked) {
    return '<div class="set-row"><div class="grow"><div class="heading" style="font-size:15px">' + title + '</div><div class="caption">' + sub + '</div></div>' +
      (locked ? '<button type="button" class="switch" data-action="open-paywall" aria-label="Pro"><span class="knob"></span></button>' : E.switch(on, 'data-action="toggle" data-path="' + path + '"')) + "</div>";
  }
  E.screens["settings-water"] = function () {
    const w = E.state.prefs.water;
    return settingsShell("Water", "Glass size, daily target, and reminders",
      '<div class="list-card">' + rowToggle("Water reminders", "Nudge you to drink during the day", w.reminders, "prefs.water.reminders") +
      rowToggle("Smart reminders", "Skip nudges when you're already on track (Pro)", w.smart, "prefs.water.smart", !E.isPro()) + "</div>" +
      stepCard("Glass size", w.glassMl + " ml", "glass") + stepCard("Daily target", w.target + " glasses", "wtarget") +
      '<div class="overline mt16">Window start</div><div class="mt8">' + E.chips(["06:00", "08:00", "10:00"], w.reminderStart || "08:00", "water-start") + "</div>" +
      '<div class="overline mt16">Window end</div><div class="mt8">' + E.chips(["20:00", "21:00", "22:00"], w.reminderEnd || "22:00", "water-end") + "</div>");
  };
  function stepCard(label, value, key) {
    return '<div class="card mt12 between"><div><div class="caption">' + label + '</div><div class="heading">' + value + '</div></div><div class="row gap8">' +
      E.iconBtn("minus", 'data-action="pref-step" data-key="' + key + '" data-dir="-1"', "flat") +
      E.iconBtn("plus", 'data-action="pref-step" data-key="' + key + '" data-dir="1"', "ink") + "</div></div>";
  }
  E.screens["settings-streak"] = function () {
    const s = E.state.prefs.streak;
    return settingsShell("Streak", "Mode, freeze, home chip",
      '<div class="caption">A missed day can use a freeze instead of resetting. No guilt copy — just the count.</div>' +
      '<div class="mt12">' + E.segmented([{ id: "meals", label: "Any meal" }, { id: "goal", label: "Hit goal" }], s.mode, "streak-mode") + "</div>" +
      '<div class="list-card mt12">' + rowToggle("Use freezes", "Spend one on a missed day", s.freeze, "prefs.streak.freeze") +
      rowToggle("Home chip", "Show the fire pill on Home", s.showChip, "prefs.streak.showChip") + "</div>");
  };
  E.screens["settings-tracking"] = function () {
    const u = E.state.prefs.units;
    return settingsShell("Tracking & units", "Weight, length, adaptive calories",
      '<div class="overline">Weight</div><div class="mt8">' + E.segmented([{ id: "kg", label: "kg" }, { id: "lb", label: "lb" }], u.weight, "unit-weight") + "</div>" +
      '<div class="overline mt16">Length</div><div class="mt8">' + E.segmented([{ id: "cm", label: "cm" }, { id: "ft", label: "ft" }], u.length, "unit-length") + "</div>" +
      '<div class="list-card mt16">' + rowToggle("Adaptive macros", "Gently adjust targets from weigh-in trends (Pro)", u.adaptive, "prefs.units.adaptive", !E.isPro()) + "</div>" +
      '<div class="list-card mt16">' + rowToggle("Weekly weigh-in reminder", (u.weighInDay || "sun") + " · " + (u.weighInTime || "08:00"), u.weighInOn !== false, "prefs.units.weighInOn") + "</div>" +
      '<div class="overline mt16">Reminder day</div><div class="mt8">' + E.chips(["sun", "mon", "tue", "wed", "thu", "fri", "sat"], u.weighInDay || "sun", "weighin-day") + "</div>" +
      '<div class="overline mt16">Reminder time</div><div class="mt8">' + E.chips(["06:00", "07:00", "08:00", "09:00"], u.weighInTime || "08:00", "weighin-time") + "</div>");
  };
  E.screens["settings-photos"] = function () {
    const p = E.state.prefs.photos;
    return settingsShell("Progress photo alerts", "Weekly reminder and export",
      '<div class="list-card">' + rowToggle("Weekly photo reminder", (p.day || "sun") + " · " + (p.time || "09:00"), p.weekly, "prefs.photos.weekly", !E.isPro()) + "</div>" +
      '<div class="overline mt16">Reminder day</div><div class="mt8">' + E.chips(["sun", "mon", "wed", "fri"], p.day || "sun", "photo-day") + "</div>" +
      '<div class="mt12">' + E.chips(["07:00", "09:00", "18:00"], p.time, "photo-time") + "</div>" +
      '<div class="mt16">' + E.btn("Export gallery (demo)", { variant: "secondary", attrs: 'data-action="toast" data-msg="Would export your gallery"' }) + "</div>");
  };

  E.screens.reminders = function () {
    const r = E.state.prefs.reminders;
    return settingsShell("Reminders", "Saved on this device only",
      '<div class="list-card">' +
      rowToggle("Breakfast", r.bTime, r.breakfast, "prefs.reminders.breakfast") +
      rowToggle("Lunch", r.lTime, r.lunch, "prefs.reminders.lunch") +
      rowToggle("Dinner", r.dTime, r.dinner, "prefs.reminders.dinner") + "</div>" +
      '<div class="overline mt16">Custom reminder</div>' +
      '<div class="mt8">' + E.field({ label: "Title", id: "crt", model: "custom-title", value: E.state.ui.customTitle, placeholder: "Log a snack" }) + "</div>" +
      '<div class="mt8">' + E.chips(["11:00", "15:00", "16:30"], E.state.ui.customTime || "15:00", "custom-time") + "</div>" +
      '<div class="mt12">' + E.btn("Add custom reminder", { attrs: 'data-action="add-reminder"' }) + "</div>" +
      (r.custom || []).map(function (c) {
        return '<div class="between card mt12"><div><b>' + E.esc(c.title) + '</b><div class="caption">' + E.esc(c.time) + " · " + (c.on ? "On" : "Off") + "</div></div>" +
          E.btn(c.on ? "Turn off" : "Turn on", { size: "sm", variant: "secondary", block: false, attrs: 'data-action="toggle-reminder" data-id="' + c.id + '"' }) + "</div>";
      }).join(""));
  };

  E.screens.saved = function () {
    const gate = E.gate();
    const rows = (E.state.saved || []).map(function (m) {
      const t = E.mealTotals(m);
      return '<div class="between" style="padding:8px 0"><button type="button" class="meal grow" data-action="quick-add" data-id="' + m.id + '">' + E.photo(m.image, m.emoji, "thumb") +
        '<span class="grow"><span class="heading" style="font-size:15px">' + E.esc(m.name) + "</span><span class=\"caption\">" + E.num(t.kcal) + ' kcal</span></span></button>' +
        E.iconBtn("trash-2", 'data-action="delete-saved" data-id="' + m.id + '" aria-label="Delete saved meal"', "flat") + "</div>";
    }).join("");
    return E.page({ top: E.topTitle("Saved meals", "Tap to log · bin to remove"), body: gate || rows || E.empty({ emoji: "⭐", title: "No saved meals", sub: "Turn on Save for quick add after a scan." }) });
  };
  E.screens["water-history"] = function () {
    const target = E.state.prefs.water.target;
    const rows = (E.state.waterLog || []).slice().reverse().map(function (w) {
      const pct = Math.min(100, Math.round(w.glasses / target * 100));
      return '<div class="card mt12"><div class="between"><b>' + E.shortDate(w.date) + '</b><span class="caption">' + w.glasses + " of " + target + '</span></div><div class="track light mt8"><span style="width:' + pct + '%;background:var(--water)"></span></div></div>';
    }).join("");
    return E.page({ top: E.topTitle("Water history"), body: rows || E.empty({ emoji: "💧", title: "No glasses yet" }) });
  };
  E.screens["coach-history"] = function () {
    const rows = (E.state.coachHistory || []).map(function (c) {
      return '<div class="card mt12"><div class="caption">' + E.shortDate(c.date) + '</div><div class="heading mt8">' + E.esc(c.title) + '</div><p class="body mt8">' + E.esc(c.body) + '</p>' + (c.tip ? '<div class="coach-tip mt8">💡 ' + E.esc(c.tip) + "</div>" : "") + "</div>";
    }).join("");
    return E.page({ top: E.topTitle("Coach history"), body: rows || E.empty({ emoji: "✨", title: "No notes yet" }) });
  };
  E.screens.photos = function () {
    const cards = (E.state.photos || []).map(function (p) {
      return '<div class="card mt12"><div class="photo" style="height:140px;border-radius:16px;background:hsl(' + p.hue + ',35%,78%)"><span>📷</span></div><div class="heading mt8" style="font-size:15px">' + E.esc(p.caption) + '</div><div class="caption">' + E.niceDate(p.date) + "</div></div>";
    }).join("");
    return E.page({ top: E.topTitle("Progress photos"), body: cards + '<div class="mt16">' + E.btn("Add photo", { attrs: 'data-action="add-photo"' }) + "</div>" });
  };
  E.screens.measurements = function () {
    const rows = (E.state.measurements || []).map(function (m) {
      return '<div class="card mt12"><div class="caption">' + E.niceDate(m.date) + '</div><div class="body mt8">Waist ' + m.waist + " · Hips " + m.hips + " · Chest " + m.chest + " cm</div></div>";
    }).join("");
    return E.page({
      top: E.topTitle("Measurements"),
      body: '<div class="grid3">' +
        E.field({ label: "Waist", id: "mw", model: "mw", value: E.state.ui.measureWaist, placeholder: "82" }) +
        E.field({ label: "Hips · Pro", id: "mh", model: "mh", value: E.state.ui.measureHips, placeholder: "98" }) +
        E.field({ label: "Chest · Pro", id: "mc", model: "mc", value: E.state.ui.measureChest, placeholder: "90" }) +
        '</div><p class="caption mt8">Waist is free. Hips and chest need Pro.</p><div class="mt12">' + E.btn("Save measurement", { attrs: 'data-action="save-measure"' }) + "</div>" + rows
    });
  };

  E.screens.privacy = function () {
    const p = E.state.prefs.privacy;
    const paused = p.pausedUntil;
    return E.page({
      top: E.topTitle("Privacy & Safety"),
      body: '<div class="card"><div class="heading">Discovery pause</div>' +
        (paused ? '<p class="caption mt8">Paused ' + (paused === "until" ? "until you return" : "until " + E.niceDate(paused)) + '.</p><div class="mt12">' + E.btn("Resume discovery", { size: "md", attrs: 'data-action="resume-discovery"' }) + "</div>" : '<p class="caption mt8">Hide yourself for a while. People you already chat with stay.</p>') +
        '<div class="hscroll mt12">' + ["7", "14", "30", "until"].map(function (d) {
          return '<button type="button" class="chip" data-action="pause" data-value="' + d + '">' + (d === "until" ? "Until I return" : d + " days") + "</button>";
        }).join("") + "</div></div>" +
        '<div class="list-card mt12">' + rowToggle("Discovery", "Let people nearby find you", p.discovery, "prefs.privacy.discovery") +
        rowToggle("Same gender only", "A narrower circle", p.sameGender, "prefs.privacy.sameGender") + "</div>" +
        '<div class="overline mt16">Max distance</div><div class="mt8">' + E.chips(["Any", "5 km", "10 km", "25 km", "50 km"], p.distance, "distance") + "</div>" +
        '<div class="overline mt16">City visibility</div><div class="mt8">' + E.chips(["Full city", "State only", "Hidden"], p.cityVisibility === "state" ? "State only" : p.cityVisibility === "hidden" ? "Hidden" : "Full city", "city-vis") + "</div>" +
        '<div class="overline mt16">Auto-decline requests</div><div class="mt8">' + E.chips(["Off", "7 days", "14 days", "30 days"], p.autoDecline === "Off" ? "Off" : p.autoDecline + " days", "autodecline") + "</div>" +
        '<div class="list-card mt16">' +
        E.navRow("ban", "Blocked users", "People you don't want to hear from", 'data-action="go" data-screen="blocked"') +
        E.navRow("flag", "Reports I've filed", "Pending and reviewed", 'data-action="go" data-screen="reports"') +
        E.navRow("download", "Download my data", "A demo file on this device", 'data-action="download-data"') +
        E.navRow("lock", "Privacy policy", "How this demo treats data", 'data-action="go" data-screen="privacy-policy"') +
        "</div>"
    });
  };
  E.screens.blocked = function () {
    const rows = (E.state.blocked || []).map(function (b) {
      return '<div class="between card mt12">' + E.avatar({ name: b.name, color: b.color, size: 42 }) + '<span class="grow" style="padding-left:10px">' + E.esc(b.name) + '</span>' +
        E.btn("Unblock", { size: "sm", variant: "secondary", block: false, attrs: 'data-action="unblock" data-id="' + b.id + '"' }) + "</div>";
    }).join("");
    return E.page({ top: E.topTitle("Blocked users"), body: rows || E.empty({ emoji: "👍", title: "No one is blocked", sub: "When you block someone from a chat, they land here." }) });
  };
  E.screens.reports = function () {
    const rows = (E.state.reports || []).map(function (r) {
      return '<div class="card mt12"><div class="heading" style="font-size:15px">' + E.esc(r.name) + '</div><div class="caption mt4">' + E.esc(r.reason) + "</div><div class=\"label mt8\">" + E.esc(r.status) + " · " + E.esc(r.date) + "</div></div>";
    }).join("");
    return E.page({ top: E.topTitle("Reports I've filed"), body: rows || E.empty({ emoji: "🛡️", title: "No reports", sub: "If you report a message, the status shows here." }) });
  };

  E.screens["delete-account"] = function () {
    const u = E.state.user;
    if (u.isGuest) {
      return E.page({ top: E.topTitle("Delete account"), body: E.empty({ emoji: "☁️", title: "You're a guest", sub: "There's no account to delete. Reset the guest session from Profile if you want a clean start." }) });
    }
    if (u.deletion) {
      return E.page({
        top: E.topTitle("Deletion scheduled"),
        body: '<div class="title">Your account stays until ' + E.niceDate(u.deletion.endsAt) + '</div><p class="body muted mt12">You can keep using EatAI. Nothing is erased while the grace window is open.</p><ul class="body"><li>Meals and messages stay put</li><li>You can cancel with one tap</li><li>After the date, this demo clears local data</li></ul>' +
          '<div class="mt20">' + E.btn("Cancel deletion request", { attrs: 'data-action="cancel-deletion"' }) + "</div>" +
          '<div class="mt8">' + E.btn("Keep account", { variant: "secondary", attrs: 'data-action="cancel-deletion"' }) + "</div>"
      });
    }
    return E.page({
      top: E.topTitle("Delete account"),
      body: '<div class="title">30 days to change your mind</div><p class="body muted mt12">Deletion is a request, not an instant erase. We\'d rather you leave on purpose.</p>' +
        '<div class="card mt16"><b>Before deletion</b><p class="caption mt8">You review this screen and tick the box. A confirm dialog follows. Profile never deletes in one tap.</p></div>' +
        '<div class="card mt12"><b>While pending</b><p class="caption mt8">You can log meals, cancel the request, or simply keep the account. The end date stays visible.</p></div>' +
        '<label class="row gap12 mt16"><input class="check" type="checkbox" data-model="delete-ack" ' + (E.state.ui.deleteAck ? "checked" : "") + '> <span class="body">I understand the 30-day grace period and that I can cancel.</span></label>' +
        '<div class="mt20">' + E.btn("Start deletion request", { variant: "danger", disabled: !E.state.ui.deleteAck, attrs: 'data-action="ask-delete"' }) + "</div>"
    });
  };

  E.screens.legal = function () {
    return E.page({
      top: '<button type="button" class="icon-btn" data-action="back" aria-label="Close">' + E.icon("x") + '</button><div class="top-title"><div class="heading">Legal</div></div>',
      body: E.aboutHero() +
        '<div class="mt16"><div class="heading">About EatAI</div><p class="body muted mt8">EatAI helps you photograph a plate, scan a barcode, or type a meal — then see calories and macros without a guilt trip. Friends are for accountability, not dating.</p></div>' +
        '<div class="mt16"><div class="heading">Policies</div><p class="body muted mt8">Estimates are estimates. Health decisions belong with you and a professional. This prototype stores data in your browser only.</p></div>' +
        '<div class="list-card mt16">' +
        E.navRow("lock", "Privacy Policy", "Read it here", 'data-action="go" data-screen="privacy-policy"') +
        E.navRow("mail", "Support", "Questions and a demo inbox", 'data-action="go" data-screen="support"') +
        E.navRow("trash-2", "Delete account (info)", "Grace period and what remains", 'data-action="go" data-screen="delete-account"') +
        "</div>" +
        '<div class="card mt12"><b>Account deletion</b><p class="caption mt8">30 days to cancel. Meals, messages, and photos in this demo are removed only after that, and only on this device.</p></div>'
    });
  };
  E.screens["privacy-policy"] = function () {
    return E.page({
      top: E.topTitle("Privacy Policy"),
      body: '<p class="body">This is demo copy for the prototype, not a live policy.</p><p class="body mt12">Meal photos, weight, and messages stay in local storage on this device. There is no server account. Turning on AI Processing does not upload anything.</p><p class="body mt12">Discovery distance, blocks, and reports are simulated so you can review the screens.</p><p class="caption mt16">Would open a browser on the production app. Here, the text is in front of you.</p>'
    });
  };
  E.screens.support = function () {
    return E.page({
      top: E.topTitle("Support"),
      body: '<div class="card"><div class="heading">We read every note</div><p class="body muted mt8">Email hello@eat.ai — in this demo that doesn\'t send. Tap below to see the pretend handoff.</p></div>' +
        '<div class="mt16">' + E.btn("Email support", { attrs: 'data-action="toast" data-msg="Would open your mail app"' }) + "</div>" +
        '<div class="card mt16"><b>Scanning feels off</b><p class="caption mt8">Edit the line items before you add the meal. The number is a guess.</p></div>' +
        '<div class="card mt12"><b>Charged by mistake?</b><p class="caption mt8">This build cannot charge you. Production receipts would show under Subscription.</p></div>'
    });
  };
  E.screens["edit-profile"] = function () {
    const u = E.state.user;
    return E.page({
      top: E.topTitle("Edit profile"),
      body: '<div class="center"><button type="button" class="avatar" style="width:84px;height:84px;border:0;background:' + u.color + '" data-action="cycle-color">' + E.esc(E.initials(u.name)) + '</button><div class="caption mt8">Tap the circle to change colour</div></div>' +
        '<div class="mt16">' + E.field({ label: "Name", id: "ename", model: "edit-name", value: E.state.ui.editName || u.name }) + "</div>" +
        '<div class="mt12">' + E.field({ label: "Email", id: "eemail", value: u.email, attrs: "readonly" }) + "</div>" +
        '<div class="mt16">' + E.btn("Save profile", { attrs: 'data-action="save-profile"' }) + "</div>"
    });
  };
  E.screens.social = function () {
    const u = E.state.user;
    const trains = ["Gym", "Running", "Yoga", "Cycling", "Walking", "HIIT"];
    return E.page({
      top: E.topTitle("Social profile"),
      body: '<p class="caption">Shown when someone finds you. Accountability, not a dating bio.</p>' +
        '<div class="mt12">' + E.field({ label: "Bio", id: "sbio", model: "bio", value: u.bio, placeholder: "What you're training for" }) + "</div>" +
        '<div class="mt12"><div class="field-label">Training</div><div class="mt8">' + E.chips(trains, u.training || [], "social-tag") + "</div></div>" +
        '<div class="mt12">' + E.field({ label: "City", id: "scity", model: "city-q", value: u.city }) + "</div>" +
        '<div class="card mt12 between"><div><div class="heading" style="font-size:15px">Discovery</div><div class="caption">18+ accountability only</div></div>' + E.switch(u.discovery, 'data-action="toggle" data-path="user.discovery"') + "</div>" +
        '<div class="mt16">' + E.btn("Save social profile", { attrs: 'data-action="save-social"' }) + "</div>"
    });
  };

  E.modals.dev = function () {
    const personas = [
      ["priya", "Priya · free"],
      ["rahul", "Rahul · Pro"],
      ["guest", "Guest in app"],
      ["sam", "Sam · unverified"],
      ["aisha", "Aisha · chat setup"],
      ["teen", "Aarav · under 18"],
      ["kid", "Aman · under 16"],
      ["sunita", "Sunita · breastfeeding"],
      ["fresh", "Onboarding incomplete"]
    ];
    const jumps = [["paywall", "Paywall", "open-paywall"], ["scan", "Scan", "open-scan"], ["delete-account", "Delete account", "go"]];
    return '<div class="sheet-wrap"><button type="button" class="backdrop" data-action="close-modal"></button><div class="sheet"><div class="grabber"></div><div class="heading">Demo controls</div>' +
      '<p class="caption mt8">Hidden on purpose. Login hints: priya@eat.ai, rahul@eat.ai, sam@demo.app. Any password except the word wrong. OTP is 123456.</p>' +
      '<div class="mt12">' + personas.map(function (p) {
        return '<button type="button" class="chip" style="margin:4px" data-action="persona" data-id="' + p[0] + '">' + p[1] + "</button>";
      }).join("") + "</div>" +
      '<div class="list-card mt12">' +
      rowToggle("Scan limit reached", "Free user sees the Pro lock", E.state.flags.scanLimit, "flags.scanLimit") +
      rowToggle("Camera denied", "Permission screen on Photo", E.state.flags.cameraDenied, "flags.cameraDenied") +
      rowToggle("List loading", "Skeleton lists", E.state.flags.forceLoading, "flags.forceLoading") +
      rowToggle("List error", "Error empty states", E.state.flags.forceError, "flags.forceError") +
      rowToggle("Slow network", "Photo scan times out, then retry", E.state.flags.slowNet, "flags.slowNet") +
      "</div>" +
      '<div class="grid2 mt12">' +
      E.btn("Error toast", { size: "sm", variant: "secondary", attrs: 'data-action="toast" data-kind="err" data-msg="Couldn\'t save — check connection"' }) +
      E.btn("Confirm dialog", { size: "sm", variant: "secondary", attrs: 'data-action="sample-confirm"' }) +
      "</div><div class=\"mt12\">" + E.btn("Reset demo data", { variant: "danger", size: "md", attrs: 'data-action="reset-demo"' }) + "</div></div></div>";
  };
})();
