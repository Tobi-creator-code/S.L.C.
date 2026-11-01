/* Admin page: sign in (or create an admin account with the sign-up code), then approve or reject paid ads.
   Talks to api/admin_login.php, api/admin_register.php, api/admin_ads.php and api/admin_users.php. */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };

  function api(path, body) {
    var opt = body ? { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify(body) } : { credentials: "same-origin" };
    return fetch("api/" + path, opt).then(function (r) {
      if ((r.headers.get("content-type") || "").indexOf("json") < 0) throw new Error("The server is not reachable.");
      return r.json().then(function (j) { j._status = r.status; return j; });
    });
  }
  function show(loggedIn) { $("#login").hidden = loggedIn; $("#register").hidden = true; $("#list").hidden = !loggedIn; }

  var tab = "ads", filter = "waiting";
  function load() { if (tab === "students") loadStudents(); else loadAds(); }

  function loadAds() {
    api("admin_ads.php").then(function (j) {
      if (j._status === 401) { show(false); return; }
      show(true);
      var ads = j.ads || [];
      $("#ads").innerHTML = ads.length ? ads.map(function (a) {
        return '<article class="adm-card" data-id="' + esc(a.id) + '"><h2>' + esc(a.title) + "</h2>" +
          '<p class="adm-meta">' + esc(a.seller) + " \u00b7 " + esc(a.package) + " \u00b7 \u20A6" + Number(a.amount_naira).toLocaleString("en-NG") + " paid \u00b7 contact " + esc(a.contact || "none") + "</p>" +
          "<p>" + esc(a.body) + "</p>" +
          '<div class="adm-row"><button class="btn primary" type="button" data-act="approve">Approve</button><button class="btn" type="button" data-act="ask">Reject\u2026</button></div></article>';
      }).join("") : '<p class="adm-meta">Nothing is waiting. New paid ads appear here.</p>';
    }).catch(function (e) { show(false); $("#loginMsg").textContent = e.message; });
  }

  $("#go").addEventListener("click", function () {
    $("#loginMsg").textContent = "";
    api("admin_login.php", { email: $("#em").value.trim(), password: $("#pw").value }).then(function (j) {
      if (j.ok) { $("#pw").value = ""; load(); } else { $("#loginMsg").textContent = j.error || "Could not sign in."; }
    }).catch(function (e) { $("#loginMsg").textContent = e.message; });
  });
  $("#showReg").addEventListener("click", function () { $("#login").hidden = true; $("#register").hidden = false; });
  $("#backLogin").addEventListener("click", function () { $("#register").hidden = true; $("#login").hidden = false; });
  $("#goReg").addEventListener("click", function () {
    $("#regMsg").textContent = "";
    api("admin_register.php", { email: $("#rem").value.trim(), password: $("#rpw").value, code: $("#rcd").value }).then(function (j) {
      if (j.ok) { $("#rpw").value = ""; $("#rcd").value = ""; load(); } else { $("#regMsg").textContent = j.error || "Could not create the account."; }
    }).catch(function (e) { $("#regMsg").textContent = e.message; });
  });
  $("#refresh").addEventListener("click", load);

  function setTab(t) {
    tab = t;
    $("#ads").hidden = t !== "ads"; $("#students").hidden = t !== "students";
    $("#tabAds").classList.toggle("primary", t === "ads"); $("#tabStu").classList.toggle("primary", t === "students");
    load();
  }
  $("#tabAds").addEventListener("click", function () { setTab("ads"); });
  $("#tabStu").addEventListener("click", function () { setTab("students"); });

  var LABEL = { unverified: "Skipped the ID check", needs_review: "ID needs a person to look at it", auto_matched: "ID matched automatically", verified: "Verified" };
  function loadStudents() {
    api("admin_users.php?filter=" + filter).then(function (j) {
      if (j._status === 401) { show(false); return; }
      show(true);
      var us = j.users || [];
      $("#stuList").innerHTML = us.length ? us.map(function (u) {
        var when = u.created_at ? new Date(u.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "";
        var btns = u.verification === "verified" ? "" : '<button class="btn primary" type="button" data-act="verify">Verify</button>';
        btns += '<button class="btn" type="button" data-act="decline">Decline and delete</button>';
        return '<article class="adm-card" data-uid="' + esc(u.id) + '" data-name="' + esc(u.full_name) + '"><h2>' + esc(u.full_name) + "</h2>" +
          '<p class="adm-meta">@' + esc(u.username) + " \u00b7 " + esc(u.email || "no email") + "</p>" +
          '<p class="adm-meta">' + esc(u.school || "") + " \u00b7 " + esc(u.department || "") + " \u00b7 admitted " + esc(u.admission_year || "?") + (u.admission_no ? " \u00b7 ID no. " + esc(u.admission_no) : "") + "</p>" +
          '<p class="adm-meta">' + esc(LABEL[u.verification] || u.verification) + " \u00b7 joined " + esc(when) + '</p><div class="adm-row">' + btns + "</div></article>";
      }).join("") : '<p class="adm-meta">' + (filter === "verified" ? "No verified students yet." : "Nobody is waiting. New sign-ups appear here.") + "</p>";
    }).catch(function (e) { show(false); $("#loginMsg").textContent = e.message; });
  }
  document.querySelectorAll("[data-filter]").forEach(function (b) {
    b.addEventListener("click", function () {
      filter = b.dataset.filter;
      document.querySelectorAll("[data-filter]").forEach(function (x) { x.classList.toggle("primary", x === b); });
      loadStudents();
    });
  });
  $("#stuList").addEventListener("click", function (e) {
    var b = e.target.closest("[data-act]");
    if (!b) return;
    var card = b.closest("[data-uid]"), id = Number(card.dataset.uid), name = card.dataset.name;
    if (b.dataset.act === "decline" && !confirm("Decline " + name + "? They are signed out straight away and their account is deleted. This cannot be undone.")) return;
    b.disabled = true;
    api("admin_users.php", { action: b.dataset.act, user_id: id }).then(function (j) {
      if (j.ok) { card.remove(); if (!$("#stuList .adm-card")) loadStudents(); } else { b.disabled = false; alert(j.error || "Could not save."); }
    }).catch(function (err) { b.disabled = false; alert(err.message); });
  });

  $("#ads").addEventListener("click", function (e) {
    var b = e.target.closest("[data-act]");
    if (!b) return;
    var card = b.closest("[data-id]"), id = Number(card.dataset.id);
    if (b.dataset.act === "ask") {
      card.querySelector(".adm-row").insertAdjacentHTML("beforebegin", '<div class="adm-form"><label>Reason (the student sees this)</label><input class="why" maxlength="300"></div>');
      b.dataset.act = "reject"; b.textContent = "Send rejection"; return;
    }
    var body = { action: b.dataset.act, ad_id: id };
    if (b.dataset.act === "reject") body.reason = card.querySelector(".why").value;
    b.disabled = true;
    api("admin_ads.php", body).then(function (j) {
      if (j.ok) { card.remove(); if (!$("#ads .adm-card")) load(); } else { b.disabled = false; alert(j.error || "Could not save."); }
    }).catch(function (err) { b.disabled = false; alert(err.message); });
  });

  load();
})();
