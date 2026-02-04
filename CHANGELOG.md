# Changelog

All notable changes to FilaFlow will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- 🔍 **Search bar** - Find spools by name, material, vendor, or location
- 🏷️ **Filter chips** - Quick filter by material type or location
- 📍 **Location display** - Show spool location on cards
- 💰 **Cost display** - Show estimated value per spool and total inventory value
- 💶 **Value stat card** - Total inventory value in euros (replaces Vendors card)

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
- FAB button no longer appears in empty state (duplicate with "Add first spool" card)

### Changed
- Forked from [Spoolman v0.23.1](https://github.com/Donkie/Spoolman)

---

## Versioning

FilaFlow follows [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0): Breaking changes or major rewrites
- **MINOR** (0.1.0): New features, backwards compatible
- **PATCH** (0.1.1): Bug fixes, backwards compatible

### Version History

| Version | Date       | Spoolman Base | Highlights |
|---------|------------|---------------|------------|
| 0.1.0   | 2026-02-04 | 0.23.1        | Initial fork, mobile dashboard |

[Unreleased]: https://github.com/vmsebas/FilaFlow/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/vmsebas/FilaFlow/releases/tag/v0.1.0
