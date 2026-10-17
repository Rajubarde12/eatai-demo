(function () {
  const E = window.EatAI;

  const referralCatalog = {
    "COACH-RAVI": { type: "coach", name: "Ravi Verma", qualification: "Certified nutrition coach", color: "#D9F2FF" },
    "COACH-RAHUL": { type: "coach", name: "Rahul Mehta", qualification: "Certified fitness and nutrition coach", color: "#BFD4FF" },
    "RAMESH42": { type: "user", name: "Ramesh" },
    "PRIYA42": { type: "user", name: "Priya" }
  };

  E.referralByCode = function (code) {
    return referralCatalog[String(code || "").trim().toUpperCase()] || null;
  };

  E.ensureCoachChats = function () {
    const rel = E.state.coachRelationship;
    if (!rel || rel.status !== "active" || !rel.coach || E.state.user.ageBlocked) return null;
    const coach = rel.coach;
    let dm = (E.state.chats || []).find(function (c) { return c.type === "professional-coach" && c.coachId === coach.id; });
    if (!dm) {
      dm = {
        id: "coach-dm-" + coach.id, type: "professional-coach", coachId: coach.id, professional: true,
        name: coach.name, color: coach.color || "#D9F2FF", initials: E.initials(coach.name), online: true,
        preview: "Your private coach chat is ready", time: Date.now(), unread: 1,
        messages: [
          { id: E.uid("coachmsg"), from: "them", name: coach.name, text: "Welcome. Start with one normal meal—no crash changes. This chat is private.", at: Date.now() - 180000, status: "read" }
        ]
      };
      E.state.chats.unshift(dm);
    }
    let group = E.state.chats.find(function (c) { return c.type === "client-group" && c.coachId === coach.id; });
    if (!group && !rel.clientGroupLeft) {
      group = {
        id: "coach-group-" + coach.id, type: "client-group", coachId: coach.id, professional: true, privateClientGroup: true,
        name: "Ravi's Morning Batch", color: "#E4F7C8", initials: "RB", members: [coach.name + " · Coach", "You", "Neha", "Aisha"],
        preview: "Ravi: One honest meal today is enough", time: Date.now() - 3600000, unread: 1,
        messages: [
          { id: E.uid("coachmsg"), from: "them", name: coach.name + " · Coach", text: "One honest meal today is enough. Share only what you want the group to see.", at: Date.now() - 3600000, status: "read" },
          { id: E.uid("coachmsg"), from: "them", name: "Neha", text: "Lunch logged. Keeping the rest private.", at: Date.now() - 2400000, status: "read" }
        ]
      };
      E.state.chats.splice(1, 0, group);
    }
    return { dm: dm, group: group };
  };

  E.recordReferralPurchase = function (amount, plan) {
    const r = E.state.referral;
    if (!r || !r.appliedCode || r.locked) return null;
    r.locked = true;
    if (r.type === "coach") {
      const rate = 15;
      const net = Math.round(Number(amount || 0) * 0.765);
      const commission = Math.round(net * rate / 100);
      r.purchase = { date: E.todayIso(), plan: plan, gross: amount, net: net, rate: rate, commission: commission, status: "pending" };
      return { type: "coach", name: r.referrerName, amount: commission };
    }
    r.purchase = { date: E.todayIso(), plan: plan, status: "qualified" };
    return { type: "user", name: r.referrerName, rewardDays: 3 };
  };

  function statusLabel(status) {
    const names = { applied: "Applied", purchased: "Pro purchased", paid: "Pro · paid", free: "Free", pending: "Pending", approved: "Approved", reversed: "Reversed" };
    return '<span class="label partner-status ' + E.esc(status) + '">' + E.esc(names[status] || status) + "</span>";
  }

  function maskedRows(rows) {
    if (!rows.length) return E.empty({ emoji: "🌱", title: "No referrals yet", sub: "A reward appears only after a referred friend buys Pro." });
    return rows.map(function (x) {
      return '<div class="set-row"><div class="grow"><div class="heading" style="font-size:15px">' + E.esc(x.name) + '</div><div class="caption">' +
        (x.status === "purchased" ? E.esc(x.plan) + " Pro · you earned " + x.rewardDays + " days" : "Joined free · no reward yet") +
        "</div></div>" + statusLabel(x.status) + "</div>";
    }).join("");
  }

  E.screens.referrals = function () {
    const gate = E.gate();
    if (gate) return E.page({ top: E.topTitle("Refer & rewards"), body: gate });
    const r = E.state.referral;
    const u = E.state.user;
    const applied = r.appliedCode
      ? '<div class="card mt12"><div class="between"><div><div class="overline">Code applied</div><div class="heading mt4">' + E.esc(r.appliedCode) + '</div></div>' + statusLabel(r.locked ? "purchased" : "applied") + '</div><p class="caption mt8">' +
        (r.type === "coach"
          ? "Referred by " + E.esc(r.referrerName) + ". They may earn a referral commission if you purchase Pro. Your price stays the same."
          : E.esc(r.referrerName) + " gets 3 Pro days only if you buy Pro.") +
        "</p>" + (r.purchase && r.type === "coach" ? '<div class="banner mt12"><span>✓</span><span><b>Referral confirmed</b><span class="caption" style="display:block">Your Pro purchase was linked to ' + E.esc(r.referrerName) + ".</span></span></div>" : "") + "</div>"
      : '<div class="card mt12"><div class="heading">Have a referral code?</div><p class="caption mt8">Joining is free. A coach earns only after your successful Pro payment.</p><div class="mt12">' +
        E.field({ label: "Referral or coach code", id: "referral-code", model: "referral-code", value: E.state.ui.referralCode, placeholder: "COACH-RAVI", attrs: 'autocapitalize="characters" data-testid="referral-code-input"' }) +
        (E.state.ui.referralError ? '<p class="field-error mt8">' + E.esc(E.state.ui.referralError) + "</p>" : "") +
        '<div class="mt12">' + E.btn("Apply code", { attrs: 'data-action="apply-referral" data-testid="apply-referral"' }) + "</div></div></div>";
    const body = '<div class="hero-card"><div class="overline" style="color:var(--lime)">Your code</div><div class="partner-code mt8">' + E.esc(r.ownCode) + '</div><p class="caption mt8" style="color:rgba(255,255,255,.72)">Your friend joins free. You earn 3 banked Pro days only when their Pro payment succeeds.</p><div class="grid2 mt16">' +
      E.btn("Copy code", { size: "md", variant: "accent", attrs: 'data-action="copy-referral" data-testid="copy-referral"' }) +
      E.btn("Share", { size: "md", variant: "light", attrs: 'data-action="share-referral"' }) + "</div></div>" +
      (u.ageBlocked ? '<div class="banner amber mt12"><span>🛡️</span><span><b>No cash rewards</b><span class="caption" style="display:block">Under-18 accounts can only bank in-app Pro days.</span></span></div>' : "") +
      applied +
      '<div class="grid2 mt16"><div class="stat"><b>' + r.rewardDays + '</b><span>Pro days banked</span></div><div class="stat"><b>' + (r.invitees || []).filter(function (x) { return x.status === "purchased"; }).length + '</b><span>Paid referrals</span></div></div>' +
      '<div class="overline mt20">Your referrals</div><div class="list-card mt8">' + maskedRows(r.invitees || []) + "</div>" +
      '<p class="caption center mt16">No reward for installs, sign-ups, free trials, failed payments, or refunded purchases.</p>';
    return E.page({ top: E.topTitle("Refer & rewards", "Code-based, no referral link"), pull: true, body: body });
  };

  function permissionRow(key, title, sub, sensitive) {
    const rel = E.state.coachRelationship;
    return '<div class="set-row"><div class="grow"><div class="heading" style="font-size:15px">' + E.esc(title) + (sensitive ? ' <span class="caption">Sensitive</span>' : "") + '</div><div class="caption">' + E.esc(sub) + '</div></div>' +
      E.switch(!!rel.permissions[key], 'data-action="coach-permission" data-key="' + key + '" data-testid="coach-permission-' + key + '" aria-label="' + E.esc(title) + '"') + "</div>";
  }

  E.screens["my-professional-coach"] = function () {
    const gate = E.gate();
    if (gate) return E.page({ top: E.topTitle("Professional Coach"), body: gate });
    const rel = E.state.coachRelationship;
    if (rel.status === "guardian" || E.state.user.ageBlocked) {
      return E.page({
        top: E.topTitle("Professional Coach"),
        body: E.empty({
          emoji: "🛡️",
          title: "Guardian approval needed",
          sub: "Under-18 accounts cannot connect a Professional Coach on their own. You can keep logging meals and return Home.",
          button: E.btn("Back to Home", { attrs: 'data-action="tab" data-tab="home" data-testid="coach-guardian-home"' })
        })
      });
    }
    if (rel.status === "none" || !rel.coach) {
      return E.page({
        top: E.topTitle("Professional Coach"),
        body: E.empty({
          emoji: "🤝",
          title: "No coach connected",
          sub: "Apply a coach code under Refer & rewards. Applying a code never shares meals automatically.",
          button: E.btn("Enter a coach code", { attrs: 'data-action="go" data-screen="referrals"' })
        })
      });
    }
    const c = rel.coach;
    const pending = rel.status === "pending";
    const body = '<div class="card"><div class="row gap12">' + E.avatar({ name: c.name, color: c.color, size: 58 }) +
      '<div class="grow"><div class="overline">' + (pending ? "Coach request" : "Connected coach") + '</div><div class="heading">' + E.esc(c.name) + '</div><div class="caption">' + E.esc(c.qualification) + "</div></div></div>" +
      '<div class="banner mt16"><span>🔒</span><span><b>Referral and coaching are separate</b><span class="caption" style="display:block">Commission attribution does not grant access. You choose every permission below.</span></span></div></div>' +
      '<div class="overline mt20">What this coach can see</div><div class="list-card mt8">' +
      permissionRow("meals", "Meals & macros", "Meal names, portions and estimates") +
      permissionRow("weekly", "Weekly report", "Hit days, protein and streak") +
      permissionRow("weight", "Weight trend", "Trend and weigh-ins") +
      permissionRow("water", "Water & streak", "Daily glasses and logging streak") +
      permissionRow("photos", "Progress photos", "Private photos · off by default", true) +
      permissionRow("health", "Health details", "Pregnancy or breastfeeding status · off by default", true) + "</div>" +
      (pending
        ? '<div class="grid2 mt16">' + E.btn("Decline", { variant: "secondary", attrs: 'data-action="decline-coach" data-testid="decline-coach"' }) + E.btn("Accept coach", { attrs: 'data-action="accept-coach" data-testid="accept-coach"' }) + "</div>"
        : '<div class="grid2 mt16">' + E.btn("Message Coach", { attrs: 'data-action="message-professional-coach" data-testid="message-professional-coach"' }) + E.btn(rel.clientGroupLeft ? "Rejoin group" : "Client group", { variant: "secondary", attrs: 'data-action="' + (rel.clientGroupLeft ? "rejoin-professional-group" : "open-professional-group") + '" data-testid="open-professional-group"' }) + '</div><div class="mt8">' + E.btn("Remove coach", { variant: "ghost", attrs: 'data-action="ask-remove-coach" data-testid="remove-coach"' }) + "</div>") +
      '<p class="caption center mt12">You can change permissions or remove access at any time.</p>';
    return E.page({ top: E.topTitle("Professional Coach", pending ? "Review before sharing" : "You control access"), body: body });
  };

  function commissionRows(rows) {
    if (!rows.length) return E.empty({ emoji: "₹", title: "No commission yet", sub: "A row appears only after a referred customer successfully buys Pro." });
    return rows.map(function (x) {
      return '<div class="set-row"><div class="grow"><div class="heading" style="font-size:15px">₹' + E.num(x.amount) + " · " + E.esc(x.customer) + '</div><div class="caption">' + E.niceDate(x.date) + " · " + E.esc(x.plan) + " · ₹" + E.num(x.gross) + " gross → ₹" + E.num(x.net) + " net × " + x.rate + "%</div></div>" + statusLabel(x.status) + "</div>";
    }).join("");
  }

  E.screens["coach-partner"] = function () {
    const gate = E.gate();
    if (gate) return E.page({ top: E.topTitle("Coach Partner"), body: gate });
    const p = E.state.partner;
    if (E.state.user.ageBlocked) {
      return E.page({ top: E.topTitle("Coach Partner"), body: E.empty({ emoji: "🛡️", title: "Available at 18", sub: "Partner registration and payouts require an adult account.", button: E.btn("Back to Profile", { variant: "secondary", attrs: 'data-action="tab" data-tab="profile"' }) }) });
    }
    if (!p.registered) {
      const body = '<div class="hero-card"><div class="overline" style="color:var(--lime)">Professional Coach Partner</div><div class="title mt8">Grow together.</div><p class="body mt8" style="color:rgba(255,255,255,.75)">Invite customers with a code. Joining earns nothing. A verified Pro payment creates 15% commission on net collected revenue.</p></div>' +
        '<div class="card mt16"><div class="heading">Before you apply</div><div class="stack mt12 caption"><p>✓ Professional qualification and identity review</p><p>✓ PAN, bank and payout verification in the real app</p><p>✓ No diagnosis, medical claims or automatic health-data access</p><p>✓ Refunds reverse commission</p></div></div>' +
        '<div class="mt16">' + E.field({ label: "Qualification", id: "coach-qualification", model: "coach-qualification", value: E.state.ui.coachQualification, placeholder: "e.g. Certified nutrition coach", attrs: 'data-testid="coach-qualification"' }) + "</div>" +
        '<div class="mt16">' + E.btn("Apply as Coach Partner", { busy: E.state.ui.busy === "coach-apply", attrs: 'data-action="register-coach-partner" data-testid="register-coach-partner"' }) + "</div>" +
        '<p class="caption center mt12">Demo approval is instant. Real KYC and tax review would happen before payouts.</p>';
      return E.page({ top: E.topTitle("Coach Partner", "Human coach, not AI Coach"), body: body });
    }
    const approved = (p.commissions || []).filter(function (x) { return x.status === "approved"; }).reduce(function (n, x) { return n + x.amount; }, 0);
    const pending = (p.commissions || []).filter(function (x) { return x.status === "pending"; }).reduce(function (n, x) { return n + x.amount; }, 0);
    const paidCustomers = (p.customers || []).filter(function (x) { return x.status === "paid"; }).length;
    const customers = (p.customers || []).map(function (x) {
      return '<div class="set-row"><div class="grow"><div class="heading" style="font-size:15px">' + E.esc(x.name) + '</div><div class="caption">' + (x.status === "paid" ? E.esc(x.plan) + " Pro" : x.status === "pending" ? "Invite awaiting acceptance" : "Using Free · ₹0 commission") + "</div></div>" + statusLabel(x.status) + "</div>";
    }).join("") || '<div class="empty"><div class="heading">No customers yet</div><p class="caption mt8">Invite by verified email or EatAI ID.</p></div>';
    const body = '<div class="hero-card"><div class="between"><div><div class="overline" style="color:var(--lime)">Verified Partner</div><div class="partner-code mt8">' + E.esc(p.code) + '</div></div><span class="partner-badge">✓ Verified</span></div><p class="caption mt8" style="color:rgba(255,255,255,.72)">15% of net collected revenue. Sign-ups and free trials earn ₹0.</p><div class="grid2 mt16">' +
      E.btn("Copy code", { size: "md", variant: "accent", attrs: 'data-action="copy-partner-code" data-testid="copy-partner-code"' }) +
      E.btn("Share", { size: "md", variant: "light", attrs: 'data-action="share-partner-code"' }) + "</div></div>" +
      '<div class="grid3 mt16"><div class="stat"><b>' + paidCustomers + '</b><span>Paid users</span></div><div class="stat"><b>₹' + E.num(pending) + '</b><span>Pending</span></div><div class="stat"><b>₹' + E.num(approved) + '</b><span>Approved</span></div></div>' +
      '<div class="card mt16"><div class="heading">Invite a customer</div><p class="caption mt4">They must accept coaching permissions. Commission still starts only after Pro payment.</p><div class="mt12">' +
      E.field({ label: "Verified email or EatAI ID", id: "partner-contact", model: "partner-contact", value: E.state.ui.partnerContact, placeholder: "customer@email.com", attrs: 'data-testid="partner-customer-input"' }) +
      '<div class="mt12">' + E.btn("Send request", { size: "md", busy: E.state.ui.busy === "partner-invite", attrs: 'data-action="partner-invite-customer" data-testid="partner-invite-customer"' }) + '</div><div class="mt8">' +
      E.btn("Create private client group", { size: "md", variant: "secondary", attrs: 'data-action="open-modal" data-modal="new-client-group" data-testid="new-client-group"' }) + "</div></div></div>" +
      '<div class="overline mt20">Customers</div><div class="list-card mt8">' + customers + "</div>" +
      '<div class="overline mt20">Commission ledger</div><div class="list-card mt8">' + commissionRows(p.commissions || []) + "</div>" +
      '<div class="banner mt16"><span>🏦</span><span><b>' + (p.payoutReady ? "Payout details verified" : "Payout setup needed") + '</b><span class="caption" style="display:block">Monthly payout after ₹1,000 approved balance. Refund window applies.</span></span></div>';
    return E.page({ top: E.topTitle("Coach Partner", "Customers and earnings"), pull: true, body: body });
  };

  E.modals["new-client-group"] = function () {
    const picks = E.state.ui.groupPicks || [];
    const eligible = (E.state.partner.customers || []).filter(function (x) { return x.status !== "pending"; });
    return '<div class="modal-wrap" style="background:var(--canvas);overflow:auto;padding:16px 18px 24px"><div class="between"><button type="button" class="icon-btn" data-action="close-modal">' + E.icon("x") + '</button><div class="heading">Private client group</div><span style="width:44px"></span></div>' +
      '<p class="caption mt12">Invite accepted customers only. Their private diary and coach permissions never become visible to the group.</p>' +
      '<div class="mt16">' + E.field({ label: "Group name", id: "client-group-name", model: "group-name", value: E.state.ui.groupName, placeholder: "Morning accountability batch" }) + "</div>" +
      '<div class="overline mt16">Customers</div><div class="list-card mt8">' + eligible.map(function (x) {
        const on = picks.indexOf(x.id) >= 0;
        return '<button type="button" class="nav-row" data-action="pick-client-customer" data-id="' + x.id + '"><span class="avatar" style="width:40px;height:40px;background:#E4F7C8">' + E.esc(E.initials(x.name)) + '</span><span class="grow"><b>' + E.esc(x.name) + '</b><span class="caption">' + (x.status === "paid" ? E.esc(x.plan) + " Pro" : "Free customer") + "</span></span>" + (on ? E.icon("check") : "") + "</button>";
      }).join("") + '</div><div class="mt16">' +
      E.btn("Create client group", { disabled: !E.state.ui.groupName || !picks.length, attrs: 'data-action="create-client-group" data-testid="create-client-group"' }) +
      "</div></div>";
  };
})();
