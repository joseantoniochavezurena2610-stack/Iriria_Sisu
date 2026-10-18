# Plan — Sensores y hardware (Ing. mecatrónica)

**Misión:** un nodo físico que mida humedad de suelo y clima de la parcela, que funcione en la demo aunque falle el wifi y cuyos números sean creíbles.

## Componentes
ESP32 · sensor capacitivo de humedad de suelo (v1.2 o similar) · DHT22 · caja/maceta de demo · cable USB/batería. Cotizar en CR y pasar el costo a Economía.

## Antes del evento
| Prioridad | Tarea | Entregable |
|---|---|---|
| 🔴 | Lectura estable del capacitivo y del DHT22 (promediar 10 lecturas, descartar picos) | Firmware en `hardware/firmware/` |
| 🔴 | **Calibración** con suelo real junto con Ciencia: muestra seca al horno vs. saturada + 3 puntos intermedios pesados (método gravimétrico) | Curva lectura → % humedad volumétrica en `hardware/calibracion.md` |
| 🔴 | Acordar formato del mensaje con Integración, p. ej. `{"nodo":"n1","t":...,"humedad_suelo_pct":..,"temp_c":..,"hr_pct":..}` | Contrato en `hardware/README.md` |
| 🟠 | Envío por HTTP (o MQTT) a la app; **modo respaldo**: guardar lecturas y poder reenviarlas por USB/serial | Probado sin internet |
| 🟡 | Maceta de demo con dos estados (seco y regado) para mostrar el cambio en vivo | Montaje listo |

## Durante las 48 h
- **H0-12:** nodo enviando datos al endpoint de prueba.
- **H12-30:** app recibe la lectura y la muestra junto al dato regional.
- **H30-36:** ensayo de demo: regar la maceta → la app cambia el aviso.
- **H36+:** video de respaldo del sensor funcionando.

## Mensaje clave para el pitch
"El satélite ve la región; el sensor ve tu parcela." El sensor **no valida** SMAP; dice si tu finca está más seca o más húmeda que su región.

## Riesgos
- Sensores capacitivos baratos varían entre unidades → calibrar **cada** unidad.
- La corrosión no es problema en la demo, pero mencionarlo como límite para campo.
