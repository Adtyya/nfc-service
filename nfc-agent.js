// NFC Agent - runs locally with nfc-pcsc, sends to Next.js API
const { NFC } = require("nfc-pcsc");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Baca config.json, fallback ke env, fallback ke default
const loadConfig = () => {
  const configPath = path.join(__dirname, "config.json");
  if (fs.existsSync(configPath)) {
    try {
      return JSON.parse(fs.readFileSync(configPath, "utf8"));
    } catch (err) {
      console.error("Failed to parse config.json:", err.message);
      return {};
    }
  }
  return {};
};

const config = loadConfig();
const API_BASE = config.API_BASE || process.env.API_BASE || "http://localhost:3000";
const DEVICE_NAME = config.DEVICE_NAME || process.env.DEVICE_NAME || require("os").hostname();
const HEARTBEAT_INTERVAL = config.HEARTBEAT_INTERVAL || 10_000;

console.log("RUNNING");

const nfc = new NFC();

let currentReaders = [];

// Update status ke server
async function updateStatus(status, readerNames = []) {
  try {
    await axios.post(`${API_BASE}/api/nfc-status`, {
      deviceName: DEVICE_NAME,
      status,
      readerNames,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to update status:", err.message);
  }
}

// Kirim tap ke server
async function sendTap(uid, type, readerName) {
  try {
    await axios.post(`${API_BASE}/api/nfc-tap`, {
      uid,
      type,
      readerName,
      timestamp: new Date().toISOString(),
    });
    console.log(`✓ Tap sent: ${uid}`);
  } catch (err) {
    console.error("Failed to send tap:", err.message);
  }
}

nfc.on("reader", (reader) => {
  console.log(`📖 Reader connected: ${reader.name}`);
  currentReaders.push(reader.name);
  updateStatus("ready", currentReaders);

  reader.on("card", async (card) => {
    console.log(`💳 Card detected: ${card.uid}`);
    await sendTap(card.uid, card.type, reader.name);
  });

  reader.on("card.off", () => {
    console.log("💳 Card removed");
  });

  reader.on("error", (err) => {
    console.error(`❌ Reader error (${reader.name}):`, err.message);
  });

  reader.on("end", () => {
    console.log(`📖 Reader disconnected: ${reader.name}`);
    currentReaders = currentReaders.filter((n) => n !== reader.name);
    updateStatus(
      currentReaders.length > 0 ? "ready" : "no_reader",
      currentReaders,
    );
  });
});

nfc.on("error", (err) => {
  console.error("❌ NFC error:", err.message);
  updateStatus("error", currentReaders);
});

// Heartbeat berkala
setInterval(() => {
  const status = currentReaders.length > 0 ? "ready" : "no_reader";
  updateStatus(status, currentReaders);
}, HEARTBEAT_INTERVAL);

updateStatus("starting", []);
console.log(`🚀 NFC Agent started for device: ${DEVICE_NAME}`);
console.log(`📡 API endpoint: ${API_BASE}`);
