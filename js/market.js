/* SLC Ads Market + Ad details page.
   Loads after js/app.js and uses the helpers it exposes on window.SLC.
   Data comes from api/ads.php and api/sellers.php (PHP + PostgreSQL).
   If the server is not reachable (for example you opened index.html straight from a folder),
   it shows a "could not connect" message instead of made-up ads. */
(function () {
  "use strict";
  var A = window.SLC;
  if (!A) return;
  var $ = A.$, esc = A.esc, ic = A.ic, toast = A.toast, go = A.go, PAGE = A.PAGE;
  var QS = new URLSearchParams(location.search);

  var API = "api/";
  var naira = function (n) { return "\u20A6" + Number(n).toLocaleString("en-NG"); };
  var DAY = 86400000;
  var ago = function (n) { return new Date(Date.now() - n * DAY).toISOString(); };
  var ahead = function (n) { return new Date(Date.now() + n * DAY).toISOString(); };

  var CATS = [
    { slug: "all", name: "All" },
    { slug: "tech", name: "Tech & repairs" },
    { slug: "food", name: "Food & snacks" },
    { slug: "fashion", name: "Fashion" },
    { slug: "books", name: "Books & notes" },
    { slug: "beauty", name: "Beauty & hair" },
    { slug: "services", name: "Services" },
    { slug: "rooms", name: "Rooms & hostels" }
  ];
  var CAT_NAME = {};
  CATS.forEach(function (c) { CAT_NAME[c.slug] = c.name; });
  var GRAD = {
    tech: ["#0f4fb4", "#3fd0e0"], food: ["#e8742a", "#f5b942"], fashion: ["#8a3fc0", "#e0559b"],
    books: ["#12805c", "#5fd1a0"], beauty: ["#d63a6a", "#f5a0b8"], services: ["#566880", "#93b4e0"],
    rooms: ["#c9781a", "#f3c25b"], other: ["#0f4fb4", "#0f8fa0"]
  };

  /* Offline fallback: empty on purpose. Real ads and sellers always come from the server. */
  var SELLERS = [];
  var ADS = [];
  var sellerById = {};
  SELLERS.forEach(function (s) { sellerById[s.id] = s; });
  ADS.forEach(function (a) {
    var s = sellerById[a.seller_id];
    a.seller_name = s.name; a.seller_verified = s.verified; a.category_name = CAT_NAME[a.category];
  });

  /* ---------- state ---------- */
  var st = { q: "", cat: "all", seller: null, ads: [], sellers: [], live: false, req: 0, adId: null, scrollAds: false, saved: {}, viewed: {} };
  var cache = {};
  try { JSON.parse(localStorage.getItem("slc-saved-ads") || "[]").forEach(function (x) { st.saved[String(x)] = true; }); } catch (e) { /* storage unavailable */ }
  function persistSaved() { try { localStorage.setItem("slc-saved-ads", JSON.stringify(Object.keys(st.saved))); } catch (e) { /* ignore */ } }

  /* ---------- helpers ---------- */
  function safeImg(u) { return /^(images\/|uploads\/|data:image\/(png|jpe?g|webp|gif);base64,)/.test(u || "") ? u : ""; }
  function initials(n) { return String(n || "AD").split(/\s+/).map(function (w) { return w.charAt(0); }).slice(0, 2).join("").toUpperCase() || "AD"; }
  function gradCss(cat) { var g = GRAD[cat] || GRAD.other; return "linear-gradient(135deg," + g[0] + "," + g[1] + ")"; }
  function fmt(n) { return Number(n || 0).toLocaleString("en-NG"); }
  function timeAgo(iso) {
    var d = (Date.now() - new Date(iso).getTime()) / 1000;
    if (!(d >= 0)) return "Recently";
    if (d < 3600) return Math.max(1, Math.round(d / 60)) + " min ago";
    if (d < 86400) return Math.round(d / 3600) + " h ago";
    var n = Math.round(d / 86400);
    return n === 1 ? "Yesterday" : n + " days ago";
  }
  function dateText(iso) {
    try { return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }); } catch (e) { return ""; }
  }
  function phoneDigits(c) {
    var raw = String(c || "").trim();
    if (!/^\+?[\d\s-]{7,20}$/.test(raw)) return "";
    var d = raw.replace(/\D/g, "");
    if (raw.charAt(0) === "+") return d;
    if (d.charAt(0) === "0") return "234" + d.slice(1);
    return d;
  }
  function priceText(a) {
    if (a.price === null || a.price === undefined || a.price === "") return "";
    return naira(a.price) + (a.price_note ? " " + a.price_note : "");
  }
  function tick(v) { return v ? '<span class="vtick" title="Verified SLC student"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></span><span class="sr">Verified seller</span>' : ""; }
  function artHTML(a, cls) {
    var img = safeImg(a.image);
    return img ? '<div class="' + cls + '"><img src="' + esc(img) + '" alt="" loading="lazy"></div>'
      : '<div class="' + cls + '" aria-hidden="true" style="background:linear-gradient(135deg,#f3b13d,#d6512d)">' + esc(initials(a.seller_name)) + "</div>";
  }
  function getJSON(url) {
    return fetch(url, { headers: { Accept: "application/json" }, credentials: "same-origin" }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      if ((r.headers.get("content-type") || "").indexOf("json") < 0) throw new Error("Not JSON");
      return r.json();
    });
  }
  function track(id, type) {
    if (!/^\d+$/.test(String(id))) return;
    try {
      fetch(API + "track.php", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", keepalive: true, body: JSON.stringify({ ad_id: Number(id), type: type }) }).catch(function () { });
    } catch (e) { /* ignore */ }
  }
  function terms(q) { return q.toLowerCase().split(/\s+/).filter(Boolean).slice(0, 5); }
  function hay(a) { return [a.title, a.body, a.seller_name, a.category_name, a.location].join(" ").toLowerCase(); }
  function localAds(ignoreSeller) {
    var t = terms(st.q);
    return ADS.filter(function (a) {
      if (st.cat !== "all" && a.category !== st.cat) return false;
      if (!ignoreSeller && st.seller && String(a.seller_id) !== st.seller) return false;
      var h = hay(a);
      return t.every(function (w) { return h.indexOf(w) >= 0; });
    });
  }
  function localSellers() {
    var counts = {};
    localAds(true).forEach(function (a) { counts[a.seller_id] = (counts[a.seller_id] || 0) + 1; });
    return SELLERS.filter(function (s) { return counts[s.id]; }).map(function (s) {
      return { id: s.id, name: s.name, category: s.category, category_name: CAT_NAME[s.category], location: s.location, verified: s.verified, bio: s.bio, ad_count: counts[s.id] };
    }).sort(function (a, b) { return b.ad_count - a.ad_count; });
  }

  /* ---------- Ads Market page ---------- */
  function renderCats() {
    var box = $("#mkCats");
    if (!box) return;
    box.innerHTML = CATS.map(function (c) {
      return '<button class="chip" type="button" data-mk-cat="' + c.slug + '" aria-pressed="' + (st.cat === c.slug) + '">' + esc(c.name) + "</button>";
    }).join("");
  }
  function sellerCard(s) {
    var on = st.seller === String(s.id);
    return '<article class="sellercard ' + (on ? "on" : "") + '"><div class="top"><span class="sellerav" aria-hidden="true" style="background:' + gradCss(s.category) + '">' + esc(initials(s.name)) + "</span>" +
      '<div><b>' + esc(s.name) + tick(s.verified) + "</b><small>" + esc(s.category_name || CAT_NAME[s.category] || "Seller") + "</small></div></div>" +
      "<small>" + esc(s.bio || s.location || "") + "</small>" +
      '<button class="btn sm ' + (on ? "primary" : "") + '" type="button" data-seller="' + esc(s.id) + '" aria-pressed="' + on + '">' + (on ? "Showing " : "View ") + fmt(s.ad_count) + " ad" + (Number(s.ad_count) === 1 ? "" : "s") + "</button></article>";
  }
  function adCard(a) {
    var price = priceText(a);
    return '<article class="mk-ad">' + artHTML(a, "art") + '<div class="in"><h4>' + esc(a.title) + "</h4>" +
      (a.offer ? '<span class="offer">' + esc(a.offer) + "</span>" : "") +
      "<p>" + esc(a.body) + "</p>" +
      '<div class="mk-meta"><span>' + ic("store", "sm") + esc(a.seller_name) + tick(a.seller_verified) + "</span>" + (a.location ? "<span>" + ic("pin", "sm") + esc(a.location) + "</span>" : "") + "</div>" +
      '<div class="foot"><span class="pr">' + esc(price || "Ask the seller") + '</span><button class="btn primary sm" type="button" data-addetail="' + esc(a.id) + '">See details</button></div></div></article>';
  }
  function renderSkeleton() {
    var g = $("#mkAds");
    if (g && !st.ads.length) g.innerHTML = '<div class="mk-skel"></div><div class="mk-skel"></div><div class="mk-skel"></div>';
  }
  function renderMarket() {
    renderCats();
    var q = st.q.trim();
    var filtered = !!(q || st.cat !== "all" || st.seller);
    var sel = null;
    st.sellers.forEach(function (s) { if (String(s.id) === st.seller) sel = s; });
    $("#mkClear").hidden = !filtered;
    $("#mkSellerCount").textContent = st.sellers.length + (st.sellers.length === 1 ? " seller" : " sellers");
    $("#mkAdsTitle").textContent = sel ? "Ads from " + sel.name : (q ? "Results for \u201C" + q + "\u201D" : "Latest ads");
    $("#mkStatus").textContent = st.ads.length + (st.ads.length === 1 ? " ad" : " ads") + " from " + st.sellers.length + (st.sellers.length === 1 ? " seller" : " sellers") + (q ? " matching \u201C" + q + "\u201D" : "");
    $("#mkSellers").innerHTML = st.sellers.length ? st.sellers.map(sellerCard).join("") : '<p class="mk-count">No sellers match yet.</p>';
    $("#mkAds").innerHTML = st.ads.length ? st.ads.map(adCard).join("") :
      '<div class="mk-empty"><b>Nothing found' + (q ? " for \u201C" + esc(q) + "\u201D" : "") + '</b>Try a shorter word, another category, or post what you are looking for as an ad.<br><button class="btn" type="button" data-mk-clear>Clear filters</button></div>';
    $("#mkNote").textContent = st.live ? "" : "Could not connect to the server. Check your internet and refresh the page.";
    if (st.scrollAds) { st.scrollAds = false; var h = $("#mkAdsTitle"); if (h) h.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }); }
  }
  function load() {
    var my = ++st.req;
    renderSkeleton();
    var base = new URLSearchParams();
    if (st.q.trim()) base.set("q", st.q.trim());
    if (st.cat !== "all") base.set("category", st.cat);
    var adQ = new URLSearchParams(base.toString());
    if (st.seller) adQ.set("seller", st.seller);
    Promise.all([getJSON(API + "ads.php?" + adQ.toString()), getJSON(API + "sellers.php?" + base.toString())]).then(function (r) {
      return { ads: r[0].ads || [], sellers: r[1].sellers || [], live: true };
    }).catch(function () {
      return { ads: localAds(false), sellers: localSellers(), live: false };
    }).then(function (res) {
      if (my !== st.req) return;
      st.ads = res.ads; st.sellers = res.sellers; st.live = res.live;
      res.ads.forEach(function (a) { cache[String(a.id)] = a; });
      renderMarket();
    });
  }
  function showMarket() {
    $("#mkq").value = st.q;
    load();
  }

  /* ---------- Ad details page ---------- */
  function stash(p) {
    cache["my-" + (p.uid || p.id)] = { id: "my-" + (p.uid || p.id), title: p.title, body: p.body, seller_name: p.by, seller_id: "me", seller_verified: false, category: "services", category_name: "Student ad", location: "", contact: p.contact || "", image: p.img || "", offer: "", price: null, views: p.views || 0, posted_at: new Date().toISOString(), pending: !!p.pending, mine: true };
  }
  function loadMine() {
    try {
      JSON.parse(localStorage.getItem("slc-myads") || "[]").forEach(function (o) {
        if (o && o.uid) stash({ uid: o.uid, title: o.title, body: o.body, by: o.by, contact: o.contact, img: o.img, views: o.views, pending: o.pending });
      });
    } catch (e) { /* ignore */ }
  }
  function openAd(id) {
    location.href = "ad.html?id=" + encodeURIComponent(String(id));
  }
  function fetchAd(id) {
    id = String(id);
    var have = cache[id] ? Promise.resolve(cache[id]) :
      (/^\d+$/.test(id) ? getJSON(API + "ads.php?id=" + id).then(function (r) { return r.ad; }).catch(function () { return ADS.filter(function (x) { return String(x.id) === id; })[0]; }) : Promise.resolve(null));
    return have.then(function (a) {
      if (a) cache[id] = a;
      return a;
    });
  }
  function showAd() {
    var root = $("#adroot");
    var a = cache[String(st.adId)];
    if (!a) { root.innerHTML = '<div class="card" style="padding:18px">This ad is not available any more. <button class="btn sm" type="button" data-ad-back>Back to the market</button></div>'; return; }
    var price = priceText(a), digits = phoneDigits(a.contact);
    var msg = encodeURIComponent('Hi, I saw your ad "' + a.title + '" on SLC Ads Market.');
    var saved = !!st.saved[String(a.id)];
    var contactBtns = a.pending ? '<p class="safety">' + ic("lock") + "<span>Only you can see this ad until SLC approves it.</span></p>" :
      '<div class="ctas">' +
      (digits ? '<a class="btn primary" data-ad-contact href="https://wa.me/' + digits + "?text=" + msg + '" target="_blank" rel="noopener noreferrer">' + ic("msg", "sm") + "Message on WhatsApp</a>" +
        '<a class="btn" data-ad-contact href="tel:+' + digits + '">' + ic("phone", "sm") + "Call</a>" :
        (a.contact ? '<span class="chip">' + ic("phone", "sm") + esc(a.contact) + "</span>" : "")) +
      '<button class="btn" type="button" data-ad-save aria-pressed="' + saved + '">' + ic("mark", "sm") + (saved ? "Saved" : "Save") + "</button>" +
      '<button class="btn" type="button" data-ad-share>' + ic("fwd", "sm") + "Share</button>" +
      '<button class="btn" type="button" data-ad-report>' + ic("flag", "sm") + "Report</button></div>";
    var facts = [["Category", a.category_name || CAT_NAME[a.category] || "Other"], ["Location", a.location], ["Price", price], ["Posted", a.posted_at ? timeAgo(a.posted_at) : ""], ["Runs until", a.ends_at ? dateText(a.ends_at) : ""], ["Views", a.views !== undefined ? fmt(a.views) : ""]]
      .filter(function (f) { return f[1]; })
      .map(function (f) { return "<div><dt>" + f[0] + "</dt><dd>" + esc(f[1]) + "</dd></div>"; }).join("");
    root.innerHTML = '<button class="btn sm adback" type="button" data-ad-back>' + ic("back", "sm") + "Back</button>" +
      '<article class="card adview">' + artHTML(a, "hero") + '<div class="inner"><span class="tag">' + (a.mine ? "Sponsored by you" : "Sponsored by a student") + "</span>" +
      '<h2 id="adh" tabindex="-1">' + esc(a.title) + "</h2>" +
      ((a.offer || price) ? '<div class="pricerow">' + (price ? '<span class="price">' + esc(price) + "</span>" : "") + (a.offer ? '<span class="offer">' + esc(a.offer) + "</span>" : "") + "</div>" : "") +
      '<p class="desc">' + esc(a.body) + "</p>" +
      (facts ? '<dl class="facts">' + facts + "</dl>" : "") +
      '<div class="sellerbox"><span class="sellerav" aria-hidden="true" style="background:' + gradCss(a.category) + '">' + esc(initials(a.seller_name)) + '</span><div class="t"><b>' + esc(a.seller_name) + tick(a.seller_verified) + "</b><small>" + (a.seller_verified ? "Verified SLC student" : "SLC student seller") + "</small></div>" +
      (a.seller_id !== "me" ? '<button class="btn sm" type="button" data-seller="' + esc(a.seller_id) + '">All ads</button>' : "") + "</div>" +
      contactBtns +
      '<p class="safety">' + ic("lock") + "<span>Meet in a public place on campus, check the item before you pay, and never send money to someone you have not met.</span></p>" +
      "</div></article>" +
      (a.seller_id !== "me" ? '<div class="adview-more"><div class="mk-sec"><h3>More from this seller</h3></div><div class="mk-grid" id="adMore"></div></div>' : "");
    var h = $("#adh"); if (h) h.focus({ preventScroll: true });
    if (!st.viewed[a.id]) { st.viewed[a.id] = true; track(a.id, "view"); }
    if (a.seller_id !== "me") loadMore(a);
  }
  function loadMore(a) {
    var box = $("#adMore");
    if (!box) return;
    var paint = function (list) {
      var rest = list.filter(function (x) { return String(x.id) !== String(a.id); }).slice(0, 4);
      rest.forEach(function (x) { cache[String(x.id)] = x; });
      var b = $("#adMore"); if (!b) return;
      b.innerHTML = rest.length ? rest.map(adCard).join("") : '<div class="mk-empty">No other ads from this seller yet.</div>';
    };
    getJSON(API + "ads.php?seller=" + encodeURIComponent(a.seller_id) + "&limit=6").then(function (r) { paint(r.ads || []); })
      .catch(function () { paint(ADS.filter(function (x) { return String(x.seller_id) === String(a.seller_id); })); });
  }
  function shareAd(a) {
    var url = location.href.split("#")[0];
    var text = a.title + " - " + a.seller_name + " on SLC Ads Market";
    if (navigator.share) {
      navigator.share({ title: a.title, text: text, url: url }).catch(function () { });
      return;
    }
    var done = function () { toast("Ad details copied."); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text + " " + url).then(done, function () { toast("Copy not allowed here."); });
    else toast("Copy not available in this browser.");
  }

  /* ---------- events ---------- */
  document.addEventListener("click", function (e) {
    var t = e.target, el;
    if ((el = t.closest("[data-addetail]"))) { e.preventDefault(); openAd(el.dataset.addetail); return; }
    if ((el = t.closest("[data-seller]"))) {
      var id = String(el.dataset.seller);
      if (PAGE !== "market") { location.href = "market.html?seller=" + encodeURIComponent(id); return; }
      st.seller = st.seller === id ? null : id;
      st.scrollAds = true;
      load();
      return;
    }
    if ((el = t.closest("[data-mk-cat]"))) { st.cat = el.dataset.mkCat; st.seller = null; load(); return; }
    if (t.closest("[data-mk-clear]")) { st.q = ""; st.cat = "all"; st.seller = null; $("#mkq").value = ""; load(); return; }
    if (t.closest("[data-mk-post]")) { go("create", { q: "?mode=ad" }); return; }
    if (t.closest("[data-ad-back]")) {
      var same = false;
      try { same = !!document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1; } catch (er) { same = false; }
      if (same) history.back(); else location.href = "market.html";
      return;
    }
    var a = cache[String(st.adId)];
    if (!a || PAGE !== "ad") return;
    if (t.closest("[data-ad-contact]")) { track(a.id, "contact"); return; }
    if (t.closest("[data-ad-save]")) {
      var k = String(a.id);
      if (st.saved[k]) { delete st.saved[k]; toast("Removed from saved ads."); } else { st.saved[k] = true; track(a.id, "save"); toast("Ad saved on this device."); }
      persistSaved(); showAd(); return;
    }
    if (t.closest("[data-ad-share]")) { shareAd(a); return; }
    if (t.closest("[data-ad-report]")) { track(a.id, "report"); toast("Thanks. SLC admins will review this ad."); return; }
  });

  var timer = null;
  $("#mkq").addEventListener("input", function (e) {
    st.q = e.target.value; st.seller = null;
    clearTimeout(timer); timer = setTimeout(load, 250);
  });
  $("#mkform").addEventListener("submit", function (e) {
    e.preventDefault(); clearTimeout(timer);
    st.q = $("#mkq").value; st.seller = null; load();
    $("#mkq").blur();
  });

  function searchAds(q) {
    var t = terms(q);
    return getJSON(API + "ads.php?" + new URLSearchParams({ q: q, limit: "20" }).toString())
      .then(function (r) { return r.ads || []; })
      .catch(function () { return ADS.filter(function (a) { var h = hay(a); return t.every(function (w) { return h.indexOf(w) >= 0; }); }); });
  }
  window.SLCMarket = { showMarket: showMarket, showAd: showAd, stash: stash, openAd: openAd, searchAds: searchAds };

  /* each page starts its own part */
  if (PAGE === "market") {
    st.q = (QS.get("q") || "").slice(0, 60);
    var sel = QS.get("seller");
    st.seller = sel && /^\d+$/.test(sel) ? sel : null;
    var cat = QS.get("category");
    if (cat && CAT_NAME[cat]) st.cat = cat;
    st.scrollAds = !!st.seller;
    showMarket();
  } else if (PAGE === "ad") {
    loadMine();
    st.adId = QS.get("id") || "";
    fetchAd(st.adId).then(function (a) { if (!a) st.adId = null; showAd(); });
  }
})();
