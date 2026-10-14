(function () {
  const E = window.EatAI;

  E.screens.welcome = function () {
    const body = '<div data-longpress="dev" class="row gap12">' + E.logo(40) + '<span class="wordmark">EatAI</span></div>' +
      '<div class="demo-wrap mt20">' +
      '<div class="viewfinder">' +
      '<span class="plate">🥗</span>' +
      '<i class="bracket tl"></i><i class="bracket tr"></i><i class="bracket bl"></i><i class="bracket br"></i>' +
      '<i class="scanline"></i></div>' +
      '<div class="float-chip a">Avocado bowl · detected · 98%</div>' +
      '<div class="float-chip b">420 kcal · P 18 · C 32 · F 22</div></div>' +
      '<h1 class="display mt8">Snap your plate.</h1>' +
      '<div class="display faint" style="color:var(--faint);font-size:40px">Know your food.</div>' +
      '<p class="body muted mt16">Calories and macros in seconds, a plan that fits your day, and friends who keep you honest.</p>' +
      '<div class="mt24">' + E.btn("Get started — it's free", { iconRight: "arrow-right", attrs: 'data-action="guest-start"' }) + "</div>" +
      '<div class="center mt12">' + E.btn("I already have an account", { variant: "ghost", attrs: 'data-action="go" data-screen="login"' }) + "</div>";
    return E.page({ body: body });
  };

  function authFooter(text, link, screen) {
    return '<p class="center caption mt20">' + text + ' <button type="button" class="btn btn-ghost btn-sm" data-action="go" data-screen="' + screen + '" style="display:inline;height:auto;padding:0;font-weight:800">' + link + "</button></p>";
  }

  E.screens.login = function () {
    const ui = E.state.ui;
    const emailOk = E.validEmail(ui.email);
    const body = '<div class="mt12"><div class="hero">Welcome back</div><p class="body muted mt8">Use a code, or your email and password.</p></div>' +
      '<div class="mt24"><button type="button" class="btn btn-light btn-lg btn-block" data-action="google">' + (ui.busy === "google" ? '<span class="spinner"></span>' : E.google() + "<span>Continue with Google</span>") + "</button></div>" +
      '<div class="center caption mt16">or</div>' +
      '<div class="stack mt12">' +
      E.field({ label: "Email", id: "email", model: "email", type: "email", placeholder: "you@email.com", value: ui.email, icon: "mail" }) +
      "</div>" +
      '<div class="mt12">' + E.btn("Email me a code", { busy: ui.busy === "code", disabled: !emailOk, attrs: 'data-action="send-login-code" data-testid="login-send-code" id="login-send-code"' }) + "</div>" +
      '<div class="center caption mt16">or use a password</div>' +
      '<div class="stack mt12">' +
      E.field({ label: "Password", id: "password", model: "password", type: ui.showPassword ? "text" : "password", placeholder: "Your password", value: ui.password, icon: "lock", trail: '<button type="button" class="trail" data-action="toggle-password" aria-label="Show password">' + E.icon(ui.showPassword ? "eye-off" : "eye") + "</button>" }) +
      "</div>" +
      '<div class="mt8"><button type="button" class="btn btn-ghost btn-sm" data-action="go" data-screen="forgot" style="padding-left:0">Forgot password?</button></div>' +
      (ui.authError ? '<p class="field-error mt8">' + E.esc(ui.authError) + "</p>" : "") +
      '<div class="mt16">' + E.btn("Log in", { busy: ui.busy === "login", disabled: !ui.email || !ui.password, attrs: 'data-action="login" data-testid="login-password" id="login-password"' }) + "</div>" +
      authFooter("New here?", "Create account", "register");
    return E.page({
      top: E.backBtn(),
      body: body
    });
  };

  E.screens["claim-email"] = function () {
    const ui = E.state.ui;
    const feature = ui.pendingFeature;
    const names = { communities: "communities", reminders: "reminders", social: "your social profile", subscription: "your plan", privacy: "privacy settings" };
    const what = !feature ? "your account" : feature.type === "tab" ? "chat" : feature.type === "paywall" ? "Pro" : (names[feature.id] || "this");
    const emailOk = E.validEmail(ui.email);
    const body = '<div class="mt8"><div class="hero" style="font-size:32px">Add your email</div><p class="body muted mt8">We\'ll send a code. After that, ' + what + ' opens. Meals you already logged stay here. If this email already has an account, we open that account.</p></div>' +
      '<div class="stack mt20">' +
      E.field({ label: "Email", id: "email", model: "email", type: "email", placeholder: "you@email.com", value: ui.email, icon: "mail" }) +
      "</div>" +
      (ui.authError ? '<p class="field-error mt8">' + E.esc(ui.authError) + "</p>" : "") +
      '<div class="mt16">' + E.btn("Send code", { busy: ui.busy === "claim", disabled: !emailOk, attrs: 'data-action="send-claim-code" data-testid="claim-send-code"' }) + "</div>" +
      '<div class="center mt12">' + E.btn("I already have an account", { variant: "ghost", attrs: 'data-action="go" data-screen="login"' }) + "</div>";
    return E.page({ top: E.backBtn(), body: body });
  };

  E.screens.register = function () {
    const ui = E.state.ui;
    const rules = E.passwordRules(ui.password);
    const rule = function (key, label) {
      return '<div class="rule ' + (rules[key] ? "met" : "") + '" data-rule="' + key + '"><span class="dot">' + (rules[key] ? "✓" : "") + "</span>" + label + "</div>";
    };
    const ok = E.passwordOk(ui.password) && E.validEmail(ui.email);
    const body = '<div class="mt8"><div class="hero" style="font-size:32px">Create your account</div><p class="body muted mt8">Takes 30 seconds. Then we\'ll build your personal plan.</p></div>' +
      '<div class="mt20"><button type="button" class="btn btn-light btn-lg btn-block" data-action="google">' + (ui.busy === "google" ? '<span class="spinner"></span>' : E.google() + "<span>Continue with Google</span>") + "</button></div>" +
      '<div class="center caption mt16">or</div>' +
      '<div class="stack mt12">' +
      E.field({ label: "Email", id: "email", model: "email", type: "email", placeholder: "you@email.com", value: ui.email, icon: "mail" }) +
      E.field({ label: "Password", id: "password", model: "password", type: ui.showPassword ? "text" : "password", placeholder: "Create a password", value: ui.password, icon: "lock", trail: '<button type="button" class="trail" data-action="toggle-password" aria-label="Show password">' + E.icon(ui.showPassword ? "eye-off" : "eye") + "</button>" }) +
      "</div>" +
      '<div class="rules mt12">' + rule("len", "6+ characters") + rule("letter", "A letter") + rule("number", "A number") + rule("symbol", "A symbol") + "</div>" +
      (ui.authError ? '<p class="field-error mt8">' + E.esc(ui.authError) + "</p>" : "") +
      '<div class="mt16">' + E.btn("Create account", { busy: ui.busy === "register", disabled: !ok, attrs: 'data-action="register"' }) + "</div>" +
      '<p class="caption center mt12">By continuing you agree to the <button type="button" class="btn btn-ghost btn-sm" data-action="go" data-screen="legal" style="display:inline;height:auto;padding:0;font-weight:800">Terms</button> and <button type="button" class="btn btn-ghost btn-sm" data-action="go" data-screen="privacy-policy" style="display:inline;height:auto;padding:0;font-weight:800">Privacy Policy</button>.</p>' +
      authFooter("Already a member?", "Log in", "login");
    return E.page({ top: E.backBtn(), body: body });
  };

  E.screens.forgot = function () {
    const ui = E.state.ui;
    const body = '<div class="hero" style="font-size:32px">Reset password</div>' +
      '<p class="body muted mt8">If an account exists, we\'ll email a code. Then you can set a new password.</p>' +
      '<div class="mt20">' + E.field({ label: "Email", id: "email", model: "email", type: "email", placeholder: "you@email.com", value: ui.email, icon: "mail" }) + "</div>" +
      (ui.authError ? '<p class="field-error mt8">' + E.esc(ui.authError) + "</p>" : "") +
      '<div class="mt20">' + E.btn("Send code", { busy: ui.busy === "forgot", disabled: !E.validEmail(ui.email), attrs: 'data-action="forgot" data-testid="forgot-send-code"' }) + "</div>";
    return E.page({ top: E.backBtn(), body: body });
  };

  E.screens.verify = function () {
    const u = E.state.user;
    const ui = E.state.ui;
    const purpose = ui.otpPurpose || "verify";
    const shownEmail = ui.loginEmail || u.email;
    const left = Math.max(0, Math.ceil((ui.resendAt - Date.now()) / 1000));
    const boxes = ui.otp.map(function (d, i) {
      return '<input inputmode="numeric" maxlength="1" id="otp' + i + '" data-otp="' + i + '" value="' + E.esc(d) + '" class="' + (ui.authError ? "error" : "") + '" aria-label="Digit ' + (i + 1) + '">';
    }).join("");
    const title = purpose === "reset" ? "Enter the code to reset" : "Enter the 6-digit code";
    const button = purpose === "login" ? "Log in" : purpose === "claim" || purpose === "reset" ? "Continue" : "Verify email";
    const body = '<div class="overline">Check your inbox</div>' +
      '<h1 class="title mt8">' + title + "</h1>" +
      '<p class="body muted mt8">We sent it to <b>' + E.esc(shownEmail) + "</b>. This demo accepts <b>123456</b>. The code expires in about a minute.</p>" +
      (ui.otpExpiresAt && Date.now() > ui.otpExpiresAt ? '<p class="field-error mt12">This code has expired. Resend a new one before you try 123456 again.</p>' : "") +
      '<div class="otp mt20">' + boxes + "</div>" +
      (ui.authError ? '<p class="field-error mt12">' + E.esc(ui.authError) + "</p>" : "") +
      '<div class="mt20">' + E.btn(button, { busy: ui.busy === "verify", attrs: 'data-action="verify" data-testid="otp-submit"' }) + "</div>" +
      '<div class="center mt16"><button type="button" class="btn btn-ghost btn-md" id="resend-btn" data-action="resend" ' + (left ? "disabled" : "") + ">" +
      (left ? "Resend code in " + left + "s" : "Resend code") + "</button></div>" +
      '<div class="mt20">' +
      (ui.editingEmail
        ? E.field({ label: "New email", id: "newEmail", model: "newEmail", value: ui.newEmail || shownEmail, type: "email" }) +
          '<div class="mt12">' + E.btn("Save and resend", { size: "md", attrs: 'data-action="save-email"' }) + "</div>"
        : '<button type="button" class="btn btn-ghost btn-md btn-block" data-action="edit-email">Wrong email?</button>') +
      "</div>" +
      '<div class="mt12">' + E.btn("Log out", { variant: "secondary", attrs: 'data-action="logout"' }) + "</div>";
    return E.page({ body: body });
  };

  E.screens["set-password"] = function () {
    const ui = E.state.ui;
    const mode = ui.passwordMode || "create";
    const email = mode === "reset" ? (ui.resetEmail || ui.email) : (E.state.user.email || "");
    const rules = E.passwordRules(ui.newPassword);
    const rule = function (key, label) {
      return '<div class="rule ' + (rules[key] ? "met" : "") + '"><span class="dot">' + (rules[key] ? "✓" : "") + "</span>" + label + "</div>";
    };
    const title = mode === "update" ? "Update password" : mode === "reset" ? "Set a new password" : "Create a password";
    const sub = mode === "update"
      ? "Enter the current password, then a new one."
      : mode === "reset"
        ? "This replaces the password for " + email + "."
        : "Optional. You can keep signing in with a code.";
    const testId = mode === "update" ? "update-password-save" : "set-password-save";
    const body = '<div class="hero" style="font-size:32px">' + title + "</div>" +
      '<p class="body muted mt8">' + E.esc(sub) + "</p>" +
      '<div class="stack mt16">' +
      (mode === "update" ? E.field({ label: "Current password", id: "current-password", model: "currentPassword", type: ui.showPassword ? "text" : "password", placeholder: "Current password", value: ui.currentPassword, icon: "lock" }) : "") +
      E.field({ label: "New password", id: "new-password", model: "newPassword", type: ui.showPassword ? "text" : "password", placeholder: "New password", value: ui.newPassword, icon: "lock", trail: '<button type="button" class="trail" data-action="toggle-password" aria-label="Show password">' + E.icon(ui.showPassword ? "eye-off" : "eye") + "</button>" }) +
      "</div>" +
      '<div class="rules mt12">' + rule("len", "6+ characters") + rule("letter", "A letter") + rule("number", "A number") + rule("symbol", "A symbol") + "</div>" +
      (ui.authError ? '<p class="field-error mt8">' + E.esc(ui.authError) + "</p>" : "") +
      '<div class="mt16">' + E.btn(mode === "update" ? "Update password" : "Save password", { attrs: 'data-action="save-password" data-testid="' + testId + '" id="' + testId + '"' }) + "</div>";
    return E.page({ top: E.backBtn(), body: body });
  };

  const goals = [
    { id: "lose", emoji: "🔥", title: "Lose weight", sub: "A kinder calorie target" },
    { id: "health", emoji: "🥗", title: "Eat healthier", sub: "More balance, less guesswork" },
    { id: "muscle", emoji: "💪", title: "Build muscle", sub: "Fuel the work you're doing" }
  ];
  const genders = [
    { id: "female", emoji: "👩", title: "Female", sub: "Used only for calorie estimates" },
    { id: "male", emoji: "👨", title: "Male", sub: "Used only for calorie estimates" },
    { id: "other", emoji: "✨", title: "Other", sub: "We'll use a middle estimate" }
  ];
  const activities = [
    { id: "desk", emoji: "💻", title: "Desk day", sub: "Mostly seated" },
    { id: "light", emoji: "🚶", title: "Light movement", sub: "Walks and errands" },
    { id: "feet", emoji: "🛍️", title: "On my feet", sub: "Standing most of the day" },
    { id: "job", emoji: "🏗️", title: "Physical job", sub: "Hard work or heavy training" }
  ];
  const exercises = [
    { id: "none", emoji: "🌙", title: "Rarely", sub: "Not a training week" },
    { id: "1-2", emoji: "🌿", title: "1–2 times", sub: "A light week" },
    { id: "3-4", emoji: "🔥", title: "3–4 times", sub: "Most weeks" },
    { id: "5-6", emoji: "⚡", title: "5–6 times", sub: "Training is a habit" },
    { id: "daily", emoji: "🏆", title: "Every day", sub: "Movement daily" }
  ];
  const diets = [
    { id: "veg", emoji: "🥦", title: "Vegetarian" },
    { id: "nonveg", emoji: "🍗", title: "Non-vegetarian" },
    { id: "egg", emoji: "🥚", title: "Eggetarian" },
    { id: "vegan", emoji: "🌱", title: "Vegan" },
    { id: "jain", emoji: "🙏", title: "Jain" },
    { id: "any", emoji: "🍽️", title: "Anything" }
  ];
  const trains = ["Gym", "Running", "Yoga", "Cycling", "Sports", "Walking", "HIIT", "Dance"];

  function stepBody(ob, step) {
    if (step === "goal") {
      return '<div class="title">What brings you to EatAI?</div><p class="caption mt8">Pick one. You can change it later.</p><div class="mt16">' +
        goals.map(function (g) { return E.tile({ emoji: g.emoji, title: g.title, sub: g.sub, value: g.id, on: ob.goal === g.id, action: "ob-pick" }); }).join("") + "</div>";
    }
    if (step === "name") {
      return '<div class="title">What should we call you?</div><p class="caption mt8">First name is enough. It shows on your home screen.</p><div class="mt16">' +
        E.field({ id: "ob-name", model: "ob-name", placeholder: "Priya", value: ob.name }) + "</div>";
    }
    if (step === "gender") {
      const preg = ob.gender === "female" ? '<div class="card mt16"><div class="heading">Pregnant or breastfeeding?</div><p class="caption mt8">Optional. We skip deficit targets and keep calories supportive.</p><div class="hscroll mt12">' +
        [["pregnant", "Pregnant"], ["breastfeeding", "Breastfeeding"], ["", "Neither"]].map(function (p) {
          const on = (ob.pregnancy || "") === p[0];
          return '<button type="button" class="chip ' + (on ? "on" : "") + '" data-action="ob-preg" data-value="' + p[0] + '">' + p[1] + "</button>";
        }).join("") + "</div>" +
        (ob.pregnancy === "pregnant" ? '<p class="caption mt12">During pregnancy we skip target-weight dieting and keep the plan on supportive maintenance calories.</p>' : "") +
        (ob.pregnancy === "breastfeeding" ? '<p class="caption mt12">While breastfeeding we keep maintenance calories, plus about 300 kcal for milk production.</p>' : "") +
        "</div>" : "";
      return '<div class="title">Which best describes you?</div><p class="caption mt8">Only to estimate calories. Not shown publicly.</p><div class="mt16">' +
        genders.map(function (g) { return E.tile({ emoji: g.emoji, title: g.title, sub: g.sub, value: g.id, on: ob.gender === g.id, action: "ob-pick" }); }).join("") + "</div>" + preg;
    }
    if (step === "birth") {
      const m = ob.month;
      const prevM = E.months[(m + 11) % 12];
      const nextM = E.months[(m + 1) % 12];
      return '<div class="title">When were you born?</div><p class="caption mt8">We use this to keep under-18 accounts out of discovery.</p>' +
        '<div class="picker mt20"><div class="picker-col"><button type="button" class="icon-btn flat" data-action="ob-month" data-dir="-1" aria-label="Previous month">' + E.icon("chevron-up") + '</button>' +
        '<div class="picker-ghost">' + prevM + '</div><div class="picker-val">' + E.months[m] + '</div><div class="picker-ghost">' + nextM + "</div>" +
        '<button type="button" class="icon-btn flat" data-action="ob-month" data-dir="1" aria-label="Next month">' + E.icon("chevron-down") + "</button></div>" +
        '<div class="picker-col"><button type="button" class="icon-btn flat" data-action="ob-year" data-dir="1" aria-label="Older">' + E.icon("chevron-up") + "</button>" +
        '<div class="picker-ghost">' + (ob.year + 1) + '</div><div class="picker-val">' + ob.year + '</div><div class="picker-ghost">' + (ob.year - 1) + "</div>" +
        '<button type="button" class="icon-btn flat" data-action="ob-year" data-dir="-1" aria-label="Younger">' + E.icon("chevron-down") + "</button></div></div>";
    }
    if (step === "height") {
      const ft = E.cmToFt(ob.heightCm);
      const shown = ob.heightUnit === "ft" ? ft.ft + "′ " + ft.inch + "″" : ob.heightCm + " cm";
      return '<div class="title">How tall are you?</div>' + E.segmented([{ id: "cm", label: "cm" }, { id: "ft", label: "ft / in" }], ob.heightUnit, "ob-hunit") +
        '<div class="center mt24"><div class="stepper-num nums">' + shown + "</div>" +
        '<div class="row" style="justify-content:center;gap:16px;margin-top:12px">' +
        E.iconBtn("minus", 'data-action="ob-height" data-dir="-1" aria-label="Shorter"', "flat") +
        E.iconBtn("plus", 'data-action="ob-height" data-dir="1" aria-label="Taller"', "ink") + "</div>" +
        '<div class="ruler"></div></div>';
    }
    if (step === "weight" || step === "target") {
      const kg = step === "weight" ? ob.weightKg : ob.targetKg;
      const shown = ob.weightUnit === "lb" ? Math.round(kg * 2.20462) + " lb" : kg.toFixed(1) + " kg";
      const title = step === "weight" ? "What do you weigh today?" : "What's your goal weight?";
      const sub = step === "weight" ? "No judgement — it's just the starting line." : (ob.goal === "muscle" ? "A little higher is normal when you're building muscle." : "A direction, not a deadline.");
      return '<div class="title">' + title + '</div><p class="caption mt8">' + sub + "</p>" +
        (step === "weight" ? E.segmented([{ id: "kg", label: "kg" }, { id: "lb", label: "lb" }], ob.weightUnit, "ob-wunit") : "") +
        '<div class="center mt24"><div class="stepper-num nums">' + shown + "</div>" +
        '<div class="row" style="justify-content:center;gap:16px;margin-top:12px">' +
        E.iconBtn("minus", 'data-action="ob-weight" data-dir="-1" data-which="' + step + '"', "flat") +
        E.iconBtn("plus", 'data-action="ob-weight" data-dir="1" data-which="' + step + '"', "ink") + "</div>" +
        '<div class="ruler"></div></div>';
    }
    if (step === "pace") {
      const word = ob.goal === "muscle" ? "gain" : "lose";
      const paces = [
        { id: "0.25", emoji: "🐢", title: "Gentle", sub: "0.25 kg a week to " + word },
        { id: "0.5", emoji: "🚶", title: "Steady", sub: "0.5 kg a week" },
        { id: "0.75", emoji: "⏱️", title: "Faster", sub: "0.75 kg a week" },
        { id: "1", emoji: "⚡", title: "Ambitious", sub: "About 1 kg a week" }
      ];
      return '<div class="title">How fast do you want to ' + word + '?</div><p class="caption mt8">Slower is easier to keep. You can edit this anytime.</p><div class="mt16">' +
        paces.map(function (p) { return E.tile({ emoji: p.emoji, title: p.title, sub: p.sub, value: p.id, on: ob.pace === p.id, action: "ob-pick" }); }).join("") + "</div>";
    }
    if (step === "support") {
      const mode = E.protectedMode(ob);
      const copy = mode === "kid"
        ? { label: "Protected mode", value: "No dieting target", caption: "Because this profile is under 16, we skip dieting targets and focus on supportive calories and balanced macros." }
        : mode === "pregnant"
          ? { label: "Supportive mode", value: "No dieting target", caption: "Target weight and pace are skipped so the plan stays safe during pregnancy. You can still finish onboarding normally." }
          : mode === "breastfeeding"
            ? { label: "Supportive mode", value: "No dieting target", caption: "Target weight and pace are skipped. The plan adds about 300 kcal on top of maintenance for milk production." }
            : { label: "Maintenance", value: "Stay at current weight", caption: "Daily calories stay around maintenance so you can focus on consistency and food quality." };
      const extra = mode === "breastfeeding" ? '<div class="card mt12"><p class="caption">You will see the extra energy on the plan screen. This is a starting estimate, not medical advice.</p></div>' : "";
      return '<div class="title">' + copy.value + '</div><p class="caption mt8">' + copy.label + '</p><div class="card mt16"><div class="heading">' + copy.value + '</div><p class="body muted mt8">' + copy.caption + "</p></div>" + extra;
    }
    if (step === "activity") {
      return '<div class="title">How active is a normal day?</div><p class="caption mt8">Not workouts — just how your day feels.</p><div class="mt16">' +
        activities.map(function (a) { return E.tile({ emoji: a.emoji, title: a.title, sub: a.sub, value: a.id, on: ob.activity === a.id, action: "ob-pick" }); }).join("") + "</div>";
    }
    if (step === "exercise") {
      return '<div class="title">How often do you work out?</div><div class="mt16">' +
        exercises.map(function (a) { return E.tile({ emoji: a.emoji, title: a.title, sub: a.sub, value: a.id, on: ob.exercise === a.id, action: "ob-pick" }); }).join("") + "</div>";
    }
    if (step === "diet") {
      return '<div class="title">How do you eat?</div><p class="caption mt8">So suggestions feel like your kitchen.</p><div class="mt16">' +
        diets.map(function (a) { return E.tile({ emoji: a.emoji, title: a.title, value: a.id, on: ob.diet === a.id, action: "ob-pick" }); }).join("") + "</div>";
    }
    if (step === "training") {
      return '<div class="title">How do you like to train?</div><p class="caption mt8">Pick 1 to 3. This helps people find training partners — not dates.</p><div class="mt16">' +
        E.chips(trains, ob.training, "ob-tag") + "</div>";
    }
    if (step === "discovery") {
      return '<div class="title">Find people nearby?</div><p class="body muted mt12">Optional. 18+ only. EatAI is for accountability, not dating. You can pause this anytime in Privacy.</p>' +
        '<div class="card mt16 between"><div><div class="heading">Discovery</div><div class="caption">Show you to people with a similar goal</div></div>' +
        E.switch(ob.discovery, 'data-action="ob-discovery"') + "</div>";
    }
    if (step === "calculating") {
      return '<div class="center" style="padding-top:48px"><div class="logo" style="width:72px;height:72px;margin:0 auto 16px;border-radius:22px">' + E.logo(72) + "</div>" +
        '<div class="title">Building your plan…</div><p class="body muted mt12" id="calc-tip">Reading your goal…</p>' +
        '<p class="caption mt20">' + E.esc(ob.name || "You") + " · " + E.esc((E.goalMeta[ob.goal] || {}).label || "a fresh start") + "</p></div>";
    }
    const plan = E.calcPlan(ob);
    return '<div class="overline">Your starting plan</div><div class="hero-card mt12"><div class="overline" style="color:var(--lime)">Daily calories</div>' +
      '<div class="kcal-num nums">' + E.num(plan.kcal) + '</div><p class="caption" style="color:rgba(255,255,255,.65)">Estimates you can edit any time.</p>' +
      E.macros({ p: 0, c: 0, f: 0 }, plan) + "</div>" +
      '<div class="grid3 mt12"><div class="stat"><b>' + plan.p + 'g</b><span>Protein</span></div><div class="stat"><b>' + plan.c + 'g</b><span>Carbs</span></div><div class="stat"><b>' + plan.f + 'g</b><span>Fats</span></div></div>' +
      '<p class="caption mt16">This is a starting point, not a rule. Scan a meal whenever you\'re ready.</p>';
  }

  E.screens.onboarding = function () {
    const ob = E.state.onboarding;
    const steps = E.onboardingSteps(ob);
    if (ob.i >= steps.length) ob.i = steps.length - 1;
    if (ob.i < 0) ob.i = 0;
    const step = steps[ob.i];
    const pct = Math.round(((ob.i + 1) / steps.length) * 100);
    const skip = step === "training" || step === "discovery";
    const showContinue = step !== "calculating";
    const label = step === "reveal" ? (ob.mode === "edit" ? "Update plan" : "Start tracking") : "Continue";
    const top = '<button type="button" class="icon-btn" data-action="ob-back" aria-label="Back">' + E.icon("chevron-left") + '</button>' +
      '<div class="ob-progress"><span style="width:' + pct + '%"></span></div>' +
      (skip ? '<button type="button" class="btn btn-ghost btn-sm" data-action="ob-skip">Skip</button>' : '<span style="width:44px"></span>');
    const footer = showContinue ? E.btn(label, { disabled: !E.stepValid(ob), attrs: 'data-action="ob-next"' }) : "";
    return E.page({ top: top, footer: footer, body: '<div class="mt8">' + stepBody(ob, step) + "</div>" });
  };
})();
