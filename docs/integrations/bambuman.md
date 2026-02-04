# BambuMan Integration

[BambuMan](https://github.com/spuder/BambuMan) is an Android app that reads NFC tags from Bambu Lab filament spools and syncs them with FilaFlow/Spoolman.

## Features

- 📱 Scan Bambu Lab NFC tags
- 🔄 Auto-create filaments and spools in FilaFlow
- 📊 Sync usage data back to the spool
- 🏷️ Read filament color, material, and weight

## Setup

### Prerequisites
- Android phone with NFC capability
- BambuMan app installed
- FilaFlow running and accessible from your phone

### Configuration

1. Open BambuMan app
2. Go to **Settings** → **Spoolman**
3. Enter your FilaFlow URL:
   - **Local network:** `http://192.168.1.XXX:7912`
   - **Tailscale:** `http://100.XX.XX.XX:7912`
4. Test connection

> **Tip:** If your phone and server are on different VLANs, use Tailscale for reliable connectivity.

## Usage

### Scanning a Spool

1. Open BambuMan
2. Hold your phone near the Bambu Lab spool NFC tag (usually on the side)
3. The app reads:
   - Material type (PLA, PETG, etc.)
   - Color name and hex code
   - Spool weight
   - Unique tag ID

### Auto-Sync Behavior

When you scan a spool:

**If the spool doesn't exist:**
- Creates new filament entry (if needed)
- Creates new spool with initial weight
- Sets `first_use_date` to current date (custom feature)

**If the spool exists:**
- Updates usage data
- Shows current remaining weight

## Network Tips

### Same Network
If phone and server are on the same network:
```
http://192.168.1.100:7912
```

### Different VLANs
If you have network segmentation (IoT VLAN, etc.), options:

1. **Tailscale (Recommended)**
   - Install Tailscale on both devices
   - Use Tailscale IP: `http://100.X.X.X:7912`

2. **Port Forwarding**
   - Forward port 7912 on your router
   - Use external IP (less secure)

3. **Firewall Rules**
   - Allow traffic between VLANs on port 7912

## Troubleshooting

### "Connection Failed"
- Check URL is correct (include `http://`)
- Verify FilaFlow is running: `docker ps`
- Test URL in phone browser first
- Check firewall/VLAN settings

### "NFC Not Found"
- Enable NFC in phone settings
- Position tag closer to phone's NFC antenna
- Some phone cases block NFC

### Spool Not Created
- Check FilaFlow logs: `docker logs filaflow`
- Verify API access: `curl http://YOUR_IP:7912/api/v1/spool`

---

## See Also
- [Installation](../installation.md)
- [Managing Spools](../guide/spools.md)
