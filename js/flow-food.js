(function () {
  const E = window.EatAI;

  function weekCells() {
    const now = new Date();
    const day = now.getDay();
    const monday = day === 0 ? -6 : 1 - day;
    let html = "";
    for (let i = 0; i < 7; i++) {
      const d = E.addDays(monday + i);
      const iso = E.iso(d);
      const today = iso === E.todayIso();
      const future = iso > E.todayIso();
      const status = E.state.dayStatus[iso];
      let cls = "bubble";
      let inner = String(d.getDate());
      if (future) cls += " future";
      else if (today) {
        const logged = E.dayMeals(iso).length > 0;
        const over = logged && E.dayTotals(iso).kcal > E.state.user.plan.kcal;
        if (logged && over) cls += " warn today";
        else if (logged) cls += " done today";
        else cls += " today";
        if (logged && !over && E.dayTotals(iso).kcal >= E.state.user.plan.kcal * 0.9) inner = "✓";
      } else if (status === "done") { cls += " done"; inner = "✓"; }
      else if (status === "warning") cls += " warn";
      else if (status === "missed") cls += " miss";
      const letter = d.toLocaleDateString("en-IN", { weekday: "narrow" });
      html += '<button type="button" data-action="open-day" data-iso="' + iso + '"><span class="dow">' + letter + '</span><span class="' + cls + '">' + inner + "</span></button>";
    }
    return html;
  }

  E.screens.home = function () {
    const gate = E.gate();
    if (gate) return E.page({ tab: true, pull: true, body: gate });
    const u = E.state.user;
    const plan = u.plan;
    const iso = E.todayIso();
    const eaten = E.dayTotals(iso);
    const left = plan.kcal - eaten.kcal;
    const over = left < 0;
    const meals = E.dayMeals(iso).slice(0, 6);
    const water = E.glassesOn(iso);
    const target = E.state.prefs.water.target;
    const coachOn = E.state.prefs.coach.daily;
    const coach = E.liveCoach();
    const saved = E.state.saved || [];
    let mealsHtml = "";
    if (!meals.length) {
      mealsHtml = '<div class="dashed-empty"><div class="empty-orb">📷</div><div class="heading">Snap your first meal</div><p class="caption mt8">Photo, barcode, or a few words. Estimates stay editable.</p><div class="mt12">' +
        E.btn("Scan a meal", { size: "md", attrs: 'data-action="open-scan"' }) + "</div></div>";
    } else {
      mealsHtml = meals.map(function (m) {
        const t = E.mealTotals(m);
        return '<button type="button" class="meal" data-action="open-meal" data-id="' + m.id + '">' +
          E.photo(m.image, m.emoji, "thumb") +
          '<span class="grow"><span class="heading" style="font-size:15px">' + E.esc(m.name) + '</span><span class="caption">' + E.esc(m.time) + "</span></span>" +
          '<span class="label nums">' + E.num(t.kcal) + "</span></button>";
      }).join("");
    }
    const savedHtml = saved.map(function (m) {
      const t = E.mealTotals(m);
      return '<div class="swiper-slide eat-slide"><button type="button" class="saved-card" data-action="quick-add" data-id="' + m.id + '">' +
        E.photo(m.image, m.emoji) + '<span class="plus-badge">+</span>' +
        '<div class="heading mt8" style="font-size:14px">' + E.esc(m.name) + '</div><div class="caption">' + E.num(t.kcal) + " kcal</div></button></div>";
    }).join("");
    const glasses = Array.from({ length: target }, function (_, i) {
      return '<button type="button" class="glass ' + (i < water ? "full" : "") + '" data-action="glass" aria-label="Add a glass"></button>';
    }).join("");
    const body = '<div class="between rise"><div><div class="overline">' + E.esc(E.shortDate(iso)) + " · " + E.esc(E.greeting()) + '</div>' +
      '<h1 class="hero mt8">Hi, ' + E.esc(E.first(u.name)) + "</h1></div>" +
      '<div class="row gap8">' +
      (E.state.prefs.streak.showChip ? '<button type="button" class="streak-pill" data-action="go" data-screen="progress">🔥 ' + u.streak.current + "</button>" : "") +
      '<button type="button" class="avatar" style="width:42px;height:42px;background:' + u.color + '" data-action="tab" data-tab="profile" aria-label="Profile">' + E.esc(E.initials(u.name)) + "</button></div></div>" +
      '<div class="week rise">' + weekCells() + "</div>" +
      '<div class="hero-card mt12 rise"><div class="between"><div><div class="overline" style="color:' + (over ? "var(--protein)" : "var(--lime)") + '">' + (over ? "Over today" : "Calories left") + "</div>" +
      '<div class="kcal-num nums">' + E.num(Math.abs(left)) + '</div><div class="caption mt8" style="color:rgba(255,255,255,.62)">' + E.num(eaten.kcal) + " eaten · " + E.num(plan.kcal) + " goal</div>" +
      (over ? '<div class="caption mt8" style="color:rgba(255,255,255,.75)">Tomorrow is a fresh plate. No catching up required.</div>' : "") +
      "</div>" + E.ring(Math.min(1, eaten.kcal / Math.max(1, plan.kcal)), { color: over ? "#FF6A3D" : "#C6F135", center: E.icon("flame") }) + "</div>" +
      '<div class="mt8">' + E.macros(eaten, plan, false) + "</div></div>" +
      (u.isGuest ? '<button type="button" class="banner mt16 rise" data-action="ask-email"><span style="font-size:28px">☁️</span><span class="grow"><span class="heading" style="font-size:16px">Save your progress</span><span class="caption">Add your email. A code unlocks chat and the rest.</span></span></button>' : "") +
      (coachOn ? '<button type="button" class="card mt16 rise" data-action="go" data-screen="coach-history" style="text-align:left;border:0;width:100%;color:inherit"><div class="row gap12"><span class="avatar" style="width:42px;height:42px;background:var(--soft)">' + E.icon("sparkles") + '</span><span class="overline">Coach</span></div><div class="heading mt12">' + E.esc(coach.title) + '</div><p class="body mt8">' + E.esc(coach.body) + '</p><div class="coach-tip mt12">💡 ' + E.esc(coach.tip) + "</div></button>"
        : '<p class="card mt16 body">“Small plates, steady days. You\'re already in motion.”</p>') +
      '<div class="card mt16 rise"><div class="between"><div><div class="overline">Water</div><div class="heading mt4">' + water + " of " + target + ' glasses</div></div>' +
      '<div class="row gap8"><button type="button" class="icon-btn flat" data-action="water-undo" aria-label="Undo glass">' + E.icon("undo-2") + '</button>' +
      E.btn("+ Glass", { size: "sm", block: false, attrs: 'data-action="water-add"' }) + "</div></div>" +
      '<div class="glasses mt12">' + glasses + "</div></div>" +
      '<div class="section-head"><h2>Eat it again</h2></div>' +
      '<div class="swiper eat-swiper"><div class="swiper-wrapper">' + savedHtml + "</div></div>" +
      '<div class="section-head"><h2>Today\'s meals</h2>' + (meals.length ? '<button type="button" class="linkish" data-action="tab" data-tab="diary">Diary ' + E.icon("chevron-right") + "</button>" : "") + "</div>" +
      mealsHtml;
    return E.page({ tab: true, pull: true, body: body });
  };

  E.screens.diary = function () {
    const gate = E.gate();
    if (gate) return E.page({ tab: true, body: gate });
    const offset = E.state.ui.diaryOffset || 0;
    const iso = E.iso(E.addDays(offset));
    const plan = E.state.user.plan;
    const eaten = E.dayTotals(iso);
    const over = eaten.kcal > plan.kcal;
    const pct = Math.min(100, Math.round((eaten.kcal / Math.max(1, plan.kcal)) * 100));
    let days = "";
    for (let i = -10; i <= 10; i++) {
      const d = E.addDays(i);
      const on = i === offset;
      const isToday = i === 0;
      days += '<div class="swiper-slide day-slide"><button type="button" class="chip ' + (on ? "on" : "") + '" data-action="diary-day" data-offset="' + i + '" style="width:52px;display:flex;flex-direction:column;align-items:center;padding:8px 0">' +
        '<span style="font-size:10px;opacity:.7">' + d.toLocaleDateString("en-IN", { weekday: "short" }).slice(0, 2) + "</span>" +
        '<span class="nums">' + d.getDate() + "</span>" +
        (isToday ? '<span style="width:4px;height:4px;border-radius:50%;background:' + (on ? "var(--lime)" : "var(--ink)") + '"></span>' : '<span style="height:4px"></span>') +
        "</button></div>";
    }
    const quick = offset === 0 ? '<div class="hscroll mt12">' + (E.state.saved || []).map(function (m) {
      return '<button type="button" class="chip" data-action="quick-add" data-id="' + m.id + '">+ ' + E.esc(m.name) + "</button>";
    }).join("") + "</div>" : "";
    const sections = E.mealTypes.map(function (mt) {
      const rows = E.dayMeals(iso).filter(function (m) { return m.mealType === mt.id; });
      const kcal = rows.reduce(function (s, m) { return s + E.mealTotals(m).kcal; }, 0);
      const head = '<div class="between"><div class="row gap8"><span>' + mt.emoji + '</span><div><div class="heading" style="font-size:16px">' + mt.label + '</div><div class="caption">' +
        (rows.length ? E.num(kcal) + " kcal · " + rows.length + " item" + (rows.length > 1 ? "s" : "") : "Nothing yet") + "</div></div></div>" +
        (offset === 0 ? E.iconBtn("plus", 'data-action="open-scan" data-meal="' + mt.id + '" aria-label="Add ' + mt.label + '"', "ink") : "") + "</div>";
      const list = rows.map(function (m) {
        const t = E.mealTotals(m);
        return '<button type="button" class="meal" data-action="open-meal" data-id="' + m.id + '" data-longpress="delete-meal">' +
          E.photo(m.image, m.emoji, "thumb") +
          '<span class="grow"><span class="heading" style="font-size:15px">' + E.esc(m.name) + '</span><span class="caption">P ' + t.p + " · C " + t.c + " · F " + t.f + "</span></span>" +
          '<span class="label nums">' + E.num(t.kcal) + "</span></button>";
      }).join("");
      return '<div class="card mt12">' + head + list + "</div>";
    }).join("");
    const body = '<div class="hero">Diary</div><div class="caption mt8">' + E.esc(E.longDate(iso)) + "</div>" +
      '<div class="swiper day-swiper mt16"><div class="swiper-wrapper">' + days + "</div></div>" +
      '<div class="card mt16"><div class="between"><div class="kcal-num nums" style="font-size:42px;color:var(--ink)">' + E.num(eaten.kcal) + '</div><div class="caption">/ ' + E.num(plan.kcal) + " goal kcal</div></div>" +
      '<div class="track light mt12"><span style="width:' + pct + "%;background:" + (over ? "var(--protein)" : "var(--ink)") + '"></span></div>' +
      '<div class="caption mt8">P ' + eaten.p + "g · C " + eaten.c + "g · F " + eaten.f + "g" + (over ? " · over today, and that's just information" : "") + "</div></div>" +
      quick + sections +
      '<p class="caption center mt16">Hold a meal to remove it.</p>';
    return E.page({ tab: true, pull: true, body: body });
  };

  E.screens.scan = function () {
    const ui = E.state.ui;
    const mode = ui.scanMode || "photo";
    const locked = !E.isPro() || E.state.flags.scanLimit;
    const denied = E.state.flags.cameraDenied && mode === "photo";
    const titles = { photo: "Scan meal", barcode: "Scan barcode", describe: "Describe meal" };
    const top = '<button type="button" class="icon-btn on-photo" data-action="back" aria-label="Close">' + E.icon("x") + '</button><div class="top-title center"><div class="heading" style="color:white">' + titles[mode] + "</div></div>" +
      (mode !== "describe" ? '<button type="button" class="icon-btn on-photo torch ' + (ui.torch ? "on" : "") + '" data-action="torch" aria-label="Torch">' + E.icon("flashlight") + "</button>" : '<span style="width:44px"></span>');
    let stage = "";
    if (denied) {
      stage = '<div class="empty" style="color:white"><div class="empty-orb">📷</div><div class="heading">Camera is off</div><p class="caption mt8" style="color:rgba(255,255,255,.7)">Allow the camera to frame a plate, or describe the meal instead. This demo never leaves your browser.</p><div class="mt16">' +
        E.btn("Allow camera", { variant: "accent", attrs: 'data-action="allow-camera"' }) + "</div></div>";
    } else if (mode === "photo") {
      stage = '<div class="frame-box" style="background:#1a1a18 center/cover no-repeat url(' + E.img.thali + ');' + (ui.torch ? "box-shadow:inset 0 0 80px rgba(245,174,31,.45);" : "") + '">' +
        '<i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>' +
        (ui.analyzing ? "" : '<div class="scanline"></div>') + "</div>" +
        '<p class="center caption mt16" style="color:rgba(255,255,255,.75)">Fit your whole plate inside the frame</p>';
    } else if (mode === "barcode") {
      stage = '<div class="frame-box lime" style="height:180px;aspect-ratio:auto;background:#111">' +
        '<i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i><div class="scanline"></div></div>' +
        '<p class="center caption mt16" style="color:rgba(255,255,255,.75)">Point at a barcode. This demo finds Demo Oats.</p>';
    } else {
      const chips = ["2 roti, dal and bhindi", "Masala dosa and sambar", "Paneer tikka with salad", "Idli and sambar", "Chicken biryani", "Poha with peanuts"];
      stage = '<div style="padding:0 4px"><textarea class="plain-area" id="describe" data-model="describe" placeholder="Two roti, a bowl of dal, and bhindi sabzi">' + E.esc(ui.describeText) + "</textarea>" +
        '<div class="hscroll mt12" style="flex-wrap:wrap">' + chips.map(function (c) {
          return '<button type="button" class="chip" data-action="describe-chip" data-value="' + E.esc(c) + '">' + E.esc(c) + "</button>";
        }).join("") + "</div>" +
        '<div class="mt16">' + E.btn("Estimate this meal", { variant: "accent", busy: ui.analyzing, attrs: 'data-action="describe-submit"' }) + "</div></div>";
    }
    const lock = locked ? '<button type="button" class="lock-banner" data-action="open-paywall"><span class="ico-sq">' + E.icon("lock") + '</span><span class="grow"><b>AI scanning is a Pro feature</b><div class="caption" style="color:rgba(255,255,255,.7)">You\'ve used the free scans in this demo.</div></span><span class="label" style="color:var(--lime)">Unlock</span></button>' : "";
    const controls = mode === "describe" ? "" : '<div class="between mt20" style="padding:0 28px 8px"><button type="button" class="icon-btn on-photo" data-action="open-gallery" aria-label="Gallery">' + E.icon("image") + '</button>' +
      '<button type="button" class="shutter" data-action="shutter" aria-label="Shutter"><span class="core"></span></button><span style="width:44px"></span></div>';
    const analyzing = ui.analyzing ? '<div class="analyze"><div class="spinner" style="width:28px;height:28px;border-width:3px"></div><div class="heading mt16" id="analyze-tip">' + E.esc(ui.scanProgress || "Compressing photo…") + '</div><p class="caption mt8" style="color:rgba(255,255,255,.7)">Estimates, not a lab result. You can edit them next.</p></div>' : "";
    const scanErr = ui.scanError ? '<button type="button" class="lock-banner" data-action="retry-scan"><span class="grow"><b>' + E.esc(ui.scanError) + '</b><div class="caption" style="color:rgba(255,255,255,.7)">Tap to retry</div></span></button>' : "";
    const body = lock + scanErr + (ui.analyzing && mode === "photo" ? "" : stage) + (ui.analyzing ? "" : controls) + analyzing +
      '<div class="seg dark" style="margin:16px 8px 0">' +
      ["photo", "barcode", "describe"].map(function (id) {
        const label = id === "photo" ? "Photo" : id === "barcode" ? "Barcode" : "Describe";
        return '<button type="button" class="' + (mode === id ? "on" : "") + '" data-action="scan-mode" data-mode="' + id + '">' + label + "</button>";
      }).join("") + "</div>";
    return '<div class="scan-screen">' + E.page({ top: top, body: body }) + "</div>";
  };

  E.screens["scan-result"] = function () {
    const scan = E.state.scan;
    if (!scan) return E.page({ top: E.backBtn(), body: E.empty({ emoji: "🍽️", title: "Nothing to review", button: E.btn("Back to scan", { attrs: 'data-action="back"' }) }) });
    const totals = E.mealTotals(scan);
    const plan = E.state.user.plan;
    const after = plan.kcal - E.dayTotals(E.todayIso()).kcal - totals.kcal;
    const source = scan.source === "barcode" ? "Barcode match" : scan.source === "describe" ? "From your description" : "AI detected";
    const items = scan.items.map(function (it, idx) {
      return '<div class="card mt8"><input class="plain-area" style="min-height:0;padding:8px 10px;font-weight:700" data-model="item-name" data-idx="' + idx + '" value="' + E.esc(it.name) + '" aria-label="Item name">' +
        '<div class="caption mt8" data-scan-macros="' + idx + '">' + E.esc(it.serving) + " · P " + it.p + " · C " + it.c + " · F " + it.f + "</div>" +
        '<div class="between mt8"><label class="caption">kcal <input inputmode="numeric" style="width:72px;margin-left:6px;border:0;background:var(--canvas);border-radius:8px;padding:6px 8px;font-weight:700" data-model="item-kcal" data-idx="' + idx + '" value="' + it.kcal + '" aria-label="Item calories"></label>' +
        '<div class="qty"><button type="button" data-action="scan-qty" data-dir="-1" data-idx="' + idx + '" aria-label="Less">−</button><span class="nums label">' + it.qty + '</span><button type="button" data-action="scan-qty" data-dir="1" data-idx="' + idx + '" aria-label="More">+</button></div>' +
        '<button type="button" class="icon-btn flat" data-action="scan-remove" data-idx="' + idx + '" aria-label="Remove">' + E.icon("trash-2") + "</button></div></div>";
    }).join("");
    const pills = E.mealTypes.map(function (mt) {
      return '<button type="button" class="chip ' + (scan.mealType === mt.id ? "on" : "") + '" data-action="scan-type" data-value="' + mt.id + '">' + mt.emoji + " " + mt.label + "</button>";
    }).join("");
    const body = '<div class="food-hero">' + (scan.image ? '<img alt="" src="' + E.esc(scan.image) + '" onerror="this.remove()">' : "") +
      '<div style="position:absolute;inset:0;display:grid;place-items:center;font-size:64px">' + (scan.emoji || "") + "</div></div>" +
      '<div class="food-sheet"><div class="overline">' + source + '</div>' +
      '<div class="mt12">' + E.field({ label: "Meal name", id: "scan-name", model: "scan-name", value: scan.name }) + "</div>" +
      '<div class="hscroll mt12">' + pills + "</div>" +
      '<div class="mt8">' + items + "</div>" +
      '<div class="hero-card mt16"><div class="kcal-num nums" id="scan-meal-kcal">' + E.num(totals.kcal) + '</div><div class="caption" style="color:rgba(255,255,255,.7)">kcal in this meal · estimates</div>' +
      '<div class="caption mt8" id="scan-meal-after" style="color:rgba(255,255,255,.85)">' + (after >= 0 ? "After this meal you'll have " + E.num(after) + " kcal left." : "After this meal you'll be " + E.num(Math.abs(after)) + " kcal over today. That's allowed.") + "</div>" +
      '<div class="mt12" id="scan-meal-macros">' + E.macros({ p: totals.p, c: totals.c, f: totals.f }, { p: Math.max(totals.p, 1), c: Math.max(totals.c, 1), f: Math.max(totals.f, 1) }) + "</div></div>" +
      '<div class="card mt12 between"><div><div class="heading" style="font-size:15px">Save for quick add later</div><div class="caption">Shows in Eat it again</div></div>' +
      E.switch(!!scan.saveLater, 'data-action="scan-save-toggle"') + "</div>" +
      "</div>";
    const footer = '<div class="grid2">' +
      E.btn("Discard", { variant: "secondary", attrs: 'data-action="discard-scan" data-testid="scan-discard"' }) +
      E.btn("Add to diary", { attrs: 'data-action="add-diary" data-testid="scan-add"' }) + "</div>";
    return E.page({
      bleed: true,
      footer: footer,
      body: body.replace(
        '<div class="food-hero">',
        '<div class="food-hero"><div class="food-actions">' + E.iconBtn("x", 'data-action="discard-scan" data-testid="scan-discard-back" aria-label="Discard"', "on-photo") + "</div>"
      ).replace(
        'place-items:center;font-size:64px"',
        'place-items:center;font-size:64px;pointer-events:none"'
      )
    });
  };

  E.screens.food = function () {
    const meal = (E.state.meals || []).find(function (m) { return m.id === (E.currentParams() || {}).id; });
    if (!meal) return E.page({ top: E.topTitle("Meal"), body: E.empty({ emoji: "🍽️", title: "This meal is gone" }) });
    const t = E.mealTotals(meal);
    const items = (meal.items || []).map(function (it) {
      return '<div class="line"><div class="grow"><div class="heading" style="font-size:15px">' + E.esc(it.name) + '</div><div class="caption">' + E.esc(it.serving) + " · qty " + (it.qty || 1) + "</div></div><div class=\"label nums\">" + E.num(it.kcal * (it.qty || 1)) + "</div></div>";
    }).join("");
    const body = '<div class="food-hero">' + (meal.image ? '<img alt="" src="' + E.esc(meal.image) + '" onerror="this.style.display=\'none\'">' : "") +
      '<div style="position:absolute;inset:0;display:grid;place-items:center;font-size:72px;pointer-events:none">' + meal.emoji + "</div>" +
      '<div class="food-actions">' + E.iconBtn("chevron-left", 'data-action="back"', "on-photo") + '<span class="grow"></span>' +
      E.iconBtn("share-2", 'data-action="share-meal" data-id="' + meal.id + '"', "on-photo") +
      E.iconBtn("trash-2", 'data-action="delete-meal" data-id="' + meal.id + '"', "on-photo") + "</div></div>" +
      '<div class="food-sheet"><div class="caption">' + E.esc(E.longDate(meal.date)) + " · " + E.esc(meal.time) + '</div><h1 class="title mt8">' + E.esc(meal.name) + "</h1>" +
      '<div class="card mt16"><div class="between">' + E.ring(Math.min(1, t.kcal / Math.max(1, E.state.user.plan.kcal)), { size: 92, track: "#ECE9E1", color: "#121210", center: '<div class="nums" style="font-family:var(--display);font-weight:800;font-size:18px">' + E.num(t.kcal) + '</div>' }) +
      '<div class="grow" style="padding-left:12px"><div class="overline">This meal</div><div class="caption mt8">An estimate you logged. Not a medical measure.</div></div></div>' +
      '<div class="mt12"><div class="between"><span>Protein</span><b class="nums">' + t.p + 'g</b></div><div class="track light mt4"><span style="width:' + Math.min(100, t.p) + '%;background:var(--protein)"></span></div>' +
      '<div class="between mt8"><span>Carbs</span><b class="nums">' + t.c + 'g</b></div><div class="track light mt4"><span style="width:' + Math.min(100, t.c / 2) + '%;background:var(--carbs)"></span></div>' +
      '<div class="between mt8"><span>Fats</span><b class="nums">' + t.f + 'g</b></div><div class="track light mt4"><span style="width:' + Math.min(100, t.f * 2) + '%;background:var(--fats)"></span></div></div></div>' +
      (meal.items && meal.items.length > 1 ? '<div class="section-head"><h2>Ingredients</h2></div><div class="card">' + items + "</div>" : "") +
      "</div>";
    return E.page({ bleed: true, body: body });
  };

  E.screens.progress = function () {
    const u = E.state.user;
    const logs = E.state.weightLog || [];
    const latest = logs.length ? logs[logs.length - 1] : null;
    const weekAgo = logs.filter(function (w) { return w.date <= E.iso(E.addDays(-7)); }).pop();
    const delta = latest && weekAgo ? Math.round((latest.kg - weekAgo.kg) * 10) / 10 : 0;
    const good = u.goal === "muscle" ? delta >= 0 : delta <= 0;
    const body = '<div class="between"><div class="hero">Progress</div><button type="button" class="icon-btn flat" data-action="refresh" aria-label="Refresh">' + E.icon("refresh-cw") + "</button></div>" +
      '<div class="grid3 mt16"><div class="stat">🔥<b>' + u.streak.current + '</b><span>Day streak</span></div><div class="stat">🏆<b>' + u.streak.best + '</b><span>Best streak</span></div><div class="stat">❄️<b>' + u.streak.freezes + '</b><span>Freezes left</span></div></div>' +
      '<div class="card mt16"><div class="between"><div><div class="overline">Calories</div><div class="caption" id="week-label"></div></div><div class="row gap8">' +
      E.iconBtn("chevron-left", 'data-action="week-shift" data-dir="-1"', "flat") +
      E.iconBtn("chevron-right", 'data-action="week-shift" data-dir="1"', "flat") + "</div></div>" +
      '<canvas id="cal-chart" height="160" class="mt12"></canvas>' +
      '<div class="grid3 mt8"><div class="stat"><b id="avg-kcal">–</b><span>Avg kcal</span></div><div class="stat"><b id="avg-p">–</b><span>Avg protein</span></div><div class="stat"><b id="on-target">–</b><span>On target</span></div></div></div>' +
      '<div class="card mt16"><div class="between"><div><div class="overline">Weight</div><div class="title nums">' + (latest ? latest.kg.toFixed(1) + " kg" : "—") + '</div>' +
      '<div class="caption" style="color:' + (good ? "var(--success)" : "var(--protein)") + '">' + (latest ? (delta > 0 ? "▲ " : "▼ ") + Math.abs(delta) + " kg this week" : "Log a weigh-in to see a trend") + "</div></div>" +
      E.btn("Log", { size: "sm", block: false, attrs: 'data-action="open-weight"' }) + "</div>" +
      '<div class="mt12">' + E.segmented([{ id: "1W", label: "1W" }, { id: "1M", label: "1M" }, { id: "3M", label: "3M" }, { id: "All", label: "All" }], E.state.ui.weightRange, "weight-range") + "</div>" +
      (logs.length ? '<canvas id="wt-chart" height="160" class="mt12"></canvas>' : E.empty({ emoji: "⚖️", title: "No weigh-ins yet", sub: "Same time of day makes the line kinder." })) +
      "</div>" +
      '<div class="list-card mt16">' +
      E.navRow("ruler", "Measurements", "Waist, hips, chest", 'data-action="go" data-screen="measurements"') +
      E.navRow("camera", "Progress photos", "Weekly gallery", 'data-action="go" data-screen="photos"') +
      "</div>";
    return E.page({ top: E.backBtn() + '<div class="top-title"></div>', pull: true, body: '<div class="mt4">' + body + "</div>" });
  };

  E.modals["log-weight"] = function () {
    const kg = Number(E.state.ui.weightDraft) || 70;
    return '<div class="sheet-wrap"><button type="button" class="backdrop" data-action="close-modal" aria-label="Close"></button><div class="sheet">' +
      '<div class="grabber"></div><div class="title">Log weight</div><p class="caption mt8">Same time of day, similar clothes. The trend matters more than one morning.</p>' +
      '<div class="center mt16"><div class="stepper-num nums">' + kg.toFixed(1) + '</div><div class="caption">kilograms</div>' +
      '<div class="row" style="justify-content:center;gap:16px;margin-top:12px">' +
      E.iconBtn("minus", 'data-action="weight-step" data-dir="-1"', "flat") +
      E.iconBtn("plus", 'data-action="weight-step" data-dir="1"', "ink") + "</div></div>" +
      '<div class="mt20">' + E.btn("Save weigh-in", { attrs: 'data-action="save-weight"' }) + "</div></div></div>";
  };

  E.modals.gallery = function () {
    const pics = [
      { name: "Thali", image: E.img.thali, emoji: "🍛" },
      { name: "Dosa", image: E.img.dosa, emoji: "🥞" },
      { name: "Salad bowl", image: E.img.bowl, emoji: "🥗" },
      { name: "Oats", image: E.img.oats, emoji: "🥣" }
    ];
    return '<div class="sheet-wrap"><button type="button" class="backdrop" data-action="close-modal"></button><div class="sheet"><div class="grabber"></div><div class="heading">Choose a photo</div><div class="grid2 mt12">' +
      pics.map(function (p, i) {
        return '<button type="button" class="card" data-action="pick-gallery" data-idx="' + i + '" style="border:0;text-align:left;color:inherit">' + E.photo(p.image, p.emoji) + '<div class="label mt8">' + p.name + "</div></button>";
      }).join("") + "</div></div></div>";
  };
})();
