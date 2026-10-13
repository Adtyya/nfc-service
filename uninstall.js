// uninstall.js - jalankan untuk hapus service: node uninstall.js
const Service = require("node-windows").Service;
const path = require("path");

const baseDir = process.pkg ? path.dirname(process.execPath) : __dirname;

const svc = new Service({
  name: "NFC-Service",
  description: "NFC Agent Windows Service",
  script: path.join(baseDir, "nfc-agent.js"),
});

svc.on("uninstall", () => {
  console.log("✓ Service uninstalled.");
});

svc.on("error", (err) => {
  console.error("✗ Uninstall failed:", err);
});

svc.uninstall();
