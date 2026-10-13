# NFC Service

Windows service untuk NFC reader yang mengirim data tap ke API server. Berjalan otomatis saat boot, config bisa diubah dinamis tanpa restart kode (cukup restart service).

## Requirements

- Node.js 18+
- Windows (Service hanya support Windows)
- NFC reader kompatibel dengan `nfc-pcsc`
- Admin access untuk install service

## Setup

### 1. Install Service

**Option A: PowerShell Script (Recommended)**

Buka PowerShell as Administrator:

```powershell
cd D:\code\nfc-service
.\install-service.ps1
```

Default install ke `C:\nfc-service`. Custom path:

```powershell
.\install-service.ps1 -InstallPath "D:\services\nfc"
```

**Option B: Manual**

```powershell
cd D:\code\nfc-service
npm install
node install.js
```

### 2. Verify Install

Cek service terdaftar:

```powershell
Get-Service NFC-Service
```

Output:
```
Status   Name            DisplayName
------   ----            -----------
Stopped  NFC-Service     NFC Agent Windows Service
```

### 3. Start Service

```powershell
net start NFC-Service
```

Atau dari Services app: `services.msc` → cari "NFC-Service" → Start.

Service auto-start saat Windows boot.

## Configuration

Edit `config.json` di folder service install (default: `C:\nfc-service\config.json`):

```json
{
  "API_BASE": "http://localhost:3000",
  "DEVICE_NAME": "NFC-Device-01",
  "HEARTBEAT_INTERVAL": 10000
}
```

**Parameters:**

| Key | Type | Default | Deskripsi |
|-----|------|---------|-----------|
| API_BASE | string | http://localhost:3000 | URL API server |
| DEVICE_NAME | string | hostname | Nama device (kirim ke server) |
| HEARTBEAT_INTERVAL | number | 10000 | Interval status update (ms) |

**Priority:**
1. config.json
2. Environment variable (API_BASE, DEVICE_NAME, HEARTBEAT_INTERVAL)
3. Default value

### Apply Config Changes

Edit `config.json`, lalu restart service:

```powershell
net stop NFC-Service
net start NFC-Service
```

Atau dengan PowerShell:

```powershell
Restart-Service NFC-Service
```

## Usage

### Start Service

```powershell
net start NFC-Service
```

### Stop Service

```powershell
net stop NFC-Service
```

### Restart Service

```powershell
net stop NFC-Service
net start NFC-Service
```

### View Logs

Service logs ke Event Viewer. Buka `eventvwr.msc`:
- Windows Logs → System → cari "NFC-Service"

Atau direct check:

```powershell
Get-EventLog -LogName System -Source Service Control Manager | Where-Object {$_.Message -like "*NFC*"} | Select-Object -First 10
```

### Check Service Status

```powershell
Get-Service NFC-Service
```

## Uninstall Service

**Option A: PowerShell Script**

```powershell
.\uninstall-service.ps1
```

Atau custom path:

```powershell
.\uninstall-service.ps1 -InstallPath "D:\services\nfc"
```

**Option B: Manual**

```powershell
cd C:\nfc-service
node uninstall.js
```

## File Structure

```
C:\nfc-service\                    (atau custom path)
├── nfc-agent.js                  (main service code)
├── config.json                   (dynamic config)
├── install.js                    (service installer)
├── uninstall.js                  (service uninstaller)
├── package.json
├── package-lock.json
└── node_modules\                 (dependencies)
```

## API Integration

Service mengirim POST request ke API server:

### 1. Status Update

**Endpoint:** `POST /api/nfc-status`

**Payload:**
```json
{
  "deviceName": "NFC-Device-01",
  "status": "ready",
  "readerNames": ["Reader 1", "Reader 2"],
  "timestamp": "2026-10-13T04:57:23.807Z"
}
```

**Status values:**
- `starting` - Service baru mulai
- `ready` - Reader terkoneksi
- `no_reader` - Tidak ada reader
- `error` - Error terjadi

**Interval:** Dikirim setiap HEARTBEAT_INTERVAL (default 10s)

### 2. Tap Event

**Endpoint:** `POST /api/nfc-tap`

**Payload:**
```json
{
  "uid": "04A1234567890ABC",
  "type": "ISO14443A",
  "readerName": "Reader 1",
  "timestamp": "2026-10-13T04:57:23.807Z"
}
```

**Dikirim:** Saat card/NFC tag terdeteksi

## Environment Variables

Alternatif config tanpa edit file:

```powershell
# Set environment variable (system-wide)
[Environment]::SetEnvironmentVariable("API_BASE", "http://production:3000", "Machine")
[Environment]::SetEnvironmentVariable("DEVICE_NAME", "NFC-Reader-Lobby", "Machine")
[Environment]::SetEnvironmentVariable("HEARTBEAT_INTERVAL", "15000", "Machine")

# Restart service untuk apply
Restart-Service NFC-Service
```

Atau `.env` file di folder service (jika ada dotenv support):

```
API_BASE=http://production:3000
DEVICE_NAME=NFC-Reader-Lobby
HEARTBEAT_INTERVAL=15000
```

## Troubleshooting

### Service tidak start

1. Cek install:
```powershell
Get-Service NFC-Service
```

2. Cek error di Event Viewer (`eventvwr.msc`)

3. Manual test:
```powershell
cd C:\nfc-service
node nfc-agent.js
```

4. Reinstall:
```powershell
node uninstall.js
node install.js
```

### Reader tidak terdeteksi

1. Pastikan NFC reader terpasang dan driver terinstall
2. Test dengan:
```powershell
node -e "const {NFC} = require('nfc-pcsc'); new NFC().on('reader', r => console.log(r.name))"
```

### API request gagal

1. Cek API_BASE di config.json
2. Pastikan server running
3. Test koneksi:
```powershell
Invoke-WebRequest http://localhost:3000/api/nfc-status
```

### Service crash/restart berkali-kali

1. Cek logs di Event Viewer
2. Cek config.json syntax (valid JSON)
3. Cek node_modules lengkap:
```powershell
dir C:\nfc-service\node_modules | measure
```

## Development

### Run tanpa service (debugging)

```powershell
cd D:\code\nfc-service
npm start
```

### Edit config.json

```json
{
  "API_BASE": "http://localhost:3000",
  "DEVICE_NAME": "NFC-Device-01",
  "HEARTBEAT_INTERVAL": 10000
}
```

### Edit nfc-agent.js

Restart service untuk apply:

```powershell
net stop NFC-Service
net start NFC-Service
```

## Build Standalone EXE

Jika perlu distribusi:

```powershell
npm run build
```

Generate `install.exe` dan `uninstall.exe` (standalone, no Node.js needed untuk pengguna).

## Dependencies

- `nfc-pcsc` - NFC reader library
- `axios` - HTTP client
- `node-windows` - Windows service wrapper

## License

ISC

## Support

1. Cek logs: Event Viewer → System
2. Manual test nfc-agent.js
3. Verify API endpoint reachable
4. Cek config.json valid JSON
