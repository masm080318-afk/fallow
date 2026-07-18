/*
 * Soilify Field Node Firmware — ESP32 LoRa V3 (SX1262)
 * ────────────────────────────────────────────────────
 * NO PER-NODE EDITING REQUIRED. Every node names itself from its
 * chip's unique hardware ID (e.g. "node-A1B2C3"), so you can flash
 * this exact sketch to every node you build. The server auto-registers
 * new nodes the first time the gateway relays their data.
 *
 * Hardware:
 *   - ESP32 LoRa V3 SX1262 board (FIELD NODE, goes outside)
 *   - Capacitive soil moisture sensor on GPIO1
 *   - Battery powered
 *
 * Wakes every 15 minutes, reads soil sensor, transmits a small LoRa
 * packet to the gateway, goes back to sleep. No WiFi on this board.
 *
 * LIBRARY: RadioLib by Jan Gromes (Library Manager)
 *
 * SX1262 pins on this board (hardwired, don't change):
 *   NSS/CS=8  SCK=9  MOSI=10  MISO=11  RST=12  BUSY=13  DIO1=14
 */

#include <RadioLib.h>

// ─── LORA PIN DEFINITIONS ────────────────────────────────────────────────────
#define LORA_NSS  8
#define LORA_SCK  9
#define LORA_MOSI 10
#define LORA_MISO 11
#define LORA_RST  12
#define LORA_BUSY 13
#define LORA_DIO1 14

// Vext controls power to on-board peripherals (OLED etc). LOW = on, HIGH = off.
#define VEXT_PIN  36

// The SX1262 on this board is wired to custom SPI pins — the radio is NOT
// on the default SPI bus. Without this explicit mapping, radio.begin()
// hangs forever waiting on a chip it can't reach.
SPIClass hspi(HSPI);
SX1262 radio = new Module(LORA_NSS, LORA_DIO1, LORA_RST, LORA_BUSY, hspi);

// ─── SENSOR CONFIG ───────────────────────────────────────────────────────────
// GPIO4 (ADC1). Do NOT use GPIO1 on the Heltec V3 — that pin is wired to the
// on-board battery-voltage divider and will skew soil readings.
#define SOIL_PIN 4

// UPDATE THESE after running calibrate_sensor.ino (same for every node
// using the same sensor model — calibrate once, reuse everywhere)
const int SOIL_DRY = 1900;   // raw ADC when sensor in dry air
const int SOIL_WET = 900;   // raw ADC when sensor in water

// ─── TIMING ──────────────────────────────────────────────────────────────────
const uint64_t SLEEP_SECONDS = 15ULL * 60ULL; // 15 minutes
const uint64_t uS_TO_S = 1000000ULL;

// ─── NODE ID (automatic — derived from the chip's factory MAC) ──────────────
String nodeId() {
  uint64_t mac = ESP.getEfuseMac();
  char buf[13];
  snprintf(buf, sizeof(buf), "node-%06X", (uint32_t)(mac >> 24) & 0xFFFFFF);
  return String(buf);
}

// ─── SETUP (runs on every wake) ──────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  Serial.println("=== Soilify LoRa Node Waking ===");
  Serial.print("Node ID: ");
  Serial.println(nodeId());

  // Map SPI to the board's actual radio pins before touching the SX1262
  hspi.begin(LORA_SCK, LORA_MISO, LORA_MOSI, LORA_NSS);

  // Init LoRa radio
  Serial.print("Initializing LoRa... ");
  int state = radio.begin(915.0); // 915MHz for US
  if (state != RADIOLIB_ERR_NONE) {
    Serial.print("FAILED, code: ");
    Serial.println(state);
    goToSleep(); // don't hang, just sleep and retry next cycle
  }
  Serial.println("OK");

  // LoRa settings — must match the gateway exactly
  radio.setSpreadingFactor(7);
  radio.setBandwidth(125.0);
  radio.setCodingRate(5);
  radio.setOutputPower(14); // dBm

  // Read sensor
  int moisture = readMoisture();
  int rawSoil  = analogRead(SOIL_PIN);

  // Build packet: "node-A1B2C3,71,908"  (node_id,moisture,raw)
  String packet = nodeId() + "," + String(moisture) + "," + String(rawSoil);

  Serial.print("Sending packet: ");
  Serial.println(packet);

  state = radio.transmit(packet);
  if (state == RADIOLIB_ERR_NONE) {
    Serial.println("Transmitted OK");
  } else {
    Serial.print("Transmit failed, code: ");
    Serial.println(state);
  }

  goToSleep();
}

void loop() {
  // Never runs — setup() handles everything then sleeps
}

// ─── SENSOR ──────────────────────────────────────────────────────────────────
int readMoisture() {
  long sum = 0;
  for (int i = 0; i < 5; i++) {
    sum += analogRead(SOIL_PIN);
    delay(10);
  }
  int raw = sum / 5;

  int moisture = map(raw, SOIL_DRY, SOIL_WET, 0, 100);
  moisture = constrain(moisture, 0, 100);

  Serial.print("Soil raw: ");
  Serial.print(raw);
  Serial.print(" -> moisture: ");
  Serial.print(moisture);
  Serial.println("%");

  return moisture;
}

// ─── SLEEP ───────────────────────────────────────────────────────────────────
void goToSleep() {
  Serial.print("Sleeping for ");
  Serial.print(SLEEP_SECONDS);
  Serial.println(" seconds.");
  Serial.flush();

  // Park the radio and cut power to peripherals before sleeping. Without
  // this, Vext/OLED stay energised and idle draw is ~10-20 mA instead of
  // <1 mA — which flattens an 18650 in about ten days instead of months.
  radio.sleep();
  pinMode(VEXT_PIN, OUTPUT);
  digitalWrite(VEXT_PIN, HIGH);   // HIGH = Vext OFF on Heltec V3

  esp_sleep_enable_timer_wakeup(SLEEP_SECONDS * uS_TO_S);
  esp_deep_sleep_start();
}
