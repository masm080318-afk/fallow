/*
 * Soilify Labs v2 - Soil Moisture + Temperature Sensor
 *
 * Hardware:
 *   - ESP32 DevKit V1
 *   - Capacitive soil moisture sensor on GPIO 34
 *   - DS18B20 temperature probe on GPIO 4
 *   - TP4056 + 18650 + 5V solar panel
 *
 * Sends data to soilifylabs.com every 15 minutes
 * Uses deep sleep to save battery (runs ~6 months on battery)
 * Will wake on timer or if GPIO 0 pulled to ground
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Preferences.h>

// ─── CONFIG ─────────────────────────────────────────────────────────────────
const char* WIFI_SSID = "$8&36s@903";
const char* WIFI_PASSWORD = "Rimas!123";
const char* SERVER_URL = "https://soilifylabs.com/api/ingest";
const char* CHECK_URL = "https://soilifylabs.com/api/instant-reading-check";
const char* NODE_ID = "44745231-006f-402d-a511-4f5dc984063e";

// Calibration values from your sensor
const int SOIL_DRY = 3100;    // raw ADC value when sensor in dry air
const int SOIL_WET = 0;       // raw ADC value when sensor in water

// Timing (in microseconds for deep sleep)
const unsigned long SLEEP_TIME = 15 * 60 * 1000000;  // 15 minutes

// Pins
#define SOIL_PIN 34
#define TEMP_PIN 4
#define LED_PIN 2  // built-in LED on most ESP32 boards

// ─── GLOBALS ────────────────────────────────────────────────────────────────
OneWire oneWire(TEMP_PIN);
DallasTemperature tempSensor(&oneWire);
Preferences prefs;  // for storing persistent data

// ─── SETUP ──────────────────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println();
  Serial.println("=== Soilify Labs ESP32 Waking Up ===");

  pinMode(LED_PIN, OUTPUT);

  // Initialize NVRAM for storing data
  prefs.begin("soilify", false);

  // Initialize temperature sensor
  tempSensor.begin();
  Serial.print("Temperature sensors found: ");
  Serial.println(tempSensor.getDeviceCount());

  // Connect to WiFi
  connectWifi();

  // Check if instant reading was requested
  bool instantRequested = checkForInstantReading();

  // Read and send sensor data
  sendSensorData();

  // If instant reading was requested, log it
  if (instantRequested) {
    Serial.println("Instant reading completed!");
  }

  Serial.println("Going to sleep for 15 minutes...");
  delay(1000); // let Serial finish

  // Enter deep sleep — ESP32 will wake up on timer
  esp_sleep_enable_timer_wakeup(SLEEP_TIME);
  esp_deep_sleep_start();
  // Code below will NOT execute until ESP32 wakes up
}

// ─── MAIN LOOP ──────────────────────────────────────────────────────────────
void loop() {
  // NEVER REACHED — ESP32 restarts on wake from deep sleep
}

// ─── WIFI ───────────────────────────────────────────────────────────────────
void connectWifi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
    digitalWrite(LED_PIN, attempts % 2);
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.print("WiFi connected. IP: ");
    Serial.println(WiFi.localIP());
    Serial.print("Signal strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
    digitalWrite(LED_PIN, HIGH);
  } else {
    Serial.println();
    Serial.println("WiFi failed — will retry on next wake.");
    digitalWrite(LED_PIN, LOW);
  }
}

// ─── CHECK FOR INSTANT READING REQUEST ──────────────────────────────────────
bool checkForInstantReading() {
  if (WiFi.status() != WL_CONNECTED) {
    return false;
  }

  Serial.println("Checking for instant reading request...");

  HTTPClient http;
  http.begin(CHECK_URL);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(5000);

  // Send node_id to check if instant reading was requested
  String payload = "{\"node_id\":\"" + String(NODE_ID) + "\"}";
  int httpCode = http.POST(payload);

  bool requested = false;
  if (httpCode == 200) {
    String response = http.getString();
    if (response.indexOf("\"requested\":true") != -1) {
      requested = true;
      Serial.println("Instant reading requested!");
    }
  }

  http.end();
  return requested;
}

// ─── SENSORS ────────────────────────────────────────────────────────────────
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
  Serial.print(" → moisture: ");
  Serial.print(moisture);
  Serial.println("%");

  return moisture;
}

float readTemperature() {
  tempSensor.requestTemperatures();
  float tempC = tempSensor.getTempCByIndex(0);

  if (tempC == -127.0 || tempC == DEVICE_DISCONNECTED_C) {
    Serial.println("Temperature sensor disconnected — skipping");
    return -999.0;
  }

  float tempF = (tempC * 9.0 / 5.0) + 32.0;

  Serial.print("Temperature: ");
  Serial.print(tempC);
  Serial.print("°C / ");
  Serial.print(tempF);
  Serial.println("°F");

  return tempF;
}

// ─── SEND DATA ──────────────────────────────────────────────────────────────
void sendSensorData() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected, cannot send data");
    return;
  }

  int moisture = readMoisture();
  float tempF  = readTemperature();
  int rawSoil  = analogRead(SOIL_PIN);

  String payload = "{";
  payload += "\"node_id\":\"" + String(NODE_ID) + "\",";
  payload += "\"moisture\":" + String(moisture) + ",";
  if (tempF > -100) {
    payload += "\"temp\":" + String(tempF, 1) + ",";
  }
  payload += "\"raw\":" + String(rawSoil);
  payload += "}";

  Serial.print("Sending: ");
  Serial.println(payload);

  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(10000);

  int httpCode = http.POST(payload);

  Serial.print("HTTP code: ");
  Serial.println(httpCode);

  if (httpCode == 200) {
    digitalWrite(LED_PIN, LOW);
    delay(100);
    digitalWrite(LED_PIN, HIGH);
    delay(100);
    digitalWrite(LED_PIN, LOW);
    Serial.println("✓ Data sent successfully");
  } else {
    Serial.print("Error: ");
    Serial.println(http.getString());
  }

  http.end();
}
