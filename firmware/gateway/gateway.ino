/*
 * Soilify Gateway Firmware — Heltec WiFi LoRa 32 V3
 * ─────────────────────────────────────────────────
 * NO CODE EDITING REQUIRED. Ever.
 *
 * First boot (or after holding PRG while pressing RST):
 *   1. The gateway creates its own WiFi network: "Soilify-Setup"
 *   2. Connect to it with your phone — a setup page opens automatically
 *   3. Pick your home WiFi, type its password and the 6-digit pairing
 *      code shown in the Soilify app (Settings → Gateway pairing code)
 *   4. Gateway reboots, connects, and relays sensor data forever
 *
 * WiFi credentials + pairing code are stored in flash (NVS), never in
 * this source file — safe to publish, safe to share.
 *
 * Role: listens for LoRa packets from field nodes ("node-A1B2C3,71,908")
 * and POSTs them to soilifylabs.com with your farm's pairing code.
 * Field nodes are auto-registered server-side on their first packet.
 *
 * LIBRARY: RadioLib by Jan Gromes (Library Manager)
 * BOARD:   "Heltec WiFi LoRa 32(V3)"
 */

#include <RadioLib.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WebServer.h>
#include <DNSServer.h>
#include <Preferences.h>

// ─── HELTEC V3 PINS ──────────────────────────────────────────────────────────
#define LORA_NSS   8
#define LORA_DIO1  14
#define LORA_RST   12
#define LORA_BUSY  13
#define VEXT_PIN   36
#define SETUP_BTN  0    // PRG button — hold during reset to re-open setup

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const char* SERVER_URL = "https://soilifylabs.com/api/ingest";
const char* AP_NAME    = "Soilify-Setup";

SPIClass hspi(HSPI);
SX1262 radio = new Module(LORA_NSS, LORA_DIO1, LORA_RST, LORA_BUSY, hspi);

Preferences prefs;
WebServer   server(80);
DNSServer   dns;

String cfgSsid, cfgPass, cfgCode;
String scanOptions; // built once when the portal starts

// ─── SETUP PORTAL PAGE ───────────────────────────────────────────────────────
const char PORTAL_HTML[] PROGMEM = R"rawliteral(
<!DOCTYPE html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Soilify Gateway Setup</title><style>
*{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,'Segoe UI',Roboto,sans-serif}
body{min-height:100vh;background:linear-gradient(160deg,#0d1a0a,#1a3312 55%,#234418);
display:flex;align-items:center;justify-content:center;padding:20px;color:#fff}
.card{width:100%;max-width:380px;background:rgba(255,255,255,.08);
border:1px solid rgba(255,255,255,.15);border-radius:20px;padding:28px;
backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
box-shadow:0 8px 40px rgba(0,0,0,.35)}
.logo{width:44px;height:44px;border-radius:12px;
background:linear-gradient(135deg,#7dd44f,#4a8020);display:flex;
align-items:center;justify-content:center;font-size:22px;margin-bottom:14px}
h1{font-size:20px;font-weight:800;margin-bottom:4px}
.sub{color:rgba(255,255,255,.5);font-size:13px;margin-bottom:20px;line-height:1.4}
label{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.1em;
color:rgba(255,255,255,.5);margin:16px 0 6px;font-weight:700}
input,select{width:100%;padding:12px 14px;border-radius:12px;
border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.09);
color:#fff;font-size:15px;-webkit-appearance:none}
select option{background:#1a3312;color:#fff}
input:focus,select:focus{outline:none;border-color:#7dd44f;
box-shadow:0 0 0 3px rgba(125,212,79,.12)}
input::placeholder{color:rgba(255,255,255,.28)}
.code{letter-spacing:.35em;text-align:center;font-size:22px;font-weight:800}
button{width:100%;margin-top:24px;padding:14px;border:0;border-radius:12px;
background:linear-gradient(135deg,#5c9e2a,#4a8020);color:#fff;font-size:15px;
font-weight:800;cursor:pointer;box-shadow:0 4px 16px rgba(92,158,42,.35)}
button:active{transform:translateY(1px)}
.hide{display:none}
.hint{font-size:12px;color:rgba(255,255,255,.35);margin-top:14px;text-align:center;line-height:1.5}
</style></head><body><div class="card">
<div class="logo">&#127793;</div>
<h1>Soilify Gateway</h1>
<p class="sub">Connect this gateway to your WiFi and link it to your farm. Takes about a minute.</p>
<form action="/save" method="POST">
<label>Your WiFi network</label>
<select name="ssid" id="s" onchange="document.getElementById('m').classList.toggle('hide',this.value!=='__other__')">
%OPTIONS%<option value="__other__">Other network&hellip;</option>
</select>
<div id="m" class="hide"><label>Network name</label>
<input name="ssid_manual" placeholder="MyHomeWiFi" autocapitalize="off"></div>
<label>WiFi password</label>
<input name="pass" type="password" placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;">
<label>Pairing code &mdash; from the Soilify app</label>
<input name="code" class="code" inputmode="numeric" pattern="[0-9]*" maxlength="6" placeholder="000000" required>
<button type="submit">Save &amp; connect</button>
</form>
<p class="hint">Find your code in the Soilify app under<br>Settings &rarr; Gateway pairing code</p>
</div></body></html>
)rawliteral";

const char SAVED_HTML[] PROGMEM = R"rawliteral(
<!DOCTYPE html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Soilify — Saved</title><style>
*{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,'Segoe UI',Roboto,sans-serif}
body{min-height:100vh;background:linear-gradient(160deg,#0d1a0a,#1a3312 55%,#234418);
display:flex;align-items:center;justify-content:center;padding:20px;color:#fff;text-align:center}
.card{max-width:380px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);
border-radius:20px;padding:36px 28px;backdrop-filter:blur(20px)}
.ok{width:56px;height:56px;border-radius:50%;background:rgba(125,212,79,.18);
border:2px solid #7dd44f;display:flex;align-items:center;justify-content:center;
font-size:26px;margin:0 auto 18px;color:#7dd44f}
h1{font-size:19px;font-weight:800;margin-bottom:10px}
p{color:rgba(255,255,255,.55);font-size:14px;line-height:1.6}
</style></head><body><div class="card">
<div class="ok">&#10003;</div>
<h1>Gateway connected!</h1>
<p>Your gateway is restarting and joining your WiFi.<br><br>
Sensor readings will appear in the Soilify app within 15 minutes of your
field nodes waking up. You can close this page and reconnect your phone
to your normal WiFi.</p>
</div></body></html>
)rawliteral";

// ─── SETUP ───────────────────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println();
  Serial.println("=== Soilify Gateway Starting ===");

  // Enable VEXT (powers peripherals on Heltec V3)
  pinMode(VEXT_PIN, OUTPUT);
  digitalWrite(VEXT_PIN, LOW);
  delay(50);

  // Load saved config
  prefs.begin("soilify", false);
  cfgSsid = prefs.getString("ssid", "");
  cfgPass = prefs.getString("pass", "");
  cfgCode = prefs.getString("code", "");

  // Hold PRG at boot → force setup mode
  pinMode(SETUP_BTN, INPUT_PULLUP);
  delay(50);
  bool forceSetup = (digitalRead(SETUP_BTN) == LOW);

  if (forceSetup || cfgSsid.length() == 0 || cfgCode.length() == 0) {
    Serial.println(forceSetup ? "PRG held - entering setup mode."
                              : "No saved config - entering setup mode.");
    runSetupPortal(); // never returns (reboots after save)
  }

  // Normal mode: connect to WiFi; if the saved password stopped working,
  // fall back into setup instead of bricking.
  if (!connectWifi()) {
    Serial.println("WiFi failed with saved credentials - reopening setup.");
    runSetupPortal();
  }

  // Init SPI + LoRa — settings must match the field nodes exactly
  hspi.begin(9, 11, 10, LORA_NSS);

  Serial.print("Initializing LoRa... ");
  int state = radio.begin(915.0, 125.0, 7, 5, RADIOLIB_SX126X_SYNC_WORD_PRIVATE, 14, 8);
  if (state != RADIOLIB_ERR_NONE) {
    Serial.print("FAILED, code: ");
    Serial.println(state);
    while (true);
  }
  Serial.println("OK");
  Serial.println("Listening for packets...");
}

// ─── MAIN LOOP ───────────────────────────────────────────────────────────────
void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi dropped, reconnecting...");
    connectWifi();
  }

  String received = "";
  int state = radio.receive(received);

  if (state == RADIOLIB_ERR_NONE) {
    Serial.print("Received: ");
    Serial.println(received);
    Serial.print("RSSI: ");
    Serial.print(radio.getRSSI());
    Serial.println(" dBm");

    // Parse "node-A1B2C3,71,908"  (node_id,moisture,raw)
    int c1 = received.indexOf(',');
    int c2 = received.indexOf(',', c1 + 1);

    if (c1 == -1 || c2 == -1) {
      Serial.println("Bad packet, skipping.");
      return;
    }

    String nodeId   = received.substring(0, c1);
    String moisture = received.substring(c1 + 1, c2);
    String raw      = received.substring(c2 + 1);

    // The pairing code tells the server which farm this data belongs to.
    // Unknown nodes are auto-registered — no IDs to type anywhere.
    String payload = "{";
    payload += "\"farm_code\":\"" + cfgCode + "\",";
    payload += "\"node_id\":\"" + nodeId + "\",";
    payload += "\"moisture\":" + moisture + ",";
    payload += "\"raw\":" + raw;
    payload += "}";

    Serial.print("Posting: ");
    Serial.println(payload);

    HTTPClient http;
    http.begin(SERVER_URL);
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(10000);

    int httpCode = http.POST(payload);
    Serial.print("HTTP: ");
    Serial.println(httpCode);
    if (httpCode == 200) Serial.println("OK");
    http.end();

  } else if (state != RADIOLIB_ERR_RX_TIMEOUT) {
    Serial.print("Receive error: ");
    Serial.println(state);
  }
}

// ─── WIFI ────────────────────────────────────────────────────────────────────
bool connectWifi() {
  Serial.print("Connecting to \"");
  Serial.print(cfgSsid);
  Serial.print("\"...");
  WiFi.mode(WIFI_STA);
  WiFi.begin(cfgSsid.c_str(), cfgPass.c_str());
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(1000);
    Serial.print(".");
    attempts++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(" connected.");
    Serial.println(WiFi.localIP());
    return true;
  }
  Serial.println(" failed.");
  return false;
}

// ─── CAPTIVE PORTAL ──────────────────────────────────────────────────────────
void runSetupPortal() {
  // Scan nearby networks first (needs STA mode), build <option> list
  Serial.println("Scanning WiFi networks...");
  WiFi.mode(WIFI_STA);
  int n = WiFi.scanNetworks();
  scanOptions = "";
  for (int i = 0; i < n && i < 20; i++) {
    String ssid = WiFi.SSID(i);
    if (ssid.length() == 0) continue;
    // Escape quotes minimally
    ssid.replace("\"", "&quot;");
    scanOptions += "<option value=\"" + ssid + "\">" + ssid + "</option>";
  }
  WiFi.scanDelete();

  // Start access point + captive DNS
  WiFi.mode(WIFI_AP);
  WiFi.softAP(AP_NAME);
  delay(200);
  IPAddress apIP = WiFi.softAPIP();
  dns.start(53, "*", apIP);

  Serial.print("Setup portal running at http://");
  Serial.println(apIP);
  Serial.print("Join WiFi \"");
  Serial.print(AP_NAME);
  Serial.println("\" with your phone to configure.");

  server.on("/", handlePortalPage);
  server.on("/save", HTTP_POST, handleSave);
  // Captive-portal probes (Android/iOS/Windows) → redirect to the form
  server.onNotFound([]() {
    server.sendHeader("Location", "http://" + WiFi.softAPIP().toString() + "/", true);
    server.send(302, "text/plain", "");
  });
  server.begin();

  // Portal loop — never leaves; handleSave() reboots the board
  while (true) {
    dns.processNextRequest();
    server.handleClient();
    delay(2);
  }
}

void handlePortalPage() {
  String page = FPSTR(PORTAL_HTML);
  page.replace("%OPTIONS%", scanOptions);
  server.send(200, "text/html", page);
}

void handleSave() {
  String ssid = server.arg("ssid");
  if (ssid == "__other__") ssid = server.arg("ssid_manual");
  String pass = server.arg("pass");
  String code = server.arg("code");
  code.trim();

  if (ssid.length() == 0 || code.length() != 6) {
    server.sendHeader("Location", "/", true);
    server.send(302, "text/plain", "");
    return;
  }

  prefs.putString("ssid", ssid);
  prefs.putString("pass", pass);
  prefs.putString("code", code);

  Serial.println("Config saved:");
  Serial.println("  ssid: " + ssid);
  Serial.println("  code: " + code);

  server.send(200, "text/html", FPSTR(SAVED_HTML));
  delay(2500);
  ESP.restart();
}
