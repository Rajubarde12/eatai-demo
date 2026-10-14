(function () {
  const E = window.EatAI;
  E.screens = E.screens || {};
  E.modals = E.modals || {};
  E.esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  E.icon = function (name, cls) {
    return '<i data-lucide="' + name + '"' + (cls ? ' class="' + cls + '"' : "") + '></i>';
  };
  E.logo = function (size) {
    const s = size || 36;
    return '<span class="logo" style="width:' + s + 'px;height:' + s + 'px;border-radius:' + Math.round(s * 0.32) + 'px">' +
      '<svg width="' + Math.round(s * 0.58) + '" height="' + Math.round(s * 0.58) + '" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19C8 16 9 10 19 4C14 12 12 17 8 19C7.2 17.2 6.2 15.6 5 19Z" fill="#C6F135"/><path d="M8.2 18.2C11 13 14 9 19 4" stroke="#121210" stroke-width="1.2" fill="none"/></svg></span>';
  };
  E.google = function () {
    return '<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.7-6.6 7.1l6.3 5.3C37.4 38.4 44 33 44 24c0-1.2-.1-2.3-.4-3.5z"/></svg>';
  };
  E.btn = function (label, opts) {
    opts = opts || {};
    const variant = opts.variant || "primary";
    const size = opts.size || "lg";
    const busy = !!opts.busy;
    const disabled = opts.disabled || busy ? "disabled" : "";
    const iconL = !busy && opts.icon ? E.icon(opts.icon) : "";
    const iconR = !busy && opts.iconRight ? E.icon(opts.iconRight) : "";
    const block = opts.block === false ? "" : "btn-block";
    return '<button type="button" class="btn btn-' + variant + " btn-" + size + " " + block + '" ' + disabled + " " + (opts.attrs || "") + ">" +
      (busy ? '<span class="spinner"></span>' : iconL + "<span>" + E.esc(label) + "</span>" + iconR) + "</button>";
  };
  E.iconBtn = function (icon, attrs, extra) {
    return '<button type="button" class="icon-btn ' + (extra || "") + '" ' + (attrs || "") + ">" + E.icon(icon) + "</button>";
  };
  E.field = function (opts) {
    const type = opts.type || "text";
    const err = opts.error ? " error" : "";
    const trail = opts.trail || "";
    const icon = opts.icon ? E.icon(opts.icon) : "";
    return '<label class="field">' +
      (opts.label ? '<span class="field-label">' + E.esc(opts.label) + "</span>" : "") +
      '<span class="field-box' + err + '">' + icon +
      '<input id="' + E.esc(opts.id || "") + '" ' + (opts.model ? 'data-model="' + opts.model + '"' : "") +
      ' type="' + type + '" placeholder="' + E.esc(opts.placeholder || "") + '" value="' + E.esc(opts.value || "") + '" ' +
      (opts.attrs || "") + " />" + trail + "</span>" +
      (opts.error ? '<span class="field-error">' + E.esc(opts.error) + "</span>" : "") +
      "</label>";
  };
  E.backBtn = function (action) {
    return E.iconBtn("chevron-left", 'data-action="' + (action || "back") + '" aria-label="Back"');
  };
  E.page = function (opts) {
    const bits = ["scroll"];
    bits.push(opts.tab ? "with-tab" : "no-tab");
    if (opts.top) bits.push("under-top");
    if (opts.bleed) bits.push("bleed");
    if (opts.composer) bits.push("has-composer");
    const pull = opts.pull ? ' data-pull="1"' : "";
    return '<div class="page">' +
      (opts.top ? '<div class="fixed-top">' + opts.top + "</div>" : "") +
      '<div class="' + bits.join(" ") + '"' + pull + ">" + opts.body + "</div>" +
      (opts.footer ? '<div class="dock">' + opts.footer + "</div>" : "") +
      (opts.composer ? '<div class="composer">' + opts.composer + "</div>" : "") +
      "</div>";
  };
  E.avatar = function (opts) {
    const size = opts.size || 42;
    const bg = opts.color || "#C6F135";
    const label = opts.initials || E.initials(opts.name || "?");
    return '<span class="avatar" style="width:' + size + "px;height:" + size + "px;background:" + bg + ";font-size:" + Math.round(size * 0.34) + 'px">' + E.esc(label) + "</span>";
  };
  E.photo = function (src, emoji, cls) {
    return '<div class="photo ' + (cls || "") + '">' +
      (src ? '<img alt="" src="' + E.esc(src) + '" onerror="this.remove()">' : "") +
      "<span>" + (emoji || "🍽️") + "</span></div>";
  };
  E.ring = function (pct, opts) {
    opts = opts || {};
    const size = opts.size || 84;
    const sw = opts.stroke || 8;
    const r = (size - sw) / 2;
    const c = 2 * Math.PI * r;
    const p = Math.max(0, Math.min(1, pct));
    const color = opts.color || "#C6F135";
    const track = opts.track || "rgba(255,255,255,.16)";
    return '<div class="ring-wrap" style="width:' + size + "px;height:" + size + 'px">' +
      '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + " " + size + '">' +
      '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="' + track + '" stroke-width="' + sw + '"/>' +
      '<circle class="ring-fg" cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="' + sw + '" stroke-linecap="round" stroke-dasharray="' + c.toFixed(2) + '" stroke-dashoffset="' + (c * (1 - p)).toFixed(2) + '" transform="rotate(-90 ' + size / 2 + " " + size / 2 + ')"/>' +
      "</svg><div class=\"ring-center\">" + (opts.center || "") + "</div></div>";
  };
  E.macros = function (eaten, goal, light) {
    const rows = [
      ["Protein", eaten.p, goal.p, "var(--protein)"],
      ["Carbs", eaten.c, goal.c, "var(--carbs)"],
      ["Fats", eaten.f, goal.f, "var(--fats)"]
    ];
    return '<div class="grid3">' + rows.map(function (r) {
      const left = r[2] - r[1];
      const pct = Math.max(6, Math.min(100, (r[1] / Math.max(1, r[2])) * 100));
      const label = left >= 0 ? left + "g left" : Math.abs(left) + "g over";
      return '<div><div class="between"><span class="macro-label">' + r[0] + '</span></div>' +
        '<div class="track ' + (light ? "light" : "") + ' mt4"><span style="width:' + pct + "%;background:" + r[3] + '"></span></div>' +
        '<div class="caption mt4" style="color:' + (light ? "var(--muted)" : "rgba(255,255,255,.72)") + '">' + label + "</div></div>";
    }).join("") + "</div>";
  };
  E.macroDots = function (plan) {
    const rows = [["Protein", plan.p, "var(--protein)"], ["Carbs", plan.c, "var(--carbs)"], ["Fats", plan.f, "var(--fats)"]];
    return '<div class="grid3 mt12">' + rows.map(function (r) {
      return '<div class="stat"><span style="color:' + r[2] + '">●</span><b class="nums">' + r[1] + 'g</b><span>' + r[0] + "</span></div>";
    }).join("") + "</div>";
  };
  E.tile = function (opts) {
    return '<button type="button" class="tile press ' + (opts.on ? "on" : "") + '" data-action="' + opts.action + '" data-value="' + E.esc(opts.value) + '">' +
      '<span class="tile-emoji">' + opts.emoji + "</span>" +
      '<span class="grow"><span class="tile-title">' + E.esc(opts.title) + "</span>" +
      (opts.sub ? '<span class="tile-sub">' + E.esc(opts.sub) + "</span>" : "") + "</span>" +
      '<span class="radio">' + (opts.on ? E.icon("check") : "") + "</span></button>";
  };
  E.switch = function (on, attrs) {
    return '<button type="button" class="switch ' + (on ? "on" : "") + '" role="switch" aria-checked="' + (on ? "true" : "false") + '" ' + attrs + '><span class="knob"></span></button>';
  };
  E.segmented = function (options, active, action) {
    return '<div class="seg">' + options.map(function (o) {
      const id = o.id || o;
      const label = o.label || o;
      const badge = o.badge ? '<em class="count">' + o.badge + "</em>" : "";
      return '<button type="button" class="' + (active === id ? "on" : "") + '" data-action="' + action + '" data-value="' + id + '">' + E.esc(label) + badge + "</button>";
    }).join("") + "</div>";
  };
  E.empty = function (opts) {
    return '<div class="empty"><div class="empty-orb">' + (opts.emoji || "✨") + "</div><div class=\"heading\">" + E.esc(opts.title) + "</div>" +
      (opts.sub ? '<p class="caption mt8">' + E.esc(opts.sub) + "</p>" : "") +
      (opts.button ? '<div class="mt16">' + opts.button + "</div>" : "") + "</div>";
  };
  E.loadingBlock = function () {
    return '<div class="stack mt16"><div class="skel" style="height:92px"></div><div class="skel" style="height:64px"></div><div class="skel" style="height:64px"></div></div>';
  };
  E.errorBlock = function () {
    return E.empty({
      emoji: "⚠️",
      title: "Couldn't load this",
      sub: "Check the connection and try again. Nothing was lost.",
      button: E.btn("Try again", { attrs: 'data-action="retry-load"', size: "md" })
    });
  };
  E.gate = function () {
    if (E.state.flags.forceLoading) return E.loadingBlock();
    if (E.state.flags.forceError) return E.errorBlock();
    return "";
  };
  E.navRow = function (icon, title, sub, attrs) {
    return '<button type="button" class="nav-row" ' + attrs + '>' +
      '<span class="ico-sq">' + E.icon(icon) + "</span>" +
      '<span class="grow"><span class="heading" style="font-size:15px">' + title + "</span>" +
      (sub ? '<span class="caption" style="display:block">' + sub + "</span>" : "") + "</span>" +
      E.icon("chevron-right") + "</button>";
  };
  E.topTitle = function (title, sub) {
    return E.backBtn() + '<div class="top-title"><div class="heading">' + E.esc(title) + "</div>" +
      (sub ? '<div class="caption">' + sub + "</div>" : "") + "</div>";
  };
  E.chips = function (list, selected, action, multi) {
    const set = Array.isArray(selected) ? selected : [selected];
    return '<div class="hscroll" style="flex-wrap:wrap">' + list.map(function (c) {
      const on = set.indexOf(c) >= 0;
      return '<button type="button" class="chip ' + (on ? "on" : "") + '" data-action="' + action + '" data-value="' + E.esc(c) + '">' + E.esc(c) + "</button>";
    }).join("") + "</div>";
  };
  E.aboutHero = function () {
    return '<div class="about-hero"><svg viewBox="0 0 360 200" width="100%" height="200" preserveAspectRatio="xMidYMid slice">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#EEF9CF"/><stop offset="1" stop-color="#C9BBA4"/></linearGradient></defs>' +
      '<rect width="360" height="200" fill="url(#g)"/>' +
      '<circle cx="250" cy="110" r="70" fill="#121210"/>' +
      '<circle cx="250" cy="118" r="36" fill="#F4F2EC"/>' +
      '<path d="M70 150c30-50 70-70 120-78" stroke="#121210" stroke-width="8" fill="none" stroke-linecap="round"/>' +
      '<path d="M168 78c8 16-6 28-20 24 8-14 8-22 20-24z" fill="#C6F135"/>' +
      '<text x="24" y="48" font-family="Bricolage Grotesque, sans-serif" font-size="28" font-weight="800" fill="#121210">EatAI</text>' +
      '<text x="24" y="74" font-family="DM Sans, sans-serif" font-size="13" fill="#6B6A63">Fresh market energy, honest numbers.</text></svg></div>';
  };
})();
