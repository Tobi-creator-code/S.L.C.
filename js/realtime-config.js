/* Real-time features (online dots, "seen", typing, pop-up notifications).
   Leave url empty to switch them off. When the Node service is running, set it, for example:
     url: "wss://your-site.com/ws"          (production, behind nginx; see docker/nginx.conf)
     url: "ws://localhost:8081/ws"          (local testing) */
window.SLC_REALTIME = { url: "" };
