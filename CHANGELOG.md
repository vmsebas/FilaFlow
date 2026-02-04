# Changelog

All notable changes to FilaFlow will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- 📦 **Stock general** - Inventario de máquinas, accesorios y consumibles (no solo filamentos)
- 🔗 **Links de compra** - Enlace directo a tienda Bambu Lab cuando stock bajo
- 🏷️ **Categorización automática** - Detectar tipo de producto por SKU

---

## [0.3.0] - 2026-02-04

### Added
- 📄 **Invoice PDF Upload** - Subir facturas PDF directamente (antes solo texto)
- 🇪🇸 **Soporte español** - Parser detecta colores en español (Rojo caramelo, Azul marino, etc.)
- 🔄 **Refill support** - Parser detecta filamentos SPLFREE (refills sin bobina)
- ✅ **Verificación pendiente** - Spools añadidos desde factura quedan marcados como "pendiente escanear"
- 🎯 **Añadir directo** - Click en "+" añade inmediatamente (sin modal)
- 📦 **Añadir todos** - Botón para añadir todos los filamentos de una factura
- ✨ **Estado de éxito** - Después de añadir, muestra confirmación con link al dashboard
- 🔍 **Debug endpoint** - `/api/v1/invoice/parse-pdf-debug` para diagnóstico

### Changed
- 📱 **UI compacta** - Lista de filamentos en filas (una línea por item)
- 🎨 **Colores mejorados** - Mapa de colores expandido (inglés + español)
- 🏷️ **Títulos en español** - "Pendiente llegada", "En inventario", etc.
- 🔧 **Dockerfile fix** - Orden correcto de COPY para incluir cliente actualizado

### Fixed
- 🐛 **Duplicados en dashboard** - Spools pendientes ya no aparecen duplicados
- 🐛 **Precios incorrectos** - Parser extrae precio final correcto (después de descuentos)
- 🐛 **SKU con espacios** - Parser normaliza SKUs de PDF con saltos de línea

---

## [0.2.0] - 2026-02-04

### Added
- 🔍 **Search bar** - Find spools by name, material, vendor, or location
- 🏷️ **Filter chips** - Quick filter by material type or location
- 📍 **Location display** - Show spool location on cards
- 💰 **Cost display** - Show estimated value per spool and total inventory value
- 💶 **Value stat card** - Total inventory value in euros (replaces Vendors card)
- 🧹 **Clear filters button** - Reset all filters with one tap
- 📱 **Click to edit** - Tap any spool card to edit it directly
- 📄 **Invoice Import page** - Parse Bambu Lab invoices (text only)
- 🔌 **Invoice API** - `/api/v1/invoice/parse` endpoint
- 🚨 **Stock alerts script** - Daily alerts for low stock
- 📊 **Monthly report script** - Inventory report on 1st of month
- 📅 **Weekly summary script** - Weekly overview every Monday
- ⏰ **Automated cron jobs** - Reports via OpenClaw

### Changed
- Dashboard header renamed from "Mi Inventario" to "FilaFlow"
- Stats row now shows total inventory value instead of vendor count

---

## [0.1.0] - 2026-02-04

### Added
- 🎨 **Modern mobile dashboard** - New card-based UI optimized for phones
  - Color-coded spool cards with visual indicators
  - Progress bars showing remaining filament percentage
  - Stats cards for spools, filaments, and vendors count
  - Low stock alert banner (< 20% remaining)
  - Material grouping (PLA, PETG, etc.)
  - Floating action button (FAB) for quick add
- 📱 **Mobile UI optimizations** - Improved touch targets and responsive design
- 📝 **FilaFlow branding** - New README and project identity

### Fixed
- FAB button no longer appears in empty state

### Changed
- Forked from [Spoolman v0.23.1](https://github.com/Donkie/Spoolman)

---

## Versioning

FilaFlow follows [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0): Breaking changes or major rewrites
- **MINOR** (0.X.0): New features, backwards compatible
- **PATCH** (0.X.X): Bug fixes, backwards compatible

| Version | Date       | Highlights |
|---------|------------|------------|
| 0.3.0   | 2026-02-04 | Invoice PDF upload, Spanish support, direct add |
| 0.2.0   | 2026-02-04 | Search, filters, costs, invoice text import |
| 0.1.0   | 2026-02-04 | Initial fork, mobile dashboard |

[Unreleased]: https://github.com/vmsebas/FilaFlow/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/vmsebas/FilaFlow/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/vmsebas/FilaFlow/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/vmsebas/FilaFlow/releases/tag/v0.1.0
