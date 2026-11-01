/* Browser side of the real-time service (see realtime/ and api/realtime_token.php).
   It does nothing until window.SLC_REALTIME.url is set in js/realtime-config.js.

   Events other scripts can listen for (all on window, details in event.detail):
     slc:presence  {snapshot, online:[ids], offline:[ids]}  or  {uid, online}
     slc:msg       {from, fromName, id, chat, text, at}
     slc:seen      {from, chat, upTo, at}
     slc:typing    {from, chat}
     slc:notify    {title, body, url, at}   (also shown as a pop-up automatically)
   Methods:  SLCRealtime.send({t:"msg", to, id, chat, text})  .seen(to, chat, upTo)
             .typing(to, chat)  .watch([ids])  .connected() */
(function () {
  "use strict";
  var A = window.SLC, cfg = window.SLC_REALTIME || {};
  if (!A || !cfg.url || A.PAGE === "login") return;

  var ws = null, delay = 1000, stopped = false, watching = [], queue = [];

  function fire(name, detail) { window.dispatchEvent(new CustomEvent("slc:" + name, { detail: detail })); }

  function open(token) {
    ws = new WebSocket(cfg.url + "?token=" + encodeURIComponent(token));
    ws.onopen = function () {
      delay = 1000;
      if (watching.length) ws.send(JSON.stringify({ t: "watch", uids: watching }));
      while (queue.length) ws.send(queue.shift());
    };
    ws.onmessage = function (e) {
      var m; try { m = JSON.parse(e.data); } catch (err) { return; }
      if (!m || typeof m.t !== "string") return;
      if (m.t === "notify") { A.toast(String(m.title) + ": " + String(m.body)); }
      if (m.t === "hello" || m.t === "pong" || m.t === "sent" || m.t === "error") { fire(m.t, m); return; }
      fire(m.t, m);
    };
    ws.onclose = function () { ws = null; if (!stopped) retry(); };
    ws.onerror = function () { try { ws.close(); } catch (err) { /* ignore */ } };
  }

  function retry() {
    var wait = Math.min(30000, delay) * (0.7 + Math.random() * 0.6);
    delay = Math.min(30000, delay * 2);
    setTimeout(connect, wait);
  }

  function connect() {
    if (stopped) return;
    fetch("api/realtime_token.php", { credentials: "same-origin" }).then(function (r) {
      if (r.status === 401) { stopped = true; throw new Error("not signed in"); }
      if (!r.ok || (r.headers.get("content-type") || "").indexOf("json") < 0) throw new Error("not available");
      return r.json();
    }).then(function (j) { if (j && j.token) open(j.token); else throw new Error("no token"); })
      .catch(function () { if (!stopped) retry(); });
  }

  function send(obj) {
    var s = JSON.stringify(obj);
    if (ws && ws.readyState === 1) ws.send(s); else if (queue.length < 20) queue.push(s);
  }

  window.SLCRealtime = {
    send: send,
    seen: function (to, chat, upTo) { send({ t: "seen", to: String(to), chat: String(chat), upTo: String(upTo) }); },
    typing: function (to, chat) { send({ t: "typing", to: String(to), chat: String(chat) }); },
    watch: function (ids) { watching = ids.map(String).slice(0, 200); send({ t: "watch", uids: watching }); },
    connected: function () { return !!ws && ws.readyState === 1; }
  };

  addEventListener("pagehide", function () { stopped = true; if (ws) ws.close(); });
  connect();
})();
