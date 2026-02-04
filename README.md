# 🧵 FilaFlow

Modern filament inventory manager for 3D printing.

**FilaFlow** is a fork of [Spoolman](https://github.com/Donkie/Spoolman) with enhanced mobile UI and additional features for managing your 3D printing filament inventory.

## ✨ Features

### From Spoolman
- Track your filament spools and their usage
- Manage vendors and filament types
- Integration with popular 3D printing software (OctoPrint, Klipper, etc.)
- REST API for custom integrations

### FilaFlow Enhancements
- 📱 **Modern mobile dashboard** - Card-based design optimized for phones
- 🎨 **Color-coded spool cards** - Visual identification at a glance
- 📊 **Progress bars** - See remaining filament instantly
- ⚠️ **Low stock alerts** - Never run out mid-print
- 🏷️ **Material grouping** - Spools organized by type (PLA, PETG, etc.)
- ➕ **Floating action button** - Quick add from anywhere

## 📸 Screenshots

*Coming soon*

## 🚀 Installation

### Docker (Recommended)

```yaml
services:
  filaflow:
    image: ghcr.io/vmsebas/filaflow:latest
    container_name: filaflow
    restart: unless-stopped
    ports:
      - "7912:8000"
    volumes:
      - ./data:/home/app/.local/share/spoolman
    environment:
      - TZ=Europe/Lisbon
```

### From Source

```bash
git clone https://github.com/vmsebas/FilaFlow.git
cd FilaFlow
# Follow Spoolman's installation guide
```

## 🔗 Integrations

FilaFlow is compatible with all Spoolman integrations:
- **BambuMan** - NFC tag reading for Bambu Lab filaments
- **OctoPrint** - Via Spoolman plugin
- **Klipper/Moonraker** - Native support
- **Home Assistant** - Via REST API

## 🙏 Credits

- [Spoolman](https://github.com/Donkie/Spoolman) by Donkie - The original project
- All Spoolman contributors

## 📄 License

MIT License - Same as Spoolman
