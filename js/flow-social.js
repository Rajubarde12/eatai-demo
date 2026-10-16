(function () {
  const E = window.EatAI;

  E.pendingChatFields = function (u) {
    const fields = [];
    if (String(u.name || "").trim().length < 2) fields.push("name");
    if (!u.photoSet) fields.push("photo");
    if (!(u.birthYear && E.age(u.birthYear, u.birthMonth) >= 18)) fields.push("birth");
    if (!(u.training || []).length) fields.push("tags");
    if (E.age(u.birthYear, u.birthMonth) >= 18 && !u.discovery) fields.push("discovery");
    if (String(u.city || "").trim().length < 2) fields.push("city");
    if (String(u.bio || "").trim().length < 10 && !u.bioSkipped) fields.push("bio");
    return fields;
  };

  E.screens.messages = function () {
    const u = E.state.user;
    if (u.isGuest) {
      return E.page({ tab: true, body: E.empty({ emoji: "💬", title: "Add your email", sub: "We'll send a code. Your meals stay, and then chat opens.", button: E.btn("Email me a code", { attrs: 'data-action="ask-email" data-feature="chat" data-testid="chat-claim-email"' }) }) });
    }
    if (u.ageBlocked || E.age(u.birthYear, u.birthMonth) < 18) {
      return E.page({ tab: true, body: E.empty({ emoji: "🌱", title: "Chat opens at 18", sub: "You can still track meals, water, and your plan. Discovery stays off — this isn't a dead end.", button: E.btn("Back to Home", { attrs: 'data-action="tab" data-tab="home"' }) }) });
    }
    if (!u.chatReady) return chatSetup();
    const gate = E.gate();
    if (gate) return E.page({ tab: true, body: '<div class="hero">Messages</div>' + gate });
    const tab = E.state.ui.chatTab || "chats";
    const q = (E.state.ui.chatQuery || "").toLowerCase();
    const reqN = (E.state.requests || []).length;
    const topActions = '<div class="between mt8"><div class="hero">Messages</div><div class="row gap8">' +
      E.iconBtn("globe", 'data-action="go" data-screen="communities" aria-label="Communities"', "flat") +
      E.iconBtn("users", 'data-action="open-modal" data-modal="new-group" aria-label="New group"', "flat") + "</div></div>";
    let inner = "";
    if (tab === "chats") {
      let chats = E.state.chats || [];
      if (q) chats = chats.filter(function (c) { return (c.name + c.preview).toLowerCase().indexOf(q) >= 0; });
      const banner = reqN ? '<button type="button" class="banner mt12" data-action="chat-tab" data-value="requests"><span>✉️</span><span class="grow"><b>' + reqN + ' chat request' + (reqN > 1 ? "s" : "") + '</b><div class="caption">Accept to start, or decline quietly.</div></span></button>' : "";
      const search = (E.state.chats || []).length >= 4 ? '<div class="mt12">' + E.field({ id: "chat-q", model: "chat-q", placeholder: "Search chats", value: E.state.ui.chatQuery, icon: "search" }) + "</div>" : "";
      const rows = chats.map(function (c) {
        return '<button type="button" class="chat-row" data-action="open-thread" data-id="' + c.id + '">' +
          E.avatar({ name: c.name, initials: c.initials, color: c.color, size: 48 }) +
          '<span class="grow"><span class="' + (c.unread ? "unread-name" : "heading") + '" style="font-size:15px">' + E.esc(c.name) + '</span><span class="caption" style="display:block">' + E.esc(c.preview) + "</span></span>" +
          '<span class="col" style="align-items:flex-end"><span class="caption">' + E.relTime(c.time) + "</span>" +
          (c.unread ? '<em class="badge" style="position:static;margin-top:6px">' + c.unread + "</em>" : c.pending === "outgoing" ? '<span class="caption">⏳</span>' : c.blocked ? '<span class="caption">🚫</span>' : '<span class="ticks">' + E.icon("check-check") + "</span>") +
          "</span></button>";
      }).join("");
      inner = search + banner + (rows || E.empty({ emoji: "💬", title: "No chats yet", sub: "Find a training partner in Discover.", button: E.btn("Discover people", { size: "md", attrs: 'data-action="chat-tab" data-value="discover"' }) }));
    } else if (tab === "requests") {
      inner = (E.state.requests || []).map(function (r) {
        return '<div class="card mt12"><div class="row gap12">' + E.avatar({ name: r.name, color: r.color, initials: r.initials, size: 48 }) +
          '<div class="grow"><div class="heading" style="font-size:16px">' + E.esc(r.name) + '</div><div class="caption">' + E.esc(r.goal) + "</div></div></div>" +
          '<p class="body mt12">' + E.esc(r.preview) + '</p><div class="grid2 mt12">' +
          E.btn("Decline", { variant: "secondary", size: "md", attrs: 'data-action="decline-req" data-id="' + r.id + '"' }) +
          E.btn("Accept", { size: "md", attrs: 'data-action="accept-req" data-id="' + r.id + '"' }) + "</div></div>";
      }).join("") || E.empty({ emoji: "👍", title: "No requests", sub: "When someone says hi, it lands here." });
    } else if (!E.isPro()) {
      inner = E.empty({ emoji: "🔒", title: "Discover is part of Pro", sub: "Find a training partner after you unlock Pro. Chats you already have stay open.", button: E.btn("See Pro", { attrs: 'data-action="gate-discover" data-testid="discover-pro"' }) });
    } else {
      const dq = (E.state.ui.discoverQuery || "").toLowerCase();
      let people = E.state.discover || [];
      if (dq) people = people.filter(function (p) { return (p.name + p.city + p.goal).toLowerCase().indexOf(dq) >= 0; });
      inner = '<div class="mt12">' + E.field({ id: "disc-q", model: "disc-q", placeholder: "Search people", value: E.state.ui.discoverQuery, icon: "search" }) + "</div>" +
        (people.map(function (p) {
          return '<button type="button" class="card mt12" style="width:100%;text-align:left;border:0;color:inherit" data-action="open-user" data-id="' + p.id + '"><div class="row gap12">' +
            E.avatar({ name: p.name, color: p.color, size: 52 }) +
            '<span class="grow"><span class="heading" style="font-size:16px">' + E.esc(p.name) + '</span><span class="caption" style="display:block">' + E.esc(p.goal) + " · " + E.esc(p.distance) + "</span></span></div>" +
            '<div class="hscroll mt8">' + p.tags.map(function (t) { return '<span class="chip">' + E.esc(t) + "</span>"; }).join("") + "</div></button>" +
            '<div style="margin-top:-8px;margin-bottom:8px">' + E.btn("Say hi", { size: "sm", attrs: 'data-action="say-hi" data-id="' + p.id + '"' }) + "</div>";
        }).join("") || E.empty({ emoji: "🔍", title: "No one by that name", sub: "Try a city or a first name." }));
    }
    const body = topActions + '<div class="mt12">' + E.segmented([
      { id: "chats", label: "Chats" },
      { id: "requests", label: "Requests", badge: reqN || "" },
      { id: "discover", label: "Discover" }
    ], tab, "chat-tab") + "</div>" + inner;
    return E.page({ tab: true, body: body });
  };

  function chatSetup() {
    const u = E.state.user;
    const fields = E.pendingChatFields(u);
    if (!fields.length) {
      u.chatReady = true;
      return E.screens.messages();
    }
    const i = Math.min(E.state.ui.chatStep || 0, fields.length - 1);
    const field = fields[i];
    const copy = {
      name: ["What should we call you?", "This name shows when people message you.", "Save name"],
      photo: ["Add a profile photo", "A clear photo builds trust. This demo uses a stand-in colour photo.", "Save photo"],
      birth: ["Confirm your age", "Discovery and Chat stay locked until you're 18.", "Save birthday"],
      tags: ["How do you train?", "Pick 1–3 tags so we can match you with the right people.", "Save tags"],
      discovery: ["Turn on Discover", "Chat unlocks with Discover so nearby accountability partners can find you — never a dating feed.", "Enable Discover"],
      city: ["Add your city", "We use your city to show people nearby.", "Save city"],
      bio: ["Write a short bio", "One line about how you train or eat — or skip for now.", "Save bio"]
    }[field];
    const trains = ["Gym", "Running", "Yoga", "Cycling", "Walking", "HIIT"];
    const cities = E.cities.filter(function (c) { return c.toLowerCase().indexOf((E.state.ui.cityQuery || u.city || "").toLowerCase()) >= 0; }).slice(0, 5);
    let form = "";
    if (field === "name") form = E.field({ id: "chat-name", model: "edit-name", value: E.state.ui.editName || u.name, placeholder: "Priya" });
    if (field === "photo") form = E.btn(u.photoSet ? "Photo added" : "Add a demo photo", { variant: "secondary", attrs: 'data-action="demo-photo"' });
    if (field === "birth") form = '<div class="card"><div class="heading">' + E.months[u.birthMonth || 0] + " " + u.birthYear + '</div><p class="caption mt8">You are ' + E.age(u.birthYear, u.birthMonth) + ". Chat opens at 18.</p></div>";
    if (field === "tags") form = E.chips(trains, u.training || [], "social-tag");
    if (field === "discovery") form = '<div class="card between"><div><div class="heading">Discover</div><div class="caption">Show you to people with a similar goal</div></div>' + E.switch(!!u.discovery, 'data-action="toggle" data-path="user.discovery"') + "</div>";
    if (field === "city") form = E.field({ id: "city-q", model: "city-q", value: E.state.ui.cityQuery || u.city, placeholder: "Bengaluru" }) +
      '<div class="hscroll mt8">' + cities.map(function (c) { return '<button type="button" class="chip ' + (u.city === c ? "on" : "") + '" data-action="pick-city" data-value="' + E.esc(c) + '">' + E.esc(c) + "</button>"; }).join("") + "</div>";
    if (field === "bio") form = E.field({ id: "bio", model: "bio", value: u.bio, placeholder: "Training for a 10K. Home lunches." });
    const skip = field === "bio" ? '<div class="mt8">' + E.btn("Skip for now", { variant: "ghost", attrs: 'data-action="chat-skip-bio"' }) + "</div>" : "";
    const body = '<div class="overline">Step ' + (i + 1) + " of " + fields.length + '</div><div class="title mt8">' + copy[0] + "</div>" +
      '<p class="body muted mt8">' + copy[1] + "</p>" +
      '<div class="track light mt12"><span style="width:' + Math.round(((i + 1) / fields.length) * 100) + '%;background:var(--ink)"></span></div>' +
      '<div class="mt16">' + form + "</div>" + skip +
      '<div class="mt20">' + E.btn(copy[2], { attrs: 'data-action="chat-next"' }) + "</div>";
    return E.page({ tab: true, body: body });
  }

  E.screens.thread = function () {
    const id = (E.currentParams() || {}).id;
    const chat = (E.state.chats || []).find(function (c) { return c.id === id; });
    if (!chat) return E.page({ top: E.topTitle("Chat"), body: E.empty({ emoji: "💬", title: "Chat not found" }) });
    const sub = chat.type === "group" ? (chat.members || []).length + " members" : (chat.pending === "outgoing" ? "Request sent" : chat.online ? "Online" : "Last seen recently");
    const top = E.backBtn() + '<button type="button" class="row gap8 grow" style="border:0;background:transparent;text-align:left;color:inherit" data-action="' + (chat.type === "group" ? "open-group" : "noop") + '" data-id="' + chat.id + '">' +
      E.avatar({ name: chat.name, initials: chat.initials, color: chat.color, size: 36 }) +
      '<span class="grow"><span class="heading" style="font-size:16px">' + E.esc(chat.name) + '</span><span class="caption" style="display:block">' + (E.state.typing === chat.id ? "typing…" : sub) + "</span></span></button>" +
      (chat.type === "group" ? "" : E.iconBtn("ellipsis-vertical", 'data-action="chat-more" data-testid="chat-more" aria-label="Report or block"', "flat"));
    let banner = "";
    let locked = false;
    if (chat.pending === "incoming") {
      locked = true;
      banner = '<div class="card mt8"><div class="heading" style="font-size:15px">Accept this chat?</div><p class="caption">They can\'t message freely until you do.</p><div class="grid2 mt12">' +
        E.btn("Decline", { variant: "secondary", size: "md", attrs: 'data-action="decline-thread"' }) +
        E.btn("Accept", { size: "md", attrs: 'data-action="accept-thread"' }) + "</div></div>";
    } else if (chat.pending === "outgoing") {
      locked = true;
      banner = '<div class="banner mt8"><span>⏳</span><span><b>Request sent</b><div class="caption">You\'ll be able to chat when they accept.</div></span></div>';
    } else if (chat.blocked) {
      locked = true;
      banner = '<div class="banner amber mt8"><span>🚫</span><span class="grow"><b>You blocked ' + E.esc(chat.name) + '</b><div class="caption">They can\'t message you. Tapped by mistake?</div></span>' +
        E.btn("Unblock", { size: "sm", variant: "secondary", block: false, attrs: 'data-action="unblock-chat" data-testid="chat-unblock"' }) + "</div>";
    }
    let lastDay = "";
    const msgs = (chat.messages || []).map(function (m) {
      const day = E.dayLabel(m.at);
      const sep = day !== lastDay ? '<div class="day-sep">' + day.toUpperCase() + "</div>" : "";
      lastDay = day;
      const who = m.from === "me" ? "mine" : "them";
      let inner = "";
      if (m.meal) {
        const meal = m.meal;
        const photo = meal.image
          ? '<img alt="" src="' + E.esc(meal.image) + '">'
          : '<span class="ph">' + E.esc(meal.emoji || "🍽️") + "</span>";
        const macros = (meal.p || meal.c || meal.f) ? " · P " + (meal.p || 0) + " · C " + (meal.c || 0) + " · F " + (meal.f || 0) : "";
        inner += '<button type="button" class="meal-share-card" data-action="open-shared-meal" data-mid="' + m.id + '" data-testid="shared-meal-card">' +
          photo + '<span class="grow"><span class="caption">Shared a meal</span><b>' + E.esc(meal.name) + '</b><span class="caption">' + E.num(meal.kcal) + " kcal" + macros + "</span></span></button>";
      }
      if (m.image) inner += '<img alt="" src="' + E.esc(m.image) + '" data-src="' + E.esc(m.image) + '" style="width:180px;border-radius:12px;margin-bottom:6px" data-action="lightbox">';
      if (m.text) inner += E.esc(m.text);
      const meta = '<div class="caption" style="opacity:.7;margin-top:4px">' + (m.name ? E.esc(m.name) + " · " : "") + E.msgTime(m.at) + (m.from === "me" ? " ✓✓" : "") + "</div>";
      return sep + '<div class="bubble-msg ' + who + '" data-longpress="msg-actions" data-mid="' + m.id + '">' + inner + meta + "</div>";
    }).join("");
    const typing = E.state.typing === chat.id ? '<div class="bubble-msg them">…</div>' : "";
    const ice = !locked && (chat.messages || []).length < 2 ? '<div class="hscroll" style="margin-bottom:8px">' +
      ["What did you eat today?", "Want to be accountability partners?", "Training today?"].map(function (t) {
        return '<button type="button" class="chip" data-action="ice" data-value="' + E.esc(t) + '">' + E.esc(t) + "</button>";
      }).join("") + "</div>" : "";
    const composer = locked ? "" : ice + '<div class="compose-box"><button type="button" class="trail" data-action="attach" data-testid="chat-share-meal" aria-label="Photo or meal">' + E.icon("image") + '</button>' +
      '<textarea id="composer" data-model="composer" rows="1" placeholder="Message">' + E.esc(E.state.ui.composer || "") + '</textarea>' +
      '<button type="button" class="send" data-action="send" aria-label="Send">' + E.icon("send") + "</button></div>";
    return E.page({ top: top, composer: composer, body: banner + '<div id="msg-list">' + msgs + typing + "</div>" });
  };

  E.screens["group-info"] = function () {
    const chat = (E.state.chats || []).find(function (c) { return c.id === (E.currentParams() || {}).id; });
    if (!chat) return E.page({ top: E.topTitle("Group"), body: "" });
    const members = (chat.members || []).map(function (n) {
      return '<div class="nav-row"><span class="avatar" style="width:36px;height:36px">' + E.esc(E.initials(n)) + '</span><span class="heading" style="font-size:15px">' + E.esc(n) + "</span></div>";
    }).join("");
    return E.page({ top: E.topTitle("Group"), body: '<div class="center mt8">' + E.avatar({ name: chat.name, color: chat.color, size: 72 }) + '<div class="title mt12">' + E.esc(chat.name) + "</div></div><div class=\"list-card mt16\">" + members + "</div>" });
  };

  E.screens["user-profile"] = function () {
    const p = (E.state.discover || []).find(function (d) { return d.id === (E.currentParams() || {}).id; });
    if (!p) return E.page({ top: E.topTitle("Profile"), body: E.empty({ emoji: "👤", title: "Profile unavailable" }) });
    return E.page({
      top: E.backBtn() + '<div class="top-title"><div class="heading">' + E.esc(p.name) + "</div></div>" +
        E.iconBtn("ellipsis", 'data-action="profile-more" data-id="' + p.id + '" aria-label="Report or block"', "flat"),
      body: '<div class="center">' + E.avatar({ name: p.name, color: p.color, size: 84 }) + '<div class="title mt12">' + E.esc(p.name) + '</div><div class="caption">' + E.esc(p.goal) + " · " + E.esc(p.distance) + "</div></div>" +
        '<p class="body mt16">' + E.esc(p.bio) + "</p>" +
        '<div class="hscroll mt12">' + p.tags.map(function (t) { return '<span class="chip">' + E.esc(t) + "</span>"; }).join("") + "</div>" +
        '<p class="caption mt12">Accountability and training — not a dating profile.</p>' +
        '<div class="mt20">' + E.btn("Message", { attrs: 'data-action="say-hi" data-id="' + p.id + '"' }) + "</div>"
    });
  };

  E.screens.communities = function () {
    const tab = E.state.ui.communityTab || "mine";
    const q = (E.state.ui.communityQuery || "").toLowerCase();
    const city = (E.state.user.city || "").toLowerCase();
    let list = (E.state.communities[tab] || []).filter(function (c) { return !c.archived && (tab === "mine" ? c.joined !== false : !c.joined); });
    if (tab === "discover" && q) list = list.filter(function (c) { return (c.name + " " + c.city).toLowerCase().indexOf(q) >= 0; });
    if (tab === "discover" && E.state.ui.nearMe) list = list.filter(function (c) { return city && c.city.toLowerCase() === city; });
    const gate = E.gate();
    const cards = list.map(function (c) {
      return '<button type="button" class="card mt12" style="width:100%;text-align:left;border:0;color:inherit" data-action="open-community" data-id="' + c.id + '" data-list="' + tab + '">' +
        '<div class="photo" style="height:92px;border-radius:16px;background:hsl(' + c.hue + ',45%,78%)"><span style="font-size:32px">🌍</span></div>' +
        '<div class="heading mt12" style="font-size:16px">' + E.esc(c.name) + '</div><div class="caption">' + c.members + " members · " + E.esc(c.city) + (c.joined ? "" : " · Join to post") + "</div></button>";
    }).join("");
    const near = tab === "discover" ? '<div class="mt12"><button type="button" class="chip ' + (E.state.ui.nearMe ? "on" : "") + '" data-action="toggle-near">Near me</button></div>' : "";
    const body = '<div class="mt4">' + E.segmented([{ id: "mine", label: "Mine" }, { id: "discover", label: "Discover" }], tab, "comm-tab") + "</div>" +
      (tab === "discover" ? '<div class="mt12">' + E.field({ id: "cq", model: "comm-q", placeholder: "Search by name or city", value: E.state.ui.communityQuery, icon: "search" }) + "</div>" + near : "") +
      (gate || cards || E.empty({ emoji: "🌍", title: E.state.ui.nearMe ? "Nothing in your city yet" : "No communities yet", sub: "Discover a group, or create one on Pro." }));
    return E.page({
      top: E.backBtn() + '<div class="top-title"><div class="heading">Communities</div></div>' + E.iconBtn("plus", 'data-action="create-community-gate" aria-label="Create community"', "ink"),
      body: body
    });
  };

  E.screens.community = function () {
    const p = E.currentParams() || {};
    const c = E.communityById(p.id);
    if (!c || c.archived) return E.page({ top: E.topTitle("Community"), body: E.empty({ emoji: "🌍", title: "Community not found" }) });
    const view = E.state.ui.commView || "feed";
    const joined = !!c.joined;
    const posts = (c.posts || []).filter(function (post) { return !post.hidden; }).map(function (post) {
      const open = E.state.ui.openPost === post.id;
      const n = (post.replies || []).length;
      const replies = (post.replies || []).map(function (r) {
        return '<div class="card mt8" style="padding:10px 12px"><b>' + E.esc(r.author) + '</b><div class="caption mt4">' + E.esc(r.text) + "</div></div>";
      }).join("");
      const mine = post.author === "You";
      return '<div class="card mt12"><div class="between"><span class="heading" style="font-size:15px">' + E.esc(post.author) + '</span><span class="caption">' + E.esc(post.time || "") + '</span></div><p class="body mt8">' + E.esc(post.text) + '</p>' +
        '<div class="row gap12 mt8"><button type="button" class="chip ' + (post.liked ? "on" : "") + '" data-action="like-post" data-id="' + post.id + '" data-cid="' + c.id + '" aria-label="Like">♥ ' + (post.likes || 0) + '</button>' +
        '<button type="button" class="chip" data-action="toggle-replies" data-id="' + post.id + '">💬 ' + (n ? n + (n === 1 ? " reply" : " replies") : "Reply") + "</button>" +
        (mine ? "" : '<button type="button" class="chip" style="margin-left:auto" data-action="report-post" data-id="' + post.id + '" data-cid="' + c.id + '" data-testid="post-report" aria-label="Report post">' + E.icon("flag") + "</button>") + "</div>" +
        (open ? replies + (joined ? '<div class="mt8">' + E.field({ id: "reply", model: "reply-draft", value: E.state.ui.replyDraft, placeholder: "Write a reply" }) + "</div>" +
          '<div class="mt8">' + E.btn("Reply", { size: "sm", attrs: 'data-action="send-reply" data-id="' + post.id + '" data-cid="' + c.id + '"' }) + "</div>" : "") : "") +
        "</div>";
    }).join("") || E.empty({ emoji: "✨", title: "No posts yet", sub: joined ? "Say hello — share a win or a question." : "Join to see and write posts." });
    const members = (c.pending || []).map(function (m) {
      return '<div class="between card mt12"><span class="grow"><b>' + E.esc(m.name) + '</b><div class="caption">Join request</div></span>' +
        (c.admin ? E.btn("Approve", { size: "sm", block: false, attrs: 'data-action="approve-member" data-id="' + m.id + '" data-cid="' + c.id + '"' }) +
          E.btn("Reject", { size: "sm", variant: "secondary", block: false, attrs: 'data-action="reject-member" data-id="' + m.id + '" data-cid="' + c.id + '"' }) : "") + "</div>";
    }).join("") + (c.memberList || []).map(function (m) {
      return '<div class="between card mt12"><span class="grow"><b>' + E.esc(m.name) + '</b><div class="caption">' + E.esc(m.role || "member") + "</div></span>" +
        (c.admin && m.id !== "me" ? E.btn("Remove", { size: "sm", variant: "secondary", block: false, attrs: 'data-action="remove-member" data-id="' + m.id + '" data-cid="' + c.id + '"' }) : "") + "</div>";
    }).join("") || E.empty({ emoji: "👥", title: "No members yet" });
    const about = '<div class="card mt12"><b>About</b><p class="body muted mt8">' + E.esc(c.description || "No description yet.") + '</p><p class="caption mt8">' + E.esc(c.city || "") + "</p></div>" +
      '<div class="card mt12"><b>Rules</b><p class="body muted mt8">' + E.esc(c.rules || "Be kind.") + "</p></div>";
    const pane = view === "members" ? members : view === "about" ? about : posts;
    const composer = view === "feed" && joined ? '<div class="card mt12"><textarea class="plain-area" id="post" data-model="post-draft" rows="2" placeholder="Share a win or ask the group…" data-testid="post-draft">' + E.esc(E.state.ui.postDraft || "") + "</textarea>" +
      '<div class="mt8">' + E.btn("Post", { size: "md", attrs: 'data-action="community-post" data-cid="' + c.id + '" data-testid="post-send"' }) + "</div></div>"
      : view === "feed" && !joined ? '<div class="banner mt12"><span>👋</span><span class="grow"><b>Join to post and reply</b><div class="caption">You can read the feed first.</div></span></div>' : "";
    const join = joined
      ? E.btn("Leave", { size: "sm", variant: "ghost", block: false, attrs: 'data-action="leave-community" data-cid="' + c.id + '" data-testid="community-leave"' })
      : E.btn("Join", { size: "sm", block: false, attrs: 'data-action="join-community" data-cid="' + c.id + '"' });
    const top = E.backBtn() + '<div class="top-title"><div class="heading">' + E.esc(c.name) + '</div><div class="caption">' + c.members + " members</div></div>" +
      (c.admin ? E.iconBtn("settings", 'data-action="go" data-screen="community-settings" data-id="' + c.id + '" aria-label="Community settings"', "flat") : "");
    return E.page({
      top: top,
      body: '<div class="between mt4"><span class="caption">' + E.esc(c.city || "") + "</span>" + join + "</div>" +
        '<div class="mt12">' + E.segmented([{ id: "feed", label: "Feed" }, { id: "members", label: "Members" }, { id: "about", label: "About" }], view, "comm-view") + "</div>" +
        composer + pane
    });
  };

  E.screens["community-settings"] = function () {
    const id = (E.currentParams() || {}).id;
    const c = E.communityById(id);
    if (!c) return E.page({ top: E.topTitle("Community"), body: "" });
    return E.page({
      top: E.topTitle("Community settings", "Edit details or archive"),
      body: E.field({ label: "Name", id: "cn", model: "comm-name", value: E.state.ui.commName || c.name }) +
        '<div class="mt12">' + E.field({ label: "Description", id: "cd", model: "comm-about", value: E.state.ui.commAbout || c.description }) + "</div>" +
        '<div class="mt12"><div class="field-label">Rules</div><textarea class="plain-area mt8" data-model="comm-rules">' + E.esc(E.state.ui.commRules != null ? E.state.ui.commRules : (c.rules || "")) + "</textarea></div>" +
        '<div class="mt16">' + E.btn("Save changes", { attrs: 'data-action="save-community" data-id="' + c.id + '"' }) + "</div>" +
        '<div class="mt8">' + E.btn("Archive community", { variant: "danger", attrs: 'data-action="ask-archive" data-id="' + c.id + '"' }) + "</div>" +
        '<p class="caption mt12">Archiving removes the group from Mine. Members lose access in this demo.</p>'
    });
  };

  E.modals["new-group"] = function () {
    const picks = E.state.ui.groupPicks || [];
    const people = (E.state.discover || []).concat((E.state.chats || []).filter(function (c) { return c.type === "dm" && !c.pending; }).map(function (c) {
      return { id: c.id, name: c.name, color: c.color };
    }));
    const seen = {};
    const unique = people.filter(function (p) { if (seen[p.name]) return false; seen[p.name] = 1; return true; });
    return '<div class="modal-wrap" style="background:var(--canvas);overflow:auto;padding:16px 18px 24px"><div class="between"><button type="button" class="icon-btn" data-action="close-modal">' + E.icon("x") + '</button><div class="heading">New group</div><span style="width:44px"></span></div>' +
      '<div class="mt16">' + E.field({ label: "Group name", id: "gname", model: "group-name", value: E.state.ui.groupName, placeholder: "Weekday lunches" }) + "</div>" +
      '<div class="overline mt16">People</div>' + unique.map(function (p) {
        const on = picks.indexOf(p.id) >= 0;
        return '<button type="button" class="nav-row" data-action="pick-member" data-id="' + p.id + '">' + E.avatar({ name: p.name, color: p.color, size: 40 }) +
          '<span class="grow heading" style="font-size:15px">' + E.esc(p.name) + "</span>" + (on ? E.icon("check") : "") + "</button>";
      }).join("") +
      '<div class="mt16">' + E.btn("Create group", { disabled: !E.state.ui.groupName || picks.length < 2, attrs: 'data-action="create-group"' }) + "</div></div>";
  };

  E.modals["create-community"] = function () {
    return '<div class="modal-wrap" style="background:var(--canvas);overflow:auto;padding:16px 18px 24px"><div class="between"><button type="button" class="icon-btn" data-action="close-modal">' + E.icon("x") + '</button><div class="heading">Create community</div><span style="width:44px"></span></div>' +
      '<p class="caption mt12">Pro members can host a group. This stays inside the demo.</p>' +
      '<div class="stack mt16">' +
      E.field({ label: "Name", id: "newc", model: "new-comm", value: E.state.ui.newComm, placeholder: "Indiranagar meal prep" }) +
      E.field({ label: "Description", id: "newd", model: "new-about", value: E.state.ui.newAbout, placeholder: "What you cook and when you meet" }) +
      E.field({ label: "Location", id: "newl", model: "new-city", value: E.state.ui.newCity || "Bengaluru" }) +
      "</div><div class=\"mt16\">" + E.btn("Create", { attrs: 'data-action="submit-community"' }) + "</div></div>";
  };

  function sharePeople() {
    return (E.state.chats || []).filter(function (c) {
      return c.type !== "group" && !c.pending && !c.blocked;
    }).slice().sort(function (a, b) { return (b.time || 0) - (a.time || 0); });
  }
  function youngShare() {
    const u = E.state.user || {};
    return !!(u.ageBlocked || E.age(u.birthYear, u.birthMonth) < 18);
  }
  E.modals.share = function () {
    const ui = E.state.ui;
    const meal = (E.state.meals || []).find(function (m) { return m.id === (E.state.modal || {}).mealId; }) ||
      (E.state.meals || []).find(function (m) { return m.id === ui.shareMealId; });
    const totals = meal ? E.mealTotals(meal) : { kcal: 0, p: 0, c: 0, f: 0 };
    const photo = meal && meal.image
      ? '<img alt="" src="' + E.esc(meal.image) + '">'
      : '<span class="ph">' + E.esc((meal && meal.emoji) || "🍽️") + "</span>";
    const strip = '<div class="meal-strip">' + photo +
      '<span class="grow"><b>' + E.esc(meal ? meal.name : "Meal") + "</b>" +
      '<span class="caption">' + E.num(totals.kcal) + " kcal · P " + totals.p + " · C " + totals.c + " · F " + totals.f + "</span></span></div>";
    let body = "";
    let dock = "";
    if (youngShare()) {
      body = E.empty({
        emoji: "🌱",
        title: "Sharing opens at 18",
        sub: "This meal stays in your diary. Chat sharing opens with chat, at 18."
      });
      dock = E.btn("Back to meal", { attrs: 'data-action="close-modal" data-testid="share-back-meal"' });
    } else {
      const people = sharePeople();
      const chosen = people.find(function (p) { return p.id === ui.shareChat; });
      if (!people.length) {
        body = E.empty({
          emoji: "👋",
          title: "No one to send this to yet",
          sub: "Accept a chat first. Then you can send this meal."
        });
        dock = E.btn("Open chats", { attrs: 'data-action="open-chats" data-testid="share-open-chats"' });
      } else {
        body = '<div class="heading mt16" style="font-size:16px">Send to</div><div class="list-card mt8">' + people.map(function (c) {
          const on = ui.shareChat === c.id;
          return '<button type="button" class="nav-row' + (on ? " on" : "") + '" data-action="pick-share" data-id="' + c.id + '" data-testid="share-friend">' +
            E.avatar({ name: c.name, color: c.color, initials: c.initials, size: 42 }) +
            '<span class="grow"><span class="heading" style="font-size:15px">' + E.esc(c.name) + '</span><span class="caption">' + E.esc(c.preview || "Chat") + "</span></span>" +
            (on ? E.icon("check") : "") + "</button>";
        }).join("") + "</div>" +
          '<div class="mt12">' + E.field({ label: "Note", id: "snote", model: "share-note", value: ui.shareNote, placeholder: "Optional note" }) + "</div>";
        const label = !chosen ? "Choose one person" : ("Send to " + chosen.name + (E.isPro() ? "" : " · Pro"));
        dock = E.btn(label, { disabled: !chosen, attrs: 'data-action="send-share" data-testid="share-send"' });
      }
    }
    return '<div class="sheet-wrap"><button type="button" class="backdrop" data-action="close-modal" aria-label="Close"></button><div class="sheet share-sheet"><div class="grabber"></div>' +
      strip + body + '<div class="share-dock">' + dock + "</div></div></div>";
  };
  E.modals["shared-meal"] = function () {
    const meal = E.state.ui.sharedMeal || {};
    const photo = meal.image
      ? '<img alt="" src="' + E.esc(meal.image) + '">'
      : '<span class="ph">' + E.esc(meal.emoji || "🍽️") + "</span>";
    return '<div class="sheet-wrap"><button type="button" class="backdrop" data-action="close-modal" aria-label="Close"></button><div class="sheet share-sheet"><div class="grabber"></div>' +
      '<div class="heading">Shared meal</div><p class="caption mt8">Only this meal. The rest of the diary stays private.</p>' +
      '<div class="meal-strip mt12">' + photo + '<span class="grow"><b>' + E.esc(meal.name || "Meal") + "</b>" +
      '<span class="caption">' + E.num(meal.kcal || 0) + " kcal · P " + (meal.p || 0) + " · C " + (meal.c || 0) + " · F " + (meal.f || 0) + "</span></span></div>" +
      (meal.note ? '<p class="body mt12">' + E.esc(meal.note) + "</p>" : "") +
      '<div class="share-dock">' + E.btn("Close", { variant: "secondary", attrs: 'data-action="close-modal" data-testid="shared-meal-close"' }) + "</div></div></div>";
  };

  E.modals["share-card"] = function () {
    const days = E.weekDays(0);
    const week = E.macroWeek(days);
    const range = E.shortDate(days[0].iso) + " – " + E.shortDate(days[6].iso);
    const card = '<div class="share-week mt12" data-testid="share-week-card"><div class="overline" style="color:#C6F135">This week</div><div class="title mt8" style="color:white">' + E.esc(range) + '</div>' +
      '<div class="heading mt12" style="color:white">Hit ' + week.hitDays + " of 7</div>" +
      '<p class="caption mt8" style="color:rgba(255,255,255,.75)">Protein ' + week.avgProtein + " g · target " + week.proteinTarget + " g · streak " + week.longest + " day" + (week.longest === 1 ? "" : "s") + "</p>" +
      '<p class="caption mt8" style="color:rgba(255,255,255,.6)">A hit day is calories within 10%, and protein at least 90%.</p>' +
      '<p class="body mt12" style="color:white">' + E.esc(week.focus) + "</p></div>";
    if (youngShare()) {
      return '<div class="sheet-wrap"><button type="button" class="backdrop" data-action="close-modal"></button><div class="sheet"><div class="grabber"></div>' + card +
        E.empty({ emoji: "🌱", title: "Sharing opens at 18", sub: "The week stays on your phone. Sending it in chat opens at 18." }) +
        '<div class="mt12">' + E.btn("Close", { variant: "secondary", attrs: 'data-action="close-modal"' }) + "</div></div></div>";
    }
    const people = sharePeople();
    const chosen = people.find(function (p) { return p.id === E.state.ui.shareWeekChat; });
    const list = people.length
      ? '<div class="heading mt16" style="font-size:16px">Send to</div><div class="list-card mt8">' + people.map(function (c) {
        const on = E.state.ui.shareWeekChat === c.id;
        return '<button type="button" class="nav-row' + (on ? " on" : "") + '" data-action="pick-week-chat" data-id="' + c.id + '" data-testid="share-week-friend">' +
          E.avatar({ name: c.name, color: c.color, initials: c.initials, size: 42 }) +
          '<span class="grow"><span class="heading" style="font-size:15px">' + E.esc(c.name) + "</span></span>" +
          (on ? E.icon("check") : "") + "</button>";
      }).join("") + "</div>"
      : E.empty({ emoji: "👋", title: "No one to send this to yet", sub: "Accept a chat first. The card stays here until then." });
    return '<div class="sheet-wrap"><button type="button" class="backdrop" data-action="close-modal" aria-label="Close"></button><div class="sheet"><div class="grabber"></div>' +
      '<div class="heading">Share this week</div><p class="caption mt8">Hit days and protein only. Meals stay in your diary.</p>' +
      card + list +
      '<div class="mt16">' + E.btn(chosen ? "Send to " + chosen.name.split(" ")[0] : "Choose one person", { disabled: !chosen, attrs: 'data-action="send-week-card" data-testid="share-week-send"' }) + "</div></div></div>";
  };

  E.modals["chat-meal"] = function () {
    const ui = E.state.ui;
    const chat = (E.state.chats || []).find(function (c) { return c.id === (ui.chatMealChat || (E.currentParams() || {}).id); });
    const who = chat ? String(chat.name || "them").split(" ")[0] : "them";
    if (youngShare() || !chat) {
      return '<div class="sheet-wrap"><button type="button" class="backdrop" data-action="close-modal" aria-label="Close"></button><div class="sheet share-sheet"><div class="grabber"></div>' +
        E.empty({ emoji: "🌱", title: "Sharing opens at 18", sub: "This chat stays about messages. Meal sharing opens with chat, at 18." }) +
        '<div class="share-dock">' + E.btn("Back to chat", { attrs: 'data-action="close-modal" data-testid="chat-meal-back"' }) + "</div></div></div>";
    }
    if (!ui.chatAddMode && !ui.chatMealDraft) {
      return '<div class="sheet-wrap"><button type="button" class="backdrop" data-action="close-modal" aria-label="Close"></button><div class="sheet share-sheet"><div class="grabber"></div>' +
        '<div class="heading">Add to this chat</div>' +
        '<p class="caption mt8">A photo is just a picture. A meal includes calories.</p>' +
        '<div class="list-card mt16">' +
        '<button type="button" class="nav-row" data-action="chat-add-mode" data-mode="photo" data-testid="chat-photo-mode"><span class="ico-sq">' + E.icon("image") + '</span><span class="grow"><b>Photo</b><span class="caption">Sends a picture. Nothing is logged.</span></span></button>' +
        '<button type="button" class="nav-row" data-action="chat-add-mode" data-mode="meal" data-testid="chat-meal-mode"><span class="ico-sq">' + E.icon("utensils") + '</span><span class="grow"><b>Meal</b><span class="caption">From today, typed, or a food photo.</span></span></button>' +
        "</div></div></div>";
    }
    if (ui.chatAddMode === "photo" && !ui.chatMealDraft) {
      const pics = [E.img.fruit, E.img.bowl, E.img.spread, E.img.thali];
      const tiles = pics.map(function (src) {
        return '<button type="button" class="meal-pick" data-action="chat-send-photo" data-src="' + E.esc(src) + '" data-testid="chat-plain-photo"><img alt="" src="' + E.esc(src) + '"></button>';
      }).join("");
      return '<div class="sheet-wrap"><button type="button" class="backdrop" data-action="close-modal" aria-label="Close"></button><div class="sheet share-sheet"><div class="grabber"></div>' +
        '<div class="heading">Send a photo</div>' +
        '<p class="caption mt8">' + E.esc(who) + ' sees the picture only. No calories, and it stays out of your diary.</p>' +
        '<div class="meal-picks mt16">' + tiles + "</div>" +
        '<div class="share-dock">' + E.btn("Back", { variant: "secondary", attrs: 'data-action="chat-add-back" data-testid="chat-photo-back"' }) + "</div></div></div>";
    }
    const draft = ui.chatMealDraft;
    if (draft) {
      const totals = E.mealTotals(draft);
      const photo = draft.image ? '<img alt="" src="' + E.esc(draft.image) + '">' : '<span class="ph">' + E.esc(draft.emoji || "🍽️") + "</span>";
      return '<div class="sheet-wrap"><button type="button" class="backdrop" data-action="close-modal" aria-label="Close"></button><div class="sheet share-sheet"><div class="grabber"></div>' +
        '<div class="heading">Send this to ' + E.esc(who) + '?</div>' +
        '<p class="caption mt8">Check the estimate first. ' + E.esc(who) + ' only sees this meal.</p>' +
        '<div class="meal-strip mt12">' + photo + '<span class="grow"><b>' + E.esc(draft.name || "Meal") + "</b>" +
        '<span class="caption">' + E.num(totals.kcal) + " kcal · P " + totals.p + " · C " + totals.c + " · F " + totals.f + "</span></span></div>" +
        '<div class="card mt12 between"><div><div class="heading" style="font-size:15px">Also add to my diary</div><div class="caption">Same meal, logged for you today.</div></div>' +
        E.switch(ui.chatMealLog !== false, 'data-action="chat-meal-log" data-testid="chat-meal-log"') + "</div>" +
        '<div class="share-dock">' + E.btn("Send to " + who, { attrs: 'data-action="chat-meal-send" data-testid="chat-meal-send"' }) +
        '<div class="mt8">' + E.btn("Not this meal", { variant: "ghost", attrs: 'data-action="chat-meal-clear" data-testid="chat-meal-clear"' }) + "</div></div></div></div>";
    }
    const today = (E.state.meals || []).filter(function (m) { return m.date === E.todayIso(); });
    const picks = today.map(function (m) {
      const on = ui.chatMealPick === m.id ? " on" : "";
      const photo = m.image ? '<img alt="" src="' + E.esc(m.image) + '">' : '<span class="ph">' + E.esc(m.emoji || "🍽️") + "</span>";
      return '<button type="button" class="meal-pick' + on + '" data-action="chat-pick-meal" data-id="' + E.esc(m.id) + '" data-testid="chat-meal-photo">' +
        photo + "<b>" + E.esc(m.name) + "</b></button>";
    }).join("");
    const typed = (ui.chatMealText || "").trim();
    const picked = today.some(function (m) { return m.id === ui.chatMealPick; });
    let label = "Tap a photo or type a meal";
    if (picked) label = "Send to " + who + (E.isPro() ? "" : " · Pro");
    else if (typed) label = (E.isPro() ? "Estimate and review" : "Estimate · Pro");
    const photos = picks
      ? '<div class="overline mt16">From today</div><div class="meal-picks mt8">' + picks + "</div>"
      : '<p class="caption mt16">Nothing logged today. Type it, or take a photo.</p>';
    return '<div class="sheet-wrap"><button type="button" class="backdrop" data-action="close-modal" aria-label="Close"></button><div class="sheet share-sheet"><div class="grabber"></div>' +
      '<button type="button" class="caption" data-action="chat-add-back" style="border:0;background:transparent;padding:0">Back</button>' +
      '<div class="heading mt8">Send a meal to ' + E.esc(who) + '</div>' +
      '<p class="caption mt8">' + E.esc(who) + ' only sees this meal, not the rest of your diary.</p>' +
      photos +
      '<div class="mt12">' + E.field({ label: picked ? "Note" : "Or type what you ate", id: "chat-meal-text", model: "chat-meal-text", value: ui.chatMealText, placeholder: picked ? "Optional note" : "2 roti, dal, and salad" }) + "</div>" +
      '<button type="button" class="nav-row mt12" data-action="chat-meal-camera" data-testid="chat-meal-camera"><span class="ico-sq">' + E.icon("camera") + '</span><span class="grow"><b>Food photo</b><span class="caption">Estimate calories, then send the meal</span></span></button>' +
      '<div class="share-dock">' + E.btn(label, { disabled: !picked && !typed, attrs: 'data-action="chat-meal-send" data-testid="chat-meal-send"' }) + "</div></div></div>";
  };
})();
