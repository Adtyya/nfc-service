// install.js - jalankan sekali: node install.js
const Service = require("node-windows").Service;
const path = require("path");

// Saat jadi exe (pkg), __dirname = snapshot virtual. Pakai folder exe.
const baseDir = process.pkg ? path.dirname(process.execPath) : __dirname;

const svc = new Service({
  name: "NFC-Service",
  description: "NFC Agent Windows Service",
  script: path.join(baseDir, "nfc-agent.js"),
  nodeOptions: ["--max-old-space-size=4096"],
  env: [
    {
      name: "NODE_ENV",
      value: "production",
    },
  ],
});

svc.on("install", () => {
  console.log("✓ Service installed. Starting...");
  svc.start();
});

svc.on("alreadyinstalled", () => {
  console.log("✓ Service already installed.");
});

svc.on("start", () => {
  console.log("✓ Service started.");
});

svc.on("error", (err) => {
  console.error("✗ Installation failed:", err);
});

svc.install();
