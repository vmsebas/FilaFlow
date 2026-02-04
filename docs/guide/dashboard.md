# Mobile Dashboard

FilaFlow features a modern, mobile-optimized dashboard designed for quick inventory checks and management on your phone.

## Overview

The dashboard shows:

### Stats Bar
Three quick-access cards at the top:
- **🗃️ Bobinas** - Total spool count → tap to see all spools
- **🧪 Filamentos** - Filament types → tap to manage catalog
- **🏪 Marcas** - Vendor count → tap to see vendors

### Low Stock Alert
When any spool falls below 20%, a warning banner appears:
> ⚠️ 3 bobina(s) con stock bajo (<20%)

### Spool Cards
Your spools organized by material type (PLA, PETG, etc.):

```
┌─────────────────────────────────┐
│ 🟦 │ PLA Matte White           │
│    │ PLA • Bambu Lab           │
│    │ ████████░░░░░ 750g (75%)  │
└─────────────────────────────────┘
```

Each card shows:
- **Color indicator** - Visual swatch matching filament color
- **Name** - Filament name
- **Material & Vendor** - Quick identification
- **Progress bar** - Remaining percentage with weight
  - 🟢 Green: > 50%
  - 🟡 Yellow: 20-50%
  - 🔴 Red: < 20%

### Floating Action Button (FAB)
The blue **+** button in the bottom-right corner:
- Quick access to add new spools
- Always visible when scrolling
- Only appears when you have spools (otherwise shows "Add first spool" card)

## Empty State

When you have no spools yet, you'll see a centered card:
```
┌─────────────────┐
│      ➕        │
│ Añadir primera │
│    bobina      │
└─────────────────┘
```

Tap to add your first spool.

## Navigation

- **Tap a spool card** → View/edit spool details
- **Tap a stat card** → Go to that section
- **Pull down** → Refresh data
- **FAB (+)** → Add new spool

## Customization

The dashboard automatically detects your device:
- **Mobile** (< 768px) → Shows modern card dashboard
- **Desktop** → Shows classic Spoolman interface

---

## See Also
- [Managing Spools](spools.md)
- [Low Stock Alerts](alerts.md)
