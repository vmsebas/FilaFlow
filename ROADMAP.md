# 🗺️ FilaFlow Roadmap

Plan de mejoras organizado por fases.

---

## ✅ Completado

### Fase 1: Dashboard Móvil (v0.1.0)
- [x] UI moderna con cards
- [x] Progress bars de uso
- [x] Agrupación por material
- [x] FAB para añadir rápido

### Fase 2: Búsqueda y Costes (v0.2.0)
- [x] Barra de búsqueda
- [x] Filtros por material/ubicación
- [x] Mostrar coste por carrete
- [x] Valor total de inventario
- [x] Import de facturas (texto)
- [x] Alertas de stock bajo
- [x] Informes automáticos (diario/semanal/mensual)

### Fase 3: Import Mejorado (v0.3.0)
- [x] Upload de PDF de facturas
- [x] Parser para refills (SPLFREE)
- [x] Colores en español
- [x] Añadir directo sin modal
- [x] Verificación pendiente para spools de factura
- [x] UI compacta en filas

---

## 🚧 En Progreso

### Fase 4: Stock General (v0.4.0)
> Objetivo: Trackear TODO lo comprado, no solo filamentos

#### 4.1 Parser expandido
- [ ] Detectar TODOS los productos de factura (no solo filamentos)
- [ ] Categorización automática por SKU:
  - `PF###` → Impresoras
  - `A##-...-SPL` → Filamentos
  - `FAP###` → Build Plates
  - `FAH###` → Hotends
  - `RSP###` → Spools vacíos
  - `B-###`, `AMS###` → Accesorios
  - Otros → Genérico

#### 4.2 Base de datos
- [ ] Nueva tabla `products`:
  ```
  id, name, sku, category, price, quantity, location, 
  purchase_date, invoice_number, notes
  ```
- [ ] Categorías: Máquina, Accesorio, Consumible, Repuesto

#### 4.3 UI de Stock
- [ ] Nueva página `/stock`
- [ ] Vista por categorías
- [ ] Búsqueda y filtros
- [ ] Añadir/editar productos manualmente

#### 4.4 Lógica de duplicados
- [ ] SKU único (no duplicar al reimportar)
- [ ] Detectar "ya existe" y ofrecer actualizar precio

**Entregables:**
- Parser que detecta todo
- Tabla de productos
- Página de stock

---

## 📋 Planificado

### Fase 5: Links de Compra (v0.5.0)
- [ ] Guardar URL del producto al importar
- [ ] Botón "Comprar más" cuando stock bajo
- [ ] Construcción de URL desde SKU/nombre

### Fase 6: BambuMan Custom (v0.6.0)
- [ ] Compilar APK con modificaciones
- [ ] first_use_date automático
- [ ] Selector de ubicación al escanear
- [ ] Precio en configuración

### Fase 7: Integraciones (v0.7.0)
- [ ] Home Assistant sensors
- [ ] Bambu Lab MQTT (experimental)
- [ ] Webhooks para automatización

### Fase 8: Pulido (v1.0.0)
- [ ] Gráficas de consumo
- [ ] Export/import de datos
- [ ] Multi-idioma completo
- [ ] Documentación completa

---

## Milestones

| Versión | Estado | Contenido |
|---------|--------|-----------|
| v0.1.0  | ✅ | Dashboard móvil |
| v0.2.0  | ✅ | Búsqueda, filtros, costes, alertas |
| v0.3.0  | ✅ | Invoice PDF, español, añadir directo |
| v0.4.0  | 🚧 | Stock general (máquinas, accesorios) |
| v0.5.0  | 📋 | Links de compra |
| v0.6.0  | 📋 | BambuMan APK custom |
| v0.7.0  | 📋 | Integraciones |
| v1.0.0  | 📋 | Release estable |

---

## Prioridades Actuales

```
🔴 AHORA:     Fase 4 - Stock general
🟡 PRÓXIMO:   Fase 5 - Links de compra
🟢 DESPUÉS:   Fase 6 - BambuMan APK
```

---

## Decisiones de Diseño

### SKU como identificador único
- Cada producto tiene un SKU único de Bambu Lab
- Reimportar factura no duplica productos
- Si SKU existe → mostrar como "ya en inventario"

### Categorías de productos
| Categoría | Se gasta | Tracking |
|-----------|----------|----------|
| Filamento | Sí (gramos) | Spools, NFC, uso |
| Máquina | No | Ubicación, garantía |
| Accesorio | Poco | Ubicación, precio |
| Consumible | Sí (cantidad) | Stock mínimo |
| Repuesto | Sí (cantidad) | Stock mínimo |

### Flujo de factura
1. Subir PDF → Parser detecta todo
2. Mostrar por categorías
3. Click "Añadir todo" → Stock actualizado
4. Sin duplicados (SKU único)

---

Última actualización: 2026-02-04
