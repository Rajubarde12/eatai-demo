window.EatAI = window.EatAI || {};
(function () {
  const E = window.EatAI;
  const KEY = "eatai-demo-v1";

  E.img = {
    dosa: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=900&q=70",
    thali: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=70",
    bowl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=70",
    pancakes: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=900&q=70",
    salad: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=70",
    veg: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=900&q=70",
    eggs: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=900&q=70",
    spread: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=70",
    oats: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=900&q=70",
    chicken: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=70",
    rice: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=70",
    fruit: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=900&q=70"
  };

  E.goalMeta = {
    lose: { emoji: "🔥", label: "Lose weight" },
    health: { emoji: "🥗", label: "Eat healthier" },
    muscle: { emoji: "💪", label: "Build muscle" }
  };
  E.mealTypes = [
    { id: "breakfast", emoji: "🍳", label: "Breakfast" },
    { id: "lunch", emoji: "🍛", label: "Lunch" },
    { id: "dinner", emoji: "🍲", label: "Dinner" },
    { id: "snack", emoji: "🍎", label: "Snack" }
  ];
  E.cities = ["Bengaluru", "Mumbai", "Delhi", "Pune", "Hyderabad", "Chennai", "Jaipur", "Kochi", "Kolkata", "Ahmedabad"];
  E.months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  let seq = 1;
  E.uid = function (p) { seq += 1; return (p || "id") + seq.toString(36); };

  E.iso = function (d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  };
  E.parseIso = function (iso) {
    const parts = String(iso).split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0, 0);
  };
  E.addDays = function (n, from) {
    const d = from ? E.parseIso(from) : new Date();
    d.setDate(d.getDate() + n);
    return d;
  };
  E.todayIso = function () { return E.iso(new Date()); };
  E.num = function (n) { return Math.round(Number(n) || 0).toLocaleString("en-IN"); };
  E.first = function (name) { return String(name || "there").trim().split(" ")[0]; };
  E.initials = function (name) {
    const bits = String(name || "?").trim().split(/\s+/).slice(0, 2);
    return bits.map(function (b) { return b[0] || ""; }).join("").toUpperCase();
  };
  E.clock = function () {
    return new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  };
  E.greeting = function () {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    if (h < 21) return "Good evening";
    return "Good night";
  };
  E.mealTypeByTime = function () {
    const h = new Date().getHours();
    if (h < 11) return "breakfast";
    if (h < 16) return "lunch";
    if (h < 21) return "dinner";
    return "snack";
  };
  E.longDate = function (iso) {
    return E.parseIso(iso).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  };
  E.shortDate = function (iso) {
    return E.parseIso(iso).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  };
  E.niceDate = function (iso) {
    return E.parseIso(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };
  E.msgTime = function (ts) {
    return new Date(ts).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  };
  E.relTime = function (ts) {
    const d = Date.now() - ts;
    if (d < 60000) return "now";
    if (d < 3600000) return Math.floor(d / 60000) + "m";
    if (d < 86400000) return Math.floor(d / 3600000) + "h";
    return new Date(ts).toLocaleDateString("en-IN", { weekday: "short" });
  };
  E.dayLabel = function (ts) {
    const iso = E.iso(new Date(ts));
    if (iso === E.todayIso()) return "Today";
    if (iso === E.iso(E.addDays(-1))) return "Yesterday";
    return E.niceDate(iso);
  };
  E.age = function (year, month) {
    const now = new Date();
    let age = now.getFullYear() - year;
    if (now.getMonth() < month) age -= 1;
    return age;
  };
  E.cmToFt = function (cm) {
    const inches = Math.round(cm / 2.54);
    return { ft: Math.floor(inches / 12), inch: inches % 12 };
  };
  E.macroKcal = function (p, c, f) {
    return Math.round(p * 4 + c * 4 + f * 9);
  };

  function item(name, serving, kcal, p, c, f, qty) {
    return { id: E.uid("i"), name: name, serving: serving, kcal: kcal, p: p, c: c, f: f, qty: qty || 1 };
  }
  E.item = item;

  E.mealTotals = function (meal) {
    const t = { kcal: 0, p: 0, c: 0, f: 0 };
    (meal.items || []).forEach(function (it) {
      const q = it.qty || 1;
      t.kcal += it.kcal * q;
      t.p += it.p * q;
      t.c += it.c * q;
      t.f += it.f * q;
    });
    t.kcal = Math.round(t.kcal);
    t.p = Math.round(t.p);
    t.c = Math.round(t.c);
    t.f = Math.round(t.f);
    return t;
  };
  E.dayMeals = function (iso) {
    function mins(time) {
      const m = String(time || "").match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!m) return 0;
      let h = parseInt(m[1], 10) % 12;
      if (m[3].toUpperCase() === "PM") h += 12;
      return h * 60 + parseInt(m[2], 10);
    }
    return (E.state.meals || []).filter(function (m) { return m.date === iso; })
      .sort(function (a, b) { return mins(a.time) - mins(b.time); });
  };
  E.dayTotals = function (iso) {
    return E.dayMeals(iso).reduce(function (acc, m) {
      const t = E.mealTotals(m);
      acc.kcal += t.kcal; acc.p += t.p; acc.c += t.c; acc.f += t.f;
      return acc;
    }, { kcal: 0, p: 0, c: 0, f: 0 });
  };
  E.glassesOn = function (iso) {
    const rec = (E.state.waterLog || []).find(function (w) { return w.date === iso; });
    return rec ? rec.glasses : 0;
  };
  E.isPro = function () {
    const s = E.state.user.subscription.status;
    return s === "active" || s === "trial";
  };
  E.entryId = function (user) {
    if (!user) return "welcome";
    if (!user.isGuest && !user.isEmailVerified) return "verify";
    if (!user.onboarded) return "onboarding";
    return "home";
  };

  function blankPrefs() {
    return {
      coach: { daily: true, weekly: true, morning: false, time: "20:00" },
      water: { glassMl: 250, target: 8, reminders: true, reminderTime: "10:00" },
      streak: { mode: "meals", freeze: true, showChip: true },
      units: { weight: "kg", length: "cm", adaptive: true, weighIn: "morning" },
      photos: { weekly: true, time: "18:00" },
      reminders: { breakfast: true, lunch: true, dinner: false, bTime: "08:30", lTime: "13:00", dTime: "20:30" },
      privacy: { pausedUntil: null, discovery: true, sameGender: false, distance: "Any", cityVisibility: "full", autoDecline: "Off" }
    };
  }
  function blankUi() {
    return {
      email: "", password: "", showPassword: false, authError: "",
      otp: ["", "", "", "", "", ""], resendAt: 0, editingEmail: false, newEmail: "",
      busy: null, chatTab: "chats", chatQuery: "", discoverQuery: "",
      communityTab: "mine", communityQuery: "", diaryOffset: 0, progressWeek: 0,
      weightRange: "1M", weightDraft: 67, scanMode: "photo", torch: false,
      scanMealPreset: null, describeText: "", deleteAck: false, selectedPlan: "yearly",
      shareNote: "", shareChat: null, groupName: "", groupPicks: [], cityQuery: "",
      analyzing: false, analyzeTip: 0, commName: "", commAbout: "", commCity: "Bengaluru",
      editName: "", editBio: "", socialTags: [], measureWaist: "", measureHips: "", measureChest: ""
    };
  }
  E.blankOnboarding = function (pre) {
    pre = pre || {};
    return {
      mode: pre.mode || "create",
      i: 0,
      goal: pre.goal || "",
      name: pre.name || "",
      gender: pre.gender || "",
      month: pre.month != null ? pre.month : 5,
      year: pre.year || 1998,
      heightCm: pre.heightCm || 165,
      heightUnit: "cm",
      weightKg: pre.weightKg || 68,
      weightUnit: "kg",
      targetKg: pre.targetKg || 62,
      pace: pre.pace || "",
      activity: pre.activity || "",
      exercise: pre.exercise || "",
      diet: pre.diet || "",
      training: (pre.training || []).slice(),
      discovery: !!pre.discovery
    };
  };
  E.onboardingSteps = function (ob) {
    const s = ["goal", "name", "gender", "birth", "height", "weight"];
    if (ob.goal !== "health") s.push("target", "pace");
    s.push("activity", "exercise", "diet", "training", "discovery", "calculating", "reveal");
    return s;
  };
  E.stepValid = function (ob) {
    const steps = E.onboardingSteps(ob);
    const step = steps[Math.min(ob.i, steps.length - 1)];
    if (step === "goal") return !!ob.goal;
    if (step === "name") return String(ob.name || "").trim().length >= 2;
    if (step === "gender") return !!ob.gender;
    if (step === "pace") return !!ob.pace;
    if (step === "activity") return !!ob.activity;
    if (step === "exercise") return !!ob.exercise;
    if (step === "diet") return !!ob.diet;
    if (step === "training") return ob.training.length >= 1 && ob.training.length <= 3;
    return true;
  };
  E.calcPlan = function (ob) {
    let kcal = ob.goal === "muscle" ? 2400 : ob.goal === "lose" ? 1700 : 2000;
    if (ob.gender === "male") kcal += 150;
    if (ob.gender === "female") kcal -= 50;
    const act = { desk: 0, light: 80, feet: 160, job: 280 };
    const ex = { none: 0, "1-2": 40, "3-4": 100, "5-6": 140, daily: 180 };
    kcal += act[ob.activity] || 0;
    kcal += ex[ob.exercise] || 0;
    if (ob.pace === "0.25") kcal += ob.goal === "muscle" ? 40 : 80;
    if (ob.pace === "0.75") kcal += ob.goal === "muscle" ? 180 : -80;
    if (ob.pace === "1") kcal += ob.goal === "muscle" ? 240 : -140;
    kcal = Math.max(1400, Math.round(kcal / 10) * 10);
    const p = Math.round((kcal * 0.3) / 4);
    const f = Math.round((kcal * 0.28) / 9);
    const c = Math.max(0, Math.round((kcal - p * 4 - f * 9) / 4));
    return { kcal: kcal, p: p, c: c, f: f, manual: false };
  };

  function meal(o) {
    return Object.assign({
      id: E.uid("m"), emoji: "🍽️", image: "", items: [], mealType: "lunch",
      date: E.todayIso(), time: "1:00 PM"
    }, o);
  }

  function priyaMeals() {
    const t = E.todayIso();
    const d1 = E.iso(E.addDays(-1));
    const d2 = E.iso(E.addDays(-2));
    const d4 = E.iso(E.addDays(-4));
    const d5 = E.iso(E.addDays(-5));
    return [
      meal({ name: "Masala dosa & sambar", emoji: "🥞", image: E.img.dosa, mealType: "breakfast", date: t, time: "08:10 AM", items: [
        item("Masala dosa", "1 dosa", 280, 6, 42, 10),
        item("Sambar", "1 bowl", 100, 5, 12, 3)
      ]}),
      meal({ name: "Dal, roti & bhindi", emoji: "🍛", image: E.img.thali, mealType: "lunch", date: t, time: "01:20 PM", items: [
        item("Roti", "1 roti", 120, 4, 22, 2, 2),
        item("Dal tadka", "1 bowl", 220, 14, 28, 6),
        item("Bhindi sabzi", "1 katori", 160, 4, 12, 10),
        item("Cucumber raita", "1 bowl", 100, 5, 8, 5)
      ]}),
      meal({ name: "Banana, dates & chaas", emoji: "🍌", image: E.img.fruit, mealType: "snack", date: t, time: "04:40 PM", items: [
        item("Banana", "1 medium", 90, 1, 23, 0),
        item("Peanut butter", "1 tbsp", 95, 4, 3, 8),
        item("Buttermilk", "1 glass", 80, 4, 5, 4),
        item("Dates", "2 pieces", 85, 1, 22, 0)
      ]}),
      meal({ name: "Idli & sambar", emoji: "⚪", image: E.img.dosa, mealType: "breakfast", date: d1, time: "08:00 AM", items: [
        item("Idli", "1 idli", 70, 2, 14, 0, 3),
        item("Sambar", "1 bowl", 110, 5, 14, 3)
      ]}),
      meal({ name: "Curd rice & pickle", emoji: "🍚", image: E.img.rice, mealType: "lunch", date: d1, time: "01:10 PM", items: [
        item("Curd rice", "1 plate", 420, 12, 68, 10),
        item("Beans poriyal", "1 katori", 140, 5, 12, 7)
      ]}),
      meal({ name: "Poha", emoji: "🥣", image: E.img.veg, mealType: "breakfast", date: d2, time: "09:00 AM", items: [
        item("Kanda poha", "1 plate", 320, 7, 52, 9)
      ]}),
      meal({ name: "Biryani & raita", emoji: "🍲", image: E.img.spread, mealType: "lunch", date: d2, time: "02:00 PM", items: [
        item("Veg biryani", "1 plate", 640, 16, 92, 20),
        item("Boondi raita", "1 bowl", 180, 6, 16, 10)
      ]}),
      meal({ name: "Samosa & chai", emoji: "🥟", image: E.img.pancakes, mealType: "snack", date: d2, time: "05:30 PM", items: [
        item("Samosa", "1 piece", 260, 5, 28, 14),
        item("Masala chai", "1 cup", 90, 2, 12, 3)
      ]}),
      meal({ name: "Oats & fruit", emoji: "🥣", image: E.img.oats, mealType: "breakfast", date: d4, time: "07:50 AM", items: [
        item("Oats with milk", "1 bowl", 280, 12, 40, 7)
      ]}),
      meal({ name: "Rajma chawal", emoji: "🍚", image: E.img.rice, mealType: "lunch", date: d4, time: "01:00 PM", items: [
        item("Rajma", "1 bowl", 240, 14, 36, 5),
        item("Rice", "1 cup", 200, 4, 44, 1)
      ]}),
      meal({ name: "Upma", emoji: "🍳", image: E.img.veg, mealType: "breakfast", date: d5, time: "08:20 AM", items: [
        item("Vegetable upma", "1 plate", 310, 8, 48, 8)
      ]}),
      meal({ name: "Grilled paneer bowl", emoji: "🥗", image: E.img.bowl, mealType: "dinner", date: d5, time: "08:10 PM", items: [
        item("Paneer", "120 g", 320, 18, 6, 24),
        item("Salad", "1 bowl", 90, 3, 10, 4)
      ]})
    ];
  }

  function savedMeals() {
    return [
      meal({ name: "Masala dosa", emoji: "🥞", image: E.img.dosa, items: [item("Masala dosa", "1", 280, 6, 42, 10), item("Sambar", "1 bowl", 100, 5, 12, 3)] }),
      meal({ name: "Dal roti thali", emoji: "🍛", image: E.img.thali, items: [item("Roti", "1", 120, 4, 22, 2, 2), item("Dal", "1 bowl", 200, 12, 26, 6), item("Sabzi", "1 katori", 140, 4, 12, 8)] }),
      meal({ name: "Yogurt & fruit", emoji: "🥣", image: E.img.bowl, items: [item("Curd", "200 g", 140, 8, 10, 6), item("Fruit", "1 cup", 80, 1, 18, 0)] }),
      meal({ name: "Grilled chicken rice", emoji: "🍗", image: E.img.chicken, items: [item("Chicken", "150 g", 250, 38, 0, 8), item("Rice", "1 cup", 200, 4, 44, 1)] }),
      meal({ name: "Banana & peanut", emoji: "🍌", image: E.img.fruit, items: [item("Banana", "1", 90, 1, 23, 0), item("Peanuts", "20 g", 120, 5, 4, 10)] })
    ];
  }

  function baseChats(now) {
    return [
      {
        id: "c1", type: "dm", name: "Ananya Iyer", color: "#FFD8CC", initials: "AI", online: true,
        preview: "Did you log lunch? I'm at 1,200 so far.", time: now - 2 * 60000, unread: 2,
        messages: [
          { id: "a1", from: "them", text: "Morning — protein yesterday was close, right?", at: now - 5 * 3600000, status: "read" },
          { id: "a2", from: "me", text: "Almost. Fell short after dinner.", at: now - 4 * 3600000, status: "read" },
          { id: "a3", from: "them", text: "Did you log lunch? I'm at 1,200 so far.", at: now - 2 * 60000, status: "read" }
        ]
      },
      {
        id: "c2", type: "group", name: "Gym buddies", color: "#D9F2FF", initials: "GB",
        members: ["Rahul", "Meera", "You"],
        preview: "Rahul: Leg day tomorrow?", time: now - 3600000, unread: 0,
        messages: [
          { id: "g1", from: "them", name: "Meera", text: "Who's training Saturday morning?", at: now - 26 * 3600000, status: "read" },
          { id: "g2", from: "me", text: "I can do 8am if we keep it to an hour.", at: now - 20 * 3600000, status: "read" },
          { id: "g3", from: "them", name: "Rahul", text: "Leg day tomorrow?", at: now - 3600000, status: "read" }
        ]
      },
      {
        id: "c3", type: "dm", name: "Meera Krishnan", color: "#E4F7C8", initials: "MK", online: false,
        preview: "That dosa looked good.", time: now - 26 * 3600000, unread: 0,
        messages: [
          { id: "m1", from: "me", text: "Logged a dosa this morning. Estimates felt fair.", at: now - 30 * 3600000, status: "read" },
          { id: "m2", from: "them", text: "That dosa looked good.", at: now - 26 * 3600000, status: "read" }
        ]
      },
      {
        id: "c4", type: "dm", name: "Neel Kapoor", color: "#EEE9E1", initials: "NK", pending: "outgoing",
        preview: "Request sent", time: now - 3 * 3600000, unread: 0,
        messages: [
          { id: "n1", from: "me", text: "Hey — want to keep each other honest on weekdays?", at: now - 3 * 3600000, status: "sent" }
        ]
      }
    ];
  }

  function discoverPeople() {
    return [
      { id: "u1", name: "Neha Rao", color: "#FDE7C7", goal: "Lose weight", distance: "2.4 km", tags: ["Yoga", "Running"], bio: "Training for a 10K and trying to keep dinners simple.", city: "Bengaluru" },
      { id: "u2", name: "Kabir Menon", color: "#D7E6FF", goal: "Build muscle", distance: "5 km", tags: ["Gym", "HIIT"], bio: "Early sessions, high protein, no drama.", city: "Bengaluru" },
      { id: "u3", name: "Sara Qureshi", color: "#FFE0F0", goal: "Eat healthier", distance: "8 km", tags: ["Walking", "Yoga"], bio: "Looking for weekday accountability, not a dating thing.", city: "Bengaluru" },
      { id: "u4", name: "Arjun Desai", color: "#E7F8D8", goal: "Lose weight", distance: "1.2 km", tags: ["Running", "Cycling"], bio: "Cubbon Park loops before work.", city: "Bengaluru" },
      { id: "u5", name: "Ishita Jain", color: "#FFF4CC", goal: "Eat healthier", distance: "12 km", tags: ["Yoga"], bio: "Jain kitchen at home. Happy to swap lunch ideas.", city: "Bengaluru" }
    ];
  }

  function communities() {
    return {
      mine: [
        { id: "cm1", name: "Bengaluru Run Club", city: "Bengaluru", members: 1284, admin: true, hue: 80, description: "Easy weekday runs and honest fuel talk.", rules: "Be kind. No body shaming. No dating pitches.", posts: [
          { id: "p1", author: "Neha", text: "Cubbon loop done. Logged a banana after — 90 kcal and worth it.", time: "2h" },
          { id: "p2", author: "Arjun", text: "Anyone else under-eating protein on long run days?", time: "5h" }
        ]},
        { id: "cm2", name: "South Indian Meal Prep", city: "Bengaluru", members: 642, admin: false, hue: 28, description: "Dosa, dal, and batch-cooking Sundays.", rules: "Recipes welcome. Estimates stay estimates.", posts: [
          { id: "p3", author: "Meera", text: "Sambar batch for four lunches. About 110 kcal a bowl.", time: "1d" }
        ]}
      ],
      discover: [
        { id: "cd1", name: "Delhi Veggie Club", city: "Delhi", members: 980, hue: 120, description: "Vegetarian plates from home kitchens.", posts: [{ id: "p4", author: "Aman", text: "Demo post — rajma night.", time: "3h" }] },
        { id: "cd2", name: "Mumbai Fitness", city: "Mumbai", members: 2104, hue: 200, description: "Marine Drive walks and gym check-ins.", posts: [{ id: "p5", author: "Ria", text: "Demo post — sunrise walk logged.", time: "6h" }] },
        { id: "cd3", name: "Pune Jain Eats", city: "Pune", members: 310, hue: 45, description: "Jain-friendly meal ideas.", posts: [] },
        { id: "cd4", name: "Hyderabad Protein", city: "Hyderabad", members: 870, hue: 12, description: "High-protein home food, biryani included.", posts: [] },
        { id: "cd5", name: "Chennai Home Cooks", city: "Chennai", members: 540, hue: 160, description: "Tiffin boxes and honest portions.", posts: [] }
      ]
    };
  }

  function weightSeries(start, endKg, days) {
    const out = [];
    for (let i = days; i >= 0; i -= 4) {
      const t = (days - i) / days;
      const kg = Math.round((start - t * (start - endKg) + Math.sin(i) * 0.12) * 10) / 10;
      out.push({ date: E.iso(E.addDays(-i)), kg: kg });
    }
    return out;
  }

  function shell() {
    const now = Date.now();
    return {
      version: 1,
      persona: "priya",
      nav: { tab: "home", stack: [{ id: "home", transition: "fade" }] },
      modal: null,
      toast: null,
      confirm: null,
      sheet: null,
      flags: { scanLimit: false, cameraDenied: false, forceError: false, forceLoading: false, restoreFlip: false },
      ui: blankUi(),
      onboarding: E.blankOnboarding(),
      scan: null,
      prefs: blankPrefs(),
      meals: [],
      saved: savedMeals(),
      waterLog: [],
      weightLog: weightSeries(68.4, 66.9, 56),
      photos: [
        { id: "ph1", date: E.iso(E.addDays(-21)), caption: "Week of check-in", hue: 70 },
        { id: "ph2", date: E.iso(E.addDays(-14)), caption: "Same light, same corner", hue: 40 },
        { id: "ph3", date: E.iso(E.addDays(-7)), caption: "After a steadier week", hue: 95 }
      ],
      measurements: [
        { id: "ms1", date: E.iso(E.addDays(-28)), waist: 84, hips: 100, chest: 92 },
        { id: "ms2", date: E.iso(E.addDays(-7)), waist: 82, hips: 98, chest: 90 }
      ],
      chats: baseChats(now),
      requests: [{
        id: "r1", name: "Vikram Shah", color: "#FFE7D6", initials: "VS", goal: "Run a faster 10K",
        preview: "Training for a 10K too — want to stay accountable?", at: now - 8 * 3600000
      }],
      discover: discoverPeople(),
      communities: communities(),
      blocked: [{ id: "b1", name: "Rohan Gupta", color: "#E5E5E0", initials: "RG" }],
      reports: [{ id: "rp1", name: "Unknown profile", reason: "Spam pitch in discover", status: "Pending", date: E.iso(E.addDays(-3)) }],
      goals: [],
      coachHistory: [
        { date: E.todayIso(), title: "Protein is the missing piece", body: "A shortfall is information, not a failure.", tip: "Add curd or roasted chana with dinner." },
        { date: E.iso(E.addDays(-1)), title: "Water before the 4pm slump", body: "Two glasses this afternoon kept the snack smaller.", tip: "Pair chai with a glass of water." },
        { date: E.iso(E.addDays(-2)), title: "Yesterday ran hot", body: "One heavier meal doesn't erase the week.", tip: "Aim for a normal lunch today, not a tiny one." }
      ],
      typing: null,
      payments: []
    };
  }

  function userBase(extra) {
    return Object.assign({
      name: "Priya Sharma",
      email: "priya@eat.ai",
      isGuest: false,
      isEmailVerified: true,
      onboarded: true,
      color: "#C6F135",
      photoSet: false,
      goal: "lose",
      gender: "female",
      birthMonth: 3,
      birthYear: 1996,
      heightCm: 162,
      weightKg: 66.9,
      targetKg: 62,
      pace: "0.5",
      activity: "light",
      exercise: "3-4",
      diet: "veg",
      training: ["Yoga", "Walking"],
      discovery: true,
      city: "Bengaluru",
      bio: "Weekday lunches from home. Looking for training partners, not dates.",
      plan: { kcal: 1800, p: 120, c: 200, f: 60, manual: false },
      subscription: { status: "free", plan: null, renewsAt: null, endsAt: null, trialUsed: false, provider: "App Store" },
      ai: false,
      chatReady: true,
      ageBlocked: false,
      deletion: null,
      streak: { current: 5, best: 12, freezes: 2 }
    }, extra || {});
  }

  E.createState = function (persona) {
    seq = 40;
    const s = shell();
    s.persona = persona || "priya";
    const t = E.todayIso();
    for (let i = 13; i >= 0; i--) {
      s.waterLog.push({ date: E.iso(E.addDays(-i)), glasses: i === 0 ? 5 : (i % 5) + 3 });
    }
    if (persona === "rahul") {
      s.user = userBase({
        name: "Rahul Mehta", email: "rahul@eat.ai", color: "#BFD4FF", goal: "muscle", gender: "male",
        birthYear: 1994, heightCm: 178, weightKg: 76.4, targetKg: 80, diet: "nonveg",
        training: ["Gym", "HIIT"], plan: { kcal: 2600, p: 170, c: 280, f: 75, manual: false },
        subscription: { status: "active", plan: "yearly", renewsAt: E.iso(E.addDays(286)), endsAt: null, trialUsed: true, provider: "Play Store" },
        ai: true, streak: { current: 18, best: 21, freezes: 1 }, bio: "Push days and big lunches. Accountability only."
      });
      s.meals = [
        meal({ name: "Egg bhurji & toast", emoji: "🍳", image: E.img.eggs, mealType: "breakfast", date: t, time: "07:30 AM", items: [item("Eggs", "3 eggs", 240, 18, 2, 16), item("Toast", "2 slices", 180, 6, 30, 3)] }),
        meal({ name: "Chicken rice bowl", emoji: "🍗", image: E.img.chicken, mealType: "lunch", date: t, time: "01:00 PM", items: [item("Chicken", "180 g", 300, 46, 0, 10), item("Rice", "1.5 cups", 300, 6, 66, 2), item("Salad", "1 bowl", 70, 2, 8, 3)] }),
        meal({ name: "Greek yogurt", emoji: "🥣", image: E.img.bowl, mealType: "snack", date: t, time: "05:00 PM", items: [item("Yogurt", "200 g", 180, 16, 8, 8)] })
      ];
      s.weightLog = weightSeries(74.2, 76.4, 56);
      s.payments = [
        { date: E.iso(E.addDays(-340)), amount: 1999, status: "Paid", plan: "Yearly" },
        { date: E.iso(E.addDays(-20)), amount: 1999, status: "Paid", plan: "Yearly" },
        { date: E.iso(E.addDays(-2)), amount: 1999, status: "Failed", plan: "Yearly" }
      ];
      s.goals = [
        { id: "g1", type: "lose", kcal: 2200, p: 140, c: 220, f: 70, from: "2025-11-01", to: "2026-03-01", manual: false },
        { id: "g2", type: "muscle", kcal: 2600, p: 170, c: 280, f: 75, from: "2026-03-02", to: null, manual: false, active: true }
      ];
    } else if (persona === "guest") {
      s.user = userBase({
        name: "Guest", email: "", isGuest: true, isEmailVerified: false, color: "#EEF9CF",
        chatReady: false, discovery: false, bio: "", city: "", plan: { kcal: 1800, p: 110, c: 190, f: 55, manual: false },
        streak: { current: 2, best: 2, freezes: 0 }
      });
      s.meals = priyaMeals().slice(0, 2);
      s.goals = [{ id: "g1", type: "lose", kcal: 1800, p: 110, c: 190, f: 55, from: t, to: null, manual: false, active: true }];
    } else if (persona === "sam") {
      s.user = userBase({ name: "Sam Iqbal", email: "sam@demo.app", isEmailVerified: false, color: "#FFE08A" });
      s.meals = priyaMeals();
      s.nav = { tab: "home", stack: [{ id: "verify", transition: "fade" }] };
      s.goals = [{ id: "g1", type: "lose", kcal: 1800, p: 120, c: 200, f: 60, from: "2026-08-01", to: null, manual: false, active: true }];
    } else if (persona === "aisha") {
      s.user = userBase({
        name: "Aisha Khan", email: "aisha@eat.ai", chatReady: false, bio: "", photoSet: false,
        training: [], city: "", discovery: false, color: "#FFD0E0"
      });
      s.meals = priyaMeals().slice(0, 3);
      s.goals = [{ id: "g1", type: "lose", kcal: 1800, p: 120, c: 200, f: 60, from: "2026-09-01", to: null, manual: false, active: true }];
    } else if (persona === "teen") {
      s.user = userBase({
        name: "Aarav Jain", email: "aarav@eat.ai", birthYear: 2011, birthMonth: 0, ageBlocked: true,
        chatReady: false, discovery: false, color: "#D9F2FF"
      });
      s.prefs.privacy.discovery = false;
      s.meals = priyaMeals().slice(0, 2);
      s.goals = [{ id: "g1", type: "health", kcal: 2000, p: 100, c: 240, f: 60, from: t, to: null, manual: false, active: true }];
      s.user.goal = "health";
      s.user.plan = { kcal: 2000, p: 100, c: 240, f: 60, manual: false };
    } else if (persona === "fresh") {
      s.user = userBase({
        name: "", email: "new@eat.ai", onboarded: false, chatReady: false, city: "", bio: "",
        plan: { kcal: 2100, p: 140, c: 220, f: 70, manual: false }, streak: { current: 0, best: 0, freezes: 2 }
      });
      s.meals = [];
      s.weightLog = [];
      s.onboarding = E.blankOnboarding({ mode: "create", name: "" });
      s.nav = { tab: "home", stack: [{ id: "onboarding", transition: "fade" }] };
    } else {
      s.user = userBase();
      s.meals = priyaMeals();
      s.goals = [
        { id: "g1", type: "health", kcal: 2000, p: 110, c: 230, f: 65, from: "2026-05-02", to: "2026-07-01", manual: false },
        { id: "g2", type: "lose", kcal: 1900, p: 120, c: 210, f: 62, from: "2026-07-02", to: "2026-09-01", manual: false },
        { id: "g3", type: "lose", kcal: 1800, p: 120, c: 200, f: 60, from: "2026-09-02", to: null, manual: false, active: true }
      ];
    }
    if (!s.user) s.user = userBase();
    s.dayStatus = {};
    s.dayStatus[E.iso(E.addDays(-1))] = "done";
    s.dayStatus[E.iso(E.addDays(-2))] = "warning";
    s.dayStatus[E.iso(E.addDays(-3))] = "missed";
    s.dayStatus[E.iso(E.addDays(-4))] = "done";
    s.dayStatus[E.iso(E.addDays(-5))] = "done";
    s.dayStatus[E.iso(E.addDays(-6))] = "done";
    s.ui.weightDraft = s.user.weightKg;
    s.ui.editName = s.user.name;
    s.ui.editBio = s.user.bio;
    s.ui.socialTags = (s.user.training || []).slice();
    return s;
  };

  E.load = function () {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || data.version !== 1 || !data.user) return null;
      data.modal = null; data.toast = null; data.confirm = null; data.sheet = null;
      if (!data.ui) data.ui = blankUi();
      data.ui.busy = null; data.ui.analyzing = false; data.typing = null;
      return data;
    } catch (err) { return null; }
  };
  E.save = function () {
    try {
      const copy = JSON.parse(JSON.stringify(E.state));
      copy.modal = null; copy.toast = null; copy.confirm = null; copy.sheet = null; copy.typing = null;
      if (copy.ui) { copy.ui.busy = null; copy.ui.analyzing = false; }
      localStorage.setItem(KEY, JSON.stringify(copy));
    } catch (err) { /* demo storage can fail quietly */ }
  };
  E.persist = function () { E.save(); };

  E.passwordRules = function (pw) {
    pw = pw || "";
    return {
      len: pw.length >= 6,
      letter: /[A-Za-z]/.test(pw),
      number: /\d/.test(pw),
      symbol: /[^A-Za-z0-9]/.test(pw)
    };
  };
  E.passwordOk = function (pw) {
    const r = E.passwordRules(pw);
    return r.len && r.letter && r.number && r.symbol;
  };
  E.validEmail = function (email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
  };

  E.mealFromText = function (text) {
    const t = String(text || "").toLowerCase();
    let name = text.trim().slice(0, 48);
    let image = E.img.thali;
    let emoji = "🍛";
    let items;
    if (t.includes("dosa")) {
      name = "Masala dosa & sambar"; image = E.img.dosa; emoji = "🥞";
      items = [item("Masala dosa", "1", 280, 6, 42, 10), item("Sambar", "1 bowl", 120, 5, 14, 3)];
    } else if (t.includes("biryani")) {
      name = "Chicken biryani"; image = E.img.spread; emoji = "🍲";
      items = [item("Biryani", "1 plate", 620, 28, 78, 18), item("Raita", "1 bowl", 90, 4, 6, 5)];
    } else if (t.includes("idli")) {
      name = "Idli & sambar"; image = E.img.dosa; emoji = "⚪";
      items = [item("Idli", "1", 70, 2, 14, 0, 3), item("Sambar", "1 bowl", 110, 5, 14, 3)];
    } else if (t.includes("poha")) {
      name = "Kanda poha"; image = E.img.veg; emoji = "🥣";
      items = [item("Poha", "1 plate", 320, 7, 52, 9), item("Peanuts", "1 spoon", 50, 2, 2, 4)];
    } else if (t.includes("paneer")) {
      name = "Paneer tikka salad"; image = E.img.bowl; emoji = "🥗";
      items = [item("Paneer tikka", "8 pieces", 380, 24, 10, 26), item("Salad", "1 bowl", 60, 2, 8, 2)];
    } else if (t.includes("oats")) {
      name = "Demo Oats"; image = E.img.oats; emoji = "🥣";
      items = [item("Demo Oats", "40 g pack", 180, 6, 28, 4), item("Milk", "200 ml", 100, 6, 8, 4)];
    } else {
      items = [item("Roti", "1 roti", 120, 4, 22, 2, 2), item("Dal", "1 bowl", 180, 12, 24, 5), item("Sabzi", "1 katori", 140, 3, 12, 8)];
      if (!name) name = "Roti, dal & sabzi";
    }
    return { source: "describe", name: name, image: image, emoji: emoji, mealType: E.state.ui.scanMealPreset || E.mealTypeByTime(), saveLater: false, note: text, items: items };
  };
  E.scanPreset = function (kind, image) {
    if (kind === "barcode") {
      return {
        source: "barcode", name: "Demo Oats", image: image || E.img.oats, emoji: "📦",
        mealType: E.state.ui.scanMealPreset || E.mealTypeByTime(), saveLater: false,
        items: [item("Demo Oats", "1 pack · 40 g", 180, 6, 28, 4), item("Milk", "200 ml", 100, 6, 8, 4)]
      };
    }
    return {
      source: "photo", name: "Roti, dal & sabzi", image: image || E.img.thali, emoji: "🍛",
      mealType: E.state.ui.scanMealPreset || E.mealTypeByTime(), saveLater: false,
      items: [item("Roti", "1 roti", 110, 4, 20, 2, 2), item("Dal", "1 bowl", 180, 12, 24, 5), item("Mixed sabzi", "1 katori", 140, 3, 12, 8)]
    };
  };

  E.liveCoach = function () {
    const plan = E.state.user.plan;
    const eaten = E.dayTotals(E.todayIso());
    const gap = plan.p - eaten.p;
    if (gap > 8) {
      return {
        title: "Protein is the missing piece",
        body: "You're " + gap + "g short of today's protein. A bowl of curd or a handful of roasted chana after dinner closes the gap — no lecture attached.",
        tip: "Add 150g curd with dinner — about 8g protein."
      };
    }
    return {
      title: "Steady day",
      body: "Calories and protein are in a kind range. Keep dinner normal, not tiny.",
      tip: "A glass of water before dinner is enough."
    };
  };

  E.state = E.load() || E.createState("priya");
})();
