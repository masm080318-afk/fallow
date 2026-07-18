# Soilify Node — Build, Flash & Deploy Manual

Everything needed to build a field node, flash it, test it, and put it safely
in someone's field. Written from real problems hit during the first build.

---

## 1. What you're building

Two devices:

| Device | Where it lives | Job |
|---|---|---|
| **Field node** | In the soil, outdoors, battery + solar | Reads soil moisture every 15 min, sends it by LoRa radio, deep-sleeps |
| **Gateway** | Indoors near WiFi, USB powered | Listens for LoRa packets, posts them to soilifylabs.com |

```
node ──LoRa 915MHz──▶ gateway ──WiFi/HTTPS──▶ soilifylabs.com ──▶ app
```

The node has **no WiFi** — that's why the gateway exists.

---

## 2. Parts (per node)

| Part | Notes |
|---|---|
| Heltec ESP32 LoRa V3 (SX1262) | MCU + radio |
| Capacitive soil moisture sensor | **Run at 3.3V**, not 5V |
| Samsung INR18650-35E cell | 3500 mAh. Genuine cell — don't use salvaged |
| 1S BMS protection board (DW01+FS8205) | **Required for safety** |
| CN3065 solar charger | Solar → battery |
| Solar panel | **Voc ≤ 6.5V** — measure it, don't trust the label |
| PTC resettable fuse, **2A** | In series on the protected + line |
| Electrolytic capacitor **470–1000 µF** | **Critical** — see §4 |
| White IP65 enclosure + cable glands | Weatherproofing |

---

## 3. Wiring

**Two rules:** every `+` goes to the **＋ rail**, every `−` to the **− rail**.
Only exceptions: the **cell** touches only the BMS, and the **panel** touches
only the charger's IN pads.

### Every connection (13 total)

**Cell → BMS**
```
Cell +  → BMS B+
Cell −  → BMS B−
```

**BMS output → rails (fuse in the + line)**
```
BMS P+  → fuse leg 1
fuse leg 2 → ＋ RAIL
BMS P−  → − RAIL
```
*If your BMS has no `P+` pad, the positive output is just `B+` — these boards
only switch the negative side.*

**Charger**
```
CN3065 BAT+ → ＋ RAIL
CN3065 BAT− → − RAIL
CN3065 IN+  → Solar panel +
CN3065 IN−  → Solar panel −
```
*The CN3065 has no "OUT" pin — the BAT pads are both battery and output.*

**Capacitor** (mind polarity — striped leg is −)
```
Cap +  → ＋ RAIL
Cap −  → − RAIL       (place physically close to the ESP32)
```

**ESP32 node**
```
Battery + → VBAT / battery connector   ⚠️ NEVER the 3V3 or 5V pin
GND       → − RAIL
```

**Soil sensor**
```
VCC  → 3V3   (regulated 3.3V, not battery)
GND  → GND
AOUT → GPIO4
```

### Making rails on perfboard
ELEGOO perfboard has **isolated pads** — holes are NOT connected. Lay a **bare
solid wire** along the row and solder **every pad it crosses**. That wire is the
rail. (Stripboard = strips are already connected, skip this.)

No-solder alternative: a **Wago 221 lever connector** or screw terminal block —
one for `+`, one for `−`. Works identically, zero soldering.

---

## 4. Pin reference — Heltec V3

**Already used — do not touch:**

| Pins | Used by |
|---|---|
| 8, 9, 10, 11, 12, 13, 14 | LoRa (SX1262) |
| 17, 18, 21 | OLED (SDA, SCL, RST) |
| **1**, 37 | **Battery ADC** + enable |
| 35, 36 | LED, **Vext** |
| 0, 3, 45, 46 | Boot/strapping |
| 43, 44 | USB serial |
| 26–32 | Internal flash/PSRAM |

**Free ADC pins: GPIO 4, 5, 6, 7** (all ADC1). Use **GPIO4** for soil.

> ⚠️ **Never put the soil sensor on GPIO1** — it's the battery-voltage divider
> and will skew readings. This bit us on the first unit.

---

## 5. Firmware

**Libraries (Arduino Library Manager):**
- `RadioLib` (Jan Gromes) — both sketches
- `U8g2` (oliver) — gateway only (Adafruit_SSD1306 does **not** reliably drive
  the Heltec V3 OLED — we tested this)

**Board:** `Heltec WiFi LoRa 32(V3)` (or `ESP32S3 Dev Module`)

**Flash:**
- Node → `firmware/node/node.ino`
- Gateway → `firmware/gateway/gateway.ino`

**Both nodes use the identical sketch** — each names itself from its chip ID
(`node-A1B2C3`), so there's nothing to edit per unit.

**Radio settings must match on both:** 915 MHz, SF7, BW 125 kHz, CR 4/5,
private sync word.

---

## 6. Calibrate the soil sensor

Calibration values shift with supply voltage — **calibrate at the same 3.3V you
run at.**

1. Open Serial Monitor at **115200**.
2. Hold the probe **in dry air** → note the raw number → that's `SOIL_DRY`.
3. Put the probe **in a glass of water** (electronics above the water line!) →
   note the raw number → that's `SOIL_WET`.
4. Update both values in `node.ino` and reflash.

---

## 7. Bench test — BEFORE it goes in a field

**Electrical (cell OUT):**
- Multimeter on continuity: **＋ rail to − rail → NO beep.** A beep = short, fix it.
- Same rail, two points → **should beep** (proves the rail is continuous).
- **Tug-test every joint.** If a wire moves, reheat it.

**Power up (cell IN):**
- BMS output should read the cell voltage (~3.6–4.2V), not ~1V.
- Nothing should get warm in the first minute.

**Serial monitor (115200) — you want to see:**
```
=== Soilify LoRa Node Waking ===
Node ID: node-XXXXXX
Initializing LoRa... OK
Soil raw: ....  -> moisture: ..%
Transmitted OK
Sleeping for 900 seconds.
```

**Sanity-check the reading:** squeeze the probe in wet soil, then dry air —
the % must move the right way. 30 seconds, catches a miswire.

**Confirm it reached the app:** the reading should appear on the dashboard.

---

## 8. Field installation

**Siting**
- **Non-combustible base** — paver, brick, or metal plate. Not on dry grass.
- **Clear a bare-earth / gravel ring** around it.
- **Away from hay, straw, fuel, and buildings.**
- **Mount the solar panel above the box with an air gap** — it shades the
  electronics (keeps the battery cooler = longer life).
- **Mark the location** (flag/post) so mowers and tractors miss it.
- Keep it **low** — don't make it the tallest object (lightning).

**Weatherproofing** — this is the most likely thing to break it:
- IP65 box, gasket closed properly.
- **Cable glands** on every cable entry — not tape.
- **Seal the probe junction** where electronics meet the soil-going part.
- Point glands/vents **downward**.

**Range:** keep the node within LoRa range of the gateway (a few hundred m to
a few km, less through buildings/hills).

**Tell the farmer:** it's a prototype, it contains a lithium battery, where it
is, and how to reach you.

---

## 9. Troubleshooting (real issues we hit)

| Symptom | Cause | Fix |
|---|---|---|
| **Gateway serial hangs at `Initializing LoRa...`** | SPI not mapped to the board's custom radio pins | Already fixed in `node.ino` (`hspi.begin(SCK,MISO,MOSI,NSS)`) — make sure you flashed the current sketch |
| **OLED blank but code runs** | Adafruit_SSD1306 doesn't drive Heltec V3 reliably | Use **U8g2** (already in `gateway.ino`) |
| **BMS output reads ~1V, cell reads 3.6V** | Cold/loose solder joint (most common), or BMS tripped | Reflow the joint. If still low: disconnect everything from output, apply charger to re-wake it. Still low → swap board |
| **BMS trips repeatedly during use** | Voltage sag on LoRa transmit | **Fit the big electrolytic capacitor** at the ESP32 power, reflow the B+/B− joints, use short thick wire. Swap board if it persists |
| **Reseating the battery doesn't reset the BMS** | Over-discharge lockout needs *charge voltage*, not just power | Apply the charger for a few seconds |
| **Battery flat in ~10 days** | Deep sleep not cutting Vext/OLED | Already fixed — `goToSleep()` sets Vext HIGH + `radio.sleep()` |
| **Wrong / erratic moisture** | Sensor on GPIO1 (battery ADC pin) | Move to **GPIO4** and reflash |
| **"No location set" in app** | Farm location missing | Set it in Settings → needed for the watering forecast |
| **Node stops reporting** | Usually water ingress or a failed joint | Check seals first, then joints |

**Field recovery:** most BMS trips **self-recover** — a transient fault clears
on its own, and an over-discharge lockout re-arms automatically once the sun
charges it. Only a *persistent* fault (water short, chewed wire) needs a visit.

---

## 10. Maintenance

- **Each season:** re-check calibration against a hand feel of the soil.
- **Check seals** after winter.
- **Replace the cell** if the node starts going offline often.
- Clean the probe gently — don't scrub the electronics.

---

## 11. Known limitations (be honest with users)

- Soil **temperature is not measured** — the app's temperature comes from the
  weather service. AI diagnosis works from moisture only.
- **No NTC** on the charger — charging isn't temperature-limited. Fine at
  observed box temps (~120°F), but shade the box.
- Nodes are **LoRa-only** — they cannot be woken on demand; "instant reading"
  only works for legacy WiFi sensors.
- Sensor accuracy depends on **calibration** and good soil contact.
