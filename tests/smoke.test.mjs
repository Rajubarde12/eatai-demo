import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml" };

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const cache = path.join(os.homedir(), "Library/Caches/ms-playwright");
  const dirs = fs.existsSync(cache) ? fs.readdirSync(cache) : [];
  for (const d of dirs.filter((x) => x.startsWith("chromium_headless_shell")).sort().reverse()) {
    const bin = path.join(cache, d, "chrome-headless-shell-mac-arm64", "chrome-headless-shell");
    if (fs.existsSync(bin)) return bin;
  }
  throw new Error("Set CHROME_PATH to a Chromium binary");
}

let server;
let browser;
let base;

before(async () => {
  server = http.createServer((req, res) => {
    const url = new URL(req.url, "http://x");
    const file = path.join(root, decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname));
    if (!file.startsWith(root) || !fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise((r) => server.listen(0, r));
  base = "http://localhost:" + server.address().port + "/index.html?fast=1";
  browser = await chromium.launch({ executablePath: findChrome() });
});

after(async () => {
  await browser?.close();
  server?.close();
});

async function open(query = "") {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route(/images\.unsplash\.com|fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  await page.goto(base + query);
  await page.waitForFunction(() => window.EatAI && window.EatAI._rendered);
  return { page, errors };
}
async function confirm(page) {
  await page.waitForSelector("[data-action=confirm-ok]");
  await page.waitForTimeout(450);
  await page.click("[data-action=confirm-ok]");
}
const screenId = (page) => page.evaluate(() => window.EatAI.current().id);
const step = (page) => page.evaluate(() => {
  const E = window.EatAI;
  return E.onboardingSteps(E.state.onboarding)[E.state.onboarding.i];
});

async function onboardGuest(page, year = "1978") {
  await page.click("[data-action=guest-start]");
  await page.click("[data-value=lose]");
  await page.waitForFunction(() => document.getElementById("ob-name"));
  await page.fill("#ob-name", "Ramesh");
  await page.press("#ob-name", "Enter");
  await page.click("[data-value=male]");
  await page.waitForSelector("[data-testid=ob-year-input]");
  await page.fill("[data-testid=ob-year-input]", year);
  await page.click("[data-action=ob-next]");
  for (let i = 0; i < 3; i++) await page.click("[data-action=ob-next]");
  for (const v of ["0.5", "desk", "none", "veg"]) {
    await page.click(`[data-value="${v}"]`);
    await page.waitForTimeout(350);
  }
  await page.waitForFunction(() => {
    const E = window.EatAI;
    return E.onboardingSteps(E.state.onboarding)[E.state.onboarding.i] === "reveal";
  }, null, { timeout: 5000 });
  await page.click("[data-action=ob-next]");
  await page.waitForFunction(() => window.EatAI.current().id === "home");
}

async function photoScan(page) {
  await page.click("[data-testid=shutter]");
  if (await page.$("[data-testid=ai-allow]")) await page.click("[data-testid=ai-allow]");
  if (await page.$(".paywall")) return "paywall";
  await page.click("[data-testid=photo-estimate]");
  await page.waitForFunction(() => window.EatAI.current().id === "scan-result", null, { timeout: 5000 });
  return "result";
}

test("new guest onboards with auto-advance and a typed birth year", async () => {
  const { page, errors } = await open();
  await onboardGuest(page);
  const u = await page.evaluate(() => window.EatAI.state.user);
  const steps = await page.evaluate(() => window.EatAI.onboardingSteps(window.EatAI.blankOnboarding({ year: 1978 })));
  assert.ok(!steps.includes("training") && !steps.includes("discovery"), "social steps wait for chat setup");
  assert.equal(u.birthYear, 1978);
  assert.equal(u.name, "Ramesh");
  assert.ok(await page.$("[data-testid=start-card]"), "first-meal card shows on Home");
  assert.equal(await page.$(".section-head h2:text('Eat it again')"), null, "empty Eat it again is hidden");
  const coach = await page.textContent(".card .heading.mt12");
  assert.match(coach, /Start with one meal/);
  assert.deepEqual(errors, []);
});

test("birth year outside the range is refused with a message", async () => {
  const { page } = await open();
  await page.click("[data-action=guest-start]");
  await page.click("[data-value=health]");
  await page.waitForFunction(() => document.getElementById("ob-name"));
  await page.fill("#ob-name", "Test");
  await page.click("[data-action=ob-next]");
  await page.click("[data-value=other]");
  await page.waitForSelector("[data-testid=ob-year-input]");
  await page.fill("[data-testid=ob-year-input]", "19");
  await page.click("[data-action=ob-next]");
  assert.equal(await step(page), "birth");
  assert.match(await page.textContent("#overlay .toast"), /1940 and 2015/);
});

test("a usual-meal chip logs the first meal in two taps and starts the streak", async () => {
  const { page, errors } = await open();
  await onboardGuest(page);
  await page.click("[data-testid=combo-dal-chawal]");
  assert.equal(await screenId(page), "scan-result");
  await page.click("[data-testid=scan-add]");
  await page.waitForSelector("[data-testid=first-meal-sheet]");
  const streak = await page.evaluate(() => window.EatAI.state.user.streak.current);
  assert.equal(streak, 1);
  await page.click("[data-testid=first-meal-done]");
  await page.click("[data-tab=home]");
  assert.match(await page.textContent(".streak-pill"), /1/);
  assert.equal(await page.$("[data-testid=start-card]"), null);
  assert.deepEqual(errors, []);
});

test("macros are editable after a scan and from logged meal details", async () => {
  const { page, errors } = await open();
  await onboardGuest(page);
  await page.click("[data-testid=combo-dal-chawal]");
  await page.fill("[data-testid=meal-protein-input]", "40");
  await page.click("[data-testid=item-0-macros-toggle]");
  await page.fill("[data-testid=item-0-protein-input]", "25");
  await page.click("[data-testid=scan-add]");
  await page.click("[data-testid=first-meal-done]");

  let saved = await page.evaluate(() => {
    const E = window.EatAI;
    return { totals: E.mealTotals(E.state.meals[0]), first: E.state.meals[0].items[0] };
  });
  assert.equal(saved.first.p, 25);

  await page.evaluate(() => {
    const E = window.EatAI;
    E.state.nav = { tab: "diary", stack: [{ id: "diary" }] };
    E.render({});
  });
  await page.click("[data-action=open-meal]");
  await page.click("[data-testid=meal-edit]");
  await page.fill("[data-testid=meal-carbs-input]", "80");
  await page.click("[data-testid=item-0-macros-toggle]");
  await page.fill("[data-testid=item-0-fats-input]", "10");
  await page.click("[data-testid=edit-save]");

  saved = await page.evaluate(() => {
    const E = window.EatAI;
    return { totals: E.mealTotals(E.state.meals[0]), first: E.state.meals[0].items[0] };
  });
  assert.equal(saved.totals.c, 80);
  assert.equal(saved.first.f, 10);
  assert.deepEqual(errors, []);
});

test("declining AI consent lands on the free food list, not a dead end", async () => {
  const { page } = await open("&persona=priya");
  await page.evaluate(() => { const E = window.EatAI; E.state.meals = []; E.state.user.subscription.status = "trial"; E.state.user.subscription.trialUsed = true; E.render({}); });
  await page.click(".scan-fab");
  await page.click("[data-testid=shutter]");
  await page.click("[data-testid=ai-not-now]");
  assert.equal(await screenId(page), "scan");
  assert.ok(await page.$("[data-testid=food-list]"));
  await page.click("[data-testid=food-egg]");
  await page.click("[data-testid=scan-add]");
  const meals = await page.evaluate(() => window.EatAI.state.meals.map((m) => m.name));
  assert.deepEqual(meals, ["Boiled egg"]);
});

test("guest photo scan explains the Pro gate and offers the trial after email", async () => {
  const { page, errors } = await open();
  await onboardGuest(page);
  await page.click(".scan-fab");
  assert.match(await page.textContent("[data-testid=scan-lock]"), /AI photo scan is part of Pro.*3 days/);
  assert.equal(await photoScan(page), "paywall");
  assert.match(await page.textContent(".paywall"), /Why this stopped/);
  assert.match(await page.textContent(".paywall"), /start your 3-day free trial/);
  await page.click("[data-testid=paywall-food-list]");
  assert.ok(await page.$("[data-testid=food-list]"));
  assert.deepEqual(errors, []);
});

test("store trial shows autopay terms, unlocks the scan, and cancels without a charge", async () => {
  const { page, errors } = await open("&persona=priya");
  await page.click(".scan-fab");
  assert.equal(await photoScan(page), "paywall");
  assert.match(await page.textContent("[data-testid=trial-terms]"), /₹1,?999 every year, auto-paid by the store/);
  await page.click("[data-testid=paywall-trial]");
  if (await page.$("[data-testid=ai-allow]")) await page.click("[data-testid=ai-allow]");
  const sub = await page.evaluate(() => window.EatAI.state.user.subscription);
  assert.equal(sub.status, "trial");
  assert.equal(sub.renewsAt, await page.evaluate(() => window.EatAI.iso(window.EatAI.addDays(3))));
  assert.equal(await page.evaluate(() => window.EatAI.state.payments.length), 0, "trial charges nothing");
  await page.evaluate(() => { const E = window.EatAI; E.state.nav.stack = [{ id: "profile" }, { id: "subscription" }]; E.state.modal = null; E.render({}); });
  assert.match(await page.textContent("#stage"), /Free trial until .*autopay ₹1,?999/);
  await page.click("[data-action=ask-cancel]");
  assert.match(await page.textContent("#overlay"), /You won't be charged/);
  await confirm(page);
  const after = await page.evaluate(() => ({ sub: window.EatAI.state.user.subscription, pro: window.EatAI.isPro(), trialOpen: window.EatAI.trialOpen() }));
  assert.equal(after.sub.status, "cancelled");
  assert.ok(after.pro, "Pro stays until the trial end date");
  assert.equal(after.trialOpen, false, "trial can't be taken twice");
  assert.deepEqual(errors, []);
});

test("food search matches word starts and Hinglish aliases", async () => {
  const { page } = await open();
  const names = await page.evaluate(() => ({
    anda: window.EatAI.searchFoods("anda").map((f) => f.name),
    chawal: window.EatAI.searchFoods("chawal").map((f) => f.name),
    dahi: window.EatAI.searchFoods("dahi").map((f) => f.name)
  }));
  assert.deepEqual(names.anda, ["Boiled egg", "Omelette"]);
  assert.deepEqual(names.chawal, ["Rice"]);
  assert.deepEqual(names.dahi, ["Curd"]);
});

test("barcode stays Pro for free users and works for Pro", async () => {
  const free = await open("&persona=priya");
  await free.page.click(".scan-fab");
  await free.page.click("[data-testid=scan-mode-barcode]");
  assert.match(await free.page.textContent("[data-testid=scan-lock]"), /Barcode scan is part of Pro/);
  const pro = await open("&persona=rahul");
  await pro.page.click(".scan-fab");
  assert.equal(await pro.page.$("[data-testid=scan-lock]"), null);
  await pro.page.click("[data-testid=scan-mode-barcode]");
  await pro.page.waitForFunction(() => window.EatAI.current().id === "scan-result", null, { timeout: 6000 });
  assert.deepEqual(pro.errors, []);
});

test("logging again on a day that already counted does not double the streak", async () => {
  const { page } = await open("&persona=priya");
  const before = await page.evaluate(() => {
    const E = window.EatAI;
    E.syncStreak();
    return E.state.user.streak.current;
  });
  await page.click("[data-action=quick-add]");
  const after = await page.evaluate(() => window.EatAI.state.user.streak.current);
  assert.equal(after, before);
});

test("bigger text toggle switches the whole app", async () => {
  const { page } = await open("&persona=sunita");
  await page.click("[data-tab=profile]");
  await page.click("[data-testid=large-text-toggle]");
  assert.equal(await page.getAttribute("#viewport", "data-text"), "large");
  const size = await page.evaluate(() => getComputedStyle(document.querySelector(".caption")).fontSize);
  assert.equal(size, "15px");
});

test("every screen and modal renders for every persona without a snag", async () => {
  for (const persona of ["priya", "rahul", "guest", "sunita", "teen", "kid", "aisha"]) {
    const { page, errors } = await open("&persona=" + persona);
    const broken = await page.evaluate(() => {
      const E = window.EatAI;
      const bad = [];
      Object.keys(E.screens).forEach((id) => {
        E.state.nav.stack = [{ id: "home" }, { id: id, params: {} }];
        E.state.modal = null;
        E.render({});
        if (document.querySelector("#stage").textContent.includes("This screen hit a snag")) bad.push("screen:" + id);
      });
      E.state.nav.stack = [{ id: "home" }];
      Object.keys(E.modals).forEach((id) => {
        E.state.modal = { id: id };
        try { E.render({}); } catch (err) { bad.push("modal:" + id + " " + err.message); }
      });
      return bad;
    });
    assert.deepEqual(broken, [], persona);
    assert.deepEqual(errors, [], persona);
    await page.close();
  }
});

test("under-16 and breastfeeding paths still finish onboarding safely", async () => {
  const { page } = await open();
  const result = await page.evaluate(() => {
    const E = window.EatAI;
    const kid = E.onboardingSteps(E.blankOnboarding({ goal: "lose", year: 2013 }));
    const bf = E.blankOnboarding({ goal: "lose", gender: "female", pregnancy: "breastfeeding", year: 1994 });
    return { kid, bfSteps: E.onboardingSteps(bf), bfKcal: E.calcPlan(bf).kcal, normalKcal: E.calcPlan(Object.assign({}, bf, { pregnancy: null, goal: "health" })).kcal };
  });
  assert.ok(result.kid.includes("support") && !result.kid.includes("target") && !result.kid.includes("pace"));
  assert.ok(result.bfSteps.includes("support") && !result.bfSteps.includes("pace"));
  assert.equal(result.bfKcal - result.normalKcal, 300);
});

test("guest chat setup still asks for training tags after the shorter onboarding", async () => {
  const { page } = await open();
  await onboardGuest(page);
  const fields = await page.evaluate(() => {
    const E = window.EatAI;
    E.state.user.isGuest = false;
    E.state.user.isEmailVerified = true;
    return E.pendingChatFields(E.state.user);
  });
  assert.ok(fields.includes("tags"));
  assert.ok(fields.includes("discovery"));
});

test("scan discard still returns to the previous screen", async () => {
  const { page } = await open("&persona=rahul");
  await page.click(".scan-fab");
  assert.equal(await photoScan(page), "result");
  await page.click("[data-testid=scan-discard]");
  assert.equal(await screenId(page), "home");
});

test("coach code attribution stays separate from coaching data consent", async () => {
  const { page, errors } = await open("&persona=priya");
  await page.click("[data-tab=profile]");
  await page.click("[data-testid=open-referrals]");
  await page.fill("[data-testid=referral-code-input]", "coach-ravi");
  await page.click("[data-testid=apply-referral]");
  const linked = await page.evaluate(() => ({
    code: window.EatAI.state.referral.appliedCode,
    locked: window.EatAI.state.referral.locked,
    coachStatus: window.EatAI.state.coachRelationship.status
  }));
  assert.deepEqual(linked, { code: "COACH-RAVI", locked: false, coachStatus: "pending" });
  await page.click("[data-action=back]");
  await page.click("[data-testid=open-my-coach]");
  assert.equal(await page.getAttribute("[data-testid=coach-permission-photos]", "aria-checked"), "false");
  await page.click("[data-testid=accept-coach]");
  assert.equal(await page.evaluate(() => window.EatAI.state.coachRelationship.status), "active");
  assert.deepEqual(errors, []);
});

test("coach commission is created only after a successful Pro purchase", async () => {
  const { page, errors } = await open("&persona=priya");
  await page.evaluate(() => {
    const E = window.EatAI;
    E.state.referral.appliedCode = "COACH-RAVI";
    E.state.referral.type = "coach";
    E.state.referral.referrerName = "Ravi Verma";
    E.state.modal = { id: "paywall" };
    E.render({});
  });
  assert.equal(await page.evaluate(() => window.EatAI.state.referral.purchase || null), null);
  assert.doesNotMatch(await page.textContent(".paywall"), /15%|net collected revenue/);
  await page.click("[data-testid=paywall-buy]");
  await page.waitForFunction(() => window.EatAI.state.referral.locked === true);
  const purchase = await page.evaluate(() => window.EatAI.state.referral.purchase);
  assert.equal(purchase.status, "pending");
  assert.equal(purchase.rate, 15);
  assert.ok(purchase.commission > 0);
  await page.evaluate(() => {
    const E = window.EatAI;
    E.state.confirm = null;
    E.state.nav = { tab: "profile", stack: [{ id: "profile" }, { id: "referrals" }] };
    E.render({});
  });
  assert.doesNotMatch(await page.textContent("#stage"), /15%|net collected revenue|commission pending/);
  assert.match(await page.textContent("#stage"), /Referral confirmed/);
  assert.deepEqual(errors, []);
});

test("verified coach can invite a customer but earns nothing before Pro", async () => {
  const { page, errors } = await open("&persona=rahul");
  await page.click("[data-tab=profile]");
  await page.click("[data-testid=open-coach-partner]");
  const before = await page.evaluate(() => ({
    customers: window.EatAI.state.partner.customers.length,
    commissions: window.EatAI.state.partner.commissions.length
  }));
  await page.fill("[data-testid=partner-customer-input]", "new.customer@demo.app");
  await page.click("[data-testid=partner-invite-customer]");
  await page.waitForFunction((n) => window.EatAI.state.partner.customers.length === n + 1, before.customers);
  const after = await page.evaluate(() => ({
    customer: window.EatAI.state.partner.customers[0],
    commissions: window.EatAI.state.partner.commissions.length
  }));
  assert.equal(after.customer.status, "pending");
  assert.equal(after.commissions, before.commissions);
  assert.match(await page.textContent("#stage"), /Sign-ups and free trials earn ₹0/);
  assert.deepEqual(errors, []);
});

test("verified coach community has channels, safe challenges, and a separate coach consent step", async () => {
  const { page, errors } = await open("&persona=priya");
  await page.evaluate(() => {
    const E = window.EatAI;
    E.state.nav = { tab: "chat", stack: [{ id: "communities" }] };
    E.render({});
  });
  assert.match(await page.textContent("#stage"), /Communities.*Coach.*Client group/s);
  await page.click('[data-action="open-community"][data-id="cm-coach-ravi"]');
  assert.match(await page.textContent("#stage"), /Verified Coach Community/);
  assert.match(await page.textContent("#stage"), /does not share health data or start coaching/);
  await page.click('[data-action="community-channel"][data-value="meals"]');
  assert.match(await page.textContent("#stage"), /Sharing the plate, not my whole diary/);
  await page.click('[data-action="comm-view"][data-value="hub"]');
  assert.match(await page.textContent("#stage"), /No crash diets.*public weigh-ins/s);
  await page.click("[data-testid=community-challenge]");
  assert.equal(await page.evaluate(() => window.EatAI.communityById("cm-coach-ravi").challenge.joined), true);
  await page.click("[data-testid=community-connect-coach]");
  assert.equal(await screenId(page), "my-professional-coach");
  await page.click("[data-testid=accept-coach]");
  const types = await page.evaluate(() => window.EatAI.state.chats.filter((c) => c.professional).map((c) => c.type).sort());
  assert.deepEqual(types, ["client-group", "professional-coach"]);
  assert.deepEqual(errors, []);
});

test("coach chat and private client group stay separate from normal chats and private diary data", async () => {
  const { page, errors } = await open("&persona=priya");
  await page.evaluate(() => {
    const E = window.EatAI;
    E.state.coachRelationship.status = "active";
    E.ensureCoachChats();
    E.state.nav = { tab: "chat", stack: [{ id: "messages" }] };
    E.render({});
  });
  assert.match(await page.textContent("#stage"), /Professional coaching/);
  assert.ok(await page.$("[data-testid=open-coach-chat]"));
  await page.click("[data-testid=open-client-group]");
  assert.match(await page.textContent("[data-testid=client-group-privacy]"), /diary, weight and photos are never attached automatically/);
  await page.click('[data-action="open-group"]');
  assert.match(await page.textContent("#stage"), /Private client group/);
  await page.click("[data-testid=leave-client-group]");
  await confirm(page);
  assert.equal(await page.evaluate(() => window.EatAI.state.coachRelationship.clientGroupLeft), true);
  assert.deepEqual(errors, []);
});

test("verified coach can create a private client group from accepted customers", async () => {
  const { page, errors } = await open("&persona=rahul");
  await page.evaluate(() => {
    const E = window.EatAI;
    E.state.nav = { tab: "profile", stack: [{ id: "coach-partner" }] };
    E.render({});
  });
  await page.click("[data-testid=new-client-group]");
  await page.fill("#client-group-name", "Rahul Morning Batch");
  await page.click('[data-action="pick-client-customer"]');
  await page.click("[data-testid=create-client-group]");
  assert.equal(await screenId(page), "thread");
  const group = await page.evaluate(() => window.EatAI.state.chats.find((c) => c.name === "Rahul Morning Batch"));
  assert.equal(group.type, "client-group");
  assert.match(await page.textContent("#stage"), /Private client group/);
  assert.deepEqual(errors, []);
});

test("community posts can include a selected photo or one private food-log snapshot", async () => {
  const { page, errors } = await open("&persona=rahul");
  await page.evaluate(() => {
    const E = window.EatAI;
    E.state.nav = { tab: "chat", stack: [{ id: "community", params: { id: "cm-coach-ravi" } }] };
    E.state.ui.commView = "feed";
    E.render({});
  });
  await page.click("[data-testid=community-post-photo]");
  await page.click("[data-testid=community-photo-0]");
  await page.fill("[data-testid=post-draft]", "Sunday thali");
  await page.click("[data-testid=post-send]");
  let latest = await page.evaluate(() => window.EatAI.communityById("cm-coach-ravi").posts[0]);
  assert.ok(latest.image);
  assert.equal(latest.meal, null);
  await page.click("[data-testid=community-post-meal]");
  await page.click("[data-testid=community-meal-pick]");
  await page.fill("[data-testid=post-draft]", "Breakfast check-in");
  await page.click("[data-testid=post-send]");
  latest = await page.evaluate(() => window.EatAI.communityById("cm-coach-ravi").posts[0]);
  assert.equal(latest.image, "");
  assert.ok(latest.meal && latest.meal.name && latest.meal.kcal > 0);
  assert.deepEqual(Object.keys(latest.meal).sort(), ["c", "emoji", "f", "image", "kcal", "name", "p"]);
  assert.match(await page.textContent("#stage"), /Shared food log/);
  assert.deepEqual(errors, []);
});

test("free community member sees the Pro reason before sharing a food log", async () => {
  const { page, errors } = await open("&persona=priya");
  await page.evaluate(() => {
    const E = window.EatAI;
    E.state.nav = { tab: "chat", stack: [{ id: "community", params: { id: "cm-coach-ravi" } }] };
    E.state.ui.commView = "feed";
    E.render({});
  });
  await page.click("[data-testid=community-post-meal]");
  assert.match(await page.textContent(".paywall"), /selected meal is posted.*rest of your diary stays private/s);
  assert.deepEqual(errors, []);
});
