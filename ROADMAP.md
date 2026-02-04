# 🗺️ FilaFlow Roadmap

Plan de mejoras organizado por fases. Cada fase dura ~1 semana.

---

## Fase 1: Fundamentos (Esta semana)
> Objetivo: Tener el inventario completo y funcional

### 1.1 Inventario inicial
- [ ] Escanear todos los carretes existentes con BambuMan
- [ ] Verificar que cada carrete tiene: nombre, material, color, peso inicial
- [ ] Añadir ubicación a cada carrete (estante/caja)

### 1.2 Campos de coste ✅
- [x] Añadir campo `price` a filamentos en FilaFlow (ya existía en Spoolman)
- [x] Crear script para calcular coste por carrete
- [x] Mostrar coste en dashboard

### 1.3 Mejoras UI ✅
- [x] Añadir ubicación visible en las cards del dashboard
- [x] Filtro por ubicación/material
- [x] Búsqueda de carretes

**Entregables:**
- [ ] Inventario 100% escaneado
- [x] Costes registrados
- [x] Dashboard con filtros

---

## Fase 2: Automatización (Semana 2) ✅
> Objetivo: Alertas inteligentes y reportes

### 2.1 Alertas mejoradas ✅
- [x] Alerta cuando carrete < 20%
- [x] Alerta cuando carrete lleva > 6 meses abierto
- [x] Resumen semanal de inventario (lunes 9:00)

### 2.2 Informes automáticos ✅
- [x] Script de informe mensual:
  - Consumo total (kg)
  - Gasto total (€)
  - Top 3 materiales usados
  - Carretes agotados
- [x] Envío automático a Telegram (día 1 de cada mes, 10:00)

### 2.3 API y webhooks
- [ ] Endpoint para registrar uso desde scripts externos
- [ ] Webhook al crear/agotar carrete

**Entregables:**
- [x] Alertas funcionando
- [x] Informe mensual automatizado

---

## Fase 3: BambuMan Custom (Semana 3)
> Objetivo: APK personalizado compilado y funcionando

### 3.1 Compilar APK
- [ ] Opción A: Instalar .NET SDK + MAUI localmente
- [ ] Opción B: Configurar GitHub Actions para build automático
- [ ] Generar APK firmado

### 3.2 Mejoras BambuMan
- [ ] first_use_date automático ✅ (ya implementado)
- [ ] Campo precio en settings
- [ ] Selector de ubicación al escanear
- [ ] Historial de escaneos recientes

### 3.3 Testing
- [ ] Probar con 5+ carretes diferentes
- [ ] Verificar sync con FilaFlow
- [ ] Documentar bugs encontrados

**Entregables:**
- APK instalable en móvil
- Funcionalidades custom funcionando

---

## Fase 4: Integraciones (Semana 4)
> Objetivo: Conectar con el ecosistema

### 4.1 Home Assistant
- [ ] Sensores de inventario (total kg, carretes, stock bajo)
- [ ] Automatizaciones (luz roja si stock crítico)
- [ ] Card personalizada para dashboard HA

### 4.2 Bambu Lab MQTT (experimental)
- [ ] Conectar a impresora via MQTT
- [ ] Leer uso de filamento en tiempo real
- [ ] Actualizar peso automáticamente en FilaFlow

### 4.3 Báscula IoT (opcional)
- [ ] ESP32 + célula de carga
- [ ] API REST para reportar peso
- [ ] Calibración automática

**Entregables:**
- Dashboard en Home Assistant
- Tracking automático (si MQTT funciona)

---

## Fase 5: Pulido (Semana 5+)
> Objetivo: Experiencia completa

### 5.1 UX
- [ ] Dark mode en dashboard
- [ ] Gráficas de consumo histórico
- [ ] Vista calendario (cuándo se usó cada carrete)

### 5.2 Extras
- [ ] Generador de etiquetas QR para carretes sin NFC
- [ ] Modo bulk scan (varios carretes seguidos)
- [ ] Export/import de base de datos
- [ ] Multi-idioma (ES/EN)

### 5.3 Documentación
- [ ] Guía completa de usuario
- [ ] Video tutorial
- [ ] Publicar en comunidades 3D printing

**Entregables:**
- Producto pulido
- Documentación completa

---

## Milestones

| Versión | Fecha objetivo | Contenido |
|---------|---------------|-----------|
| v0.1.0  | ✅ 2026-02-04 | Dashboard móvil, fork inicial |
| v0.2.0  | ✅ 2026-02-04 | Costes, filtros, ubicaciones, búsqueda |
| v0.3.0  | 2026-02-11    | Alertas, informes mensuales |
| v0.4.0  | 2026-02-18    | BambuMan APK custom |
| v0.5.0  | 2026-02-25    | Home Assistant integration |
| v1.0.0  | 2026-03-15    | Release estable completo |

---

## Prioridades Actuales

```
🔴 AHORA:     Escanear inventario + campos de coste
🟡 PRÓXIMO:   Filtros en dashboard + informes
🟢 DESPUÉS:   BambuMan APK + integraciones
```

---

## Notas

- Cada fase se puede ajustar según disponibilidad
- Las integraciones MQTT son experimentales (dependen de Bambu Lab)
- Home Assistant es opcional pero recomendado

Última actualización: 2026-02-04
