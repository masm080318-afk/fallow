# Soilify Firmware

Two boards, two sketches. **You flash each sketch once — end users never touch code.**

| Board | Sketch | Role |
|---|---|---|
| Heltec WiFi LoRa 32 V3 | `gateway/gateway.ino` | Stays indoors near the router. Receives LoRa packets, relays to soilifylabs.com |
| ESP32 LoRa V3 SX1262 | `node/node.ino` | Goes in the field. Reads soil every 15 min, transmits over LoRa, deep-sleeps |

## Flashing (you do this once per board)

1. Arduino IDE → Library Manager → install **RadioLib** (Jan Gromes)
2. Gateway: select board **"Heltec WiFi LoRa 32(V3)"**, open `gateway/gateway.ino`, upload
3. Node: select your ESP32 LoRa V3 board, open `node/node.ino`, upload
   - The node names itself from its chip ID (`node-A1B2C3`) — flash the **same sketch to every node**, no editing
   - If you calibrated the soil sensor, update `SOIL_DRY` / `SOIL_WET` before flashing

There are **no WiFi passwords or IDs in the source code.** Everything user-specific is entered through the gateway's setup portal and stored in the chip's flash.

## What the end user does (no computer needed)

1. **Plug in the gateway** near the WiFi router
2. On a phone, **join the WiFi network "Soilify-Setup"** — a setup page opens automatically
3. **Pick their home WiFi**, type its password and the **6-digit pairing code** from the Soilify app (Settings → Gateway pairing code)
4. Done. Power on field nodes anywhere in range — they appear in the app automatically within 15 minutes, named "New sensor" (tap ✏️ in Settings to rename)

To change WiFi later (moved house, new password): **hold PRG, tap RST, release PRG** — the setup network comes back.

## How data flows

```
field node ──LoRa (915 MHz)──▶ gateway ──WiFi/HTTPS──▶ soilifylabs.com/api/ingest
   "node-A1B2C3,71,908"          adds farm_code          auto-registers node,
                                                          stores reading, alerts
```

Radio settings (must stay identical on both sketches): 915 MHz, SF7, BW 125 kHz, CR 4/5, private sync word.

## Troubleshooting

- **Gateway serial says "Unknown pairing code"** — re-run setup (PRG+RST) and enter the code exactly as shown in the app
- **Setup network never appears** — the gateway only opens it when unconfigured or when PRG is held during reset
- **Nodes not appearing** — check gateway serial monitor: if packets print but HTTP fails, WiFi/internet issue; if nothing prints, node is out of LoRa range
- **Instant-reading button** in the dashboard only works with legacy WiFi sensors — LoRa nodes sleep and can't be woken remotely
