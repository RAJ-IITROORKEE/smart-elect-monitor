#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <ArduinoJson.h>

// ---------------- OLED ----------------
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// ---------------- DHT22 ----------------
#define DHT22_PIN 15
DHT dht22(DHT22_PIN, DHT22);

// ---------------- PIR + LED ----------------
const uint8_t controlLED = 2;      // LED controlled from dashboard (GPIO 2)
const uint8_t statusLED = 4;       // Status LED for motion detection (GPIO 4)
const uint8_t motionSensor = 23;   // PIR sensor

unsigned long now;
volatile unsigned long lastTrigger = 0;
volatile bool startTimer = false;

bool printMotion = false;
bool occupied = false;

const unsigned long timeSeconds = 20 * 1000UL;  // 20 seconds timeout

// ISR
void ARDUINO_ISR_ATTR motionISR() {
  lastTrigger = millis();
  startTimer = true;
}

// ---------------- Device Configuration ----------------
const char* device_id = "node_01";

// ---------------- WiFi Configuration ----------------
const char* ssid = "Sagar";
const char* password = "12345678";

// ---------------- Server Configuration ----------------
const char* serverDataEndpoint = "https://voltedge-smart-monitor.vercel.app/api/sensor-data";
const char* serverControlEndpoint = "https://voltedge-smart-monitor.vercel.app/api/device-control";

// ---------------- TIMERS ----------------
unsigned long lastPIRCheck = 0;
unsigned long lastSendTime = 0;
unsigned long lastControlCheck = 0;

const unsigned long pirInterval = 1000;      // Check PIR every 1 second
const unsigned long sendInterval = 10000;    // Send data every 10 seconds
const unsigned long controlInterval = 5000;  // Check control status every 5 seconds

// ---------------- Sensor Values ----------------
float tempC = 0;
float humi = 0;

// ---------------- Control States (from dashboard) ----------------
bool pirEnabled = true;    // PIR sensor enabled by default
bool ledEnabled = false;   // LED off by default

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n=== ESP32 Sensor Node Initializing ===");
  Serial.print("Device ID: ");
  Serial.println(device_id);

  // ---------------- OLED INIT ----------------
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("✗ OLED not found");
  } else {
    Serial.println("✓ OLED Initialized");
  }

  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(0, 0);
  display.println("Initializing...");
  display.display();

  // ---------------- WiFi Connection ----------------
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ Connected to WiFi!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n✗ Failed to connect to WiFi");
  }

  // ---------------- DHT22 Initialization ----------------
  dht22.begin();
  Serial.println("✓ DHT22 Sensor Initialized");

  // ---------------- PIR + LED Initialization ----------------
  pinMode(motionSensor, INPUT_PULLUP);
  attachInterrupt(motionSensor, motionISR, RISING);
  
  pinMode(statusLED, OUTPUT);
  pinMode(controlLED, OUTPUT);
  
  digitalWrite(statusLED, LOW);
  digitalWrite(controlLED, LOW);
  
  Serial.println("✓ PIR Sensor Initialized");
  Serial.println("✓ LED Controls Initialized");
  Serial.println("=================================\n");
}

void loop() {
  now = millis();

  // -------- CHECK CONTROL STATUS FROM DASHBOARD (5 sec) --------
  if (now - lastControlCheck >= controlInterval) {
    lastControlCheck = now;
    checkControlStatus();
  }

  // -------- PIR + OLED UPDATE (1 sec) --------
  if (now - lastPIRCheck >= pirInterval) {
    lastPIRCheck = now;

    // Only process PIR if enabled
    if (pirEnabled) {
      if (startTimer && !printMotion) {
        digitalWrite(statusLED, HIGH);
        Serial.println("MOTION DETECTED!!!");
        printMotion = true;
        occupied = true;
      }

      if (startTimer && (now - lastTrigger > timeSeconds)) {
        Serial.println("Motion stopped...");
        digitalWrite(statusLED, LOW);
        startTimer = false;
        printMotion = false;
        occupied = false;
      }
    } else {
      // PIR disabled - reset states
      if (occupied) {
        occupied = false;
        digitalWrite(statusLED, LOW);
        startTimer = false;
        printMotion = false;
      }
    }

    // -------- UPDATE OLED DISPLAY --------
    updateDisplay();

    // Serial output
    Serial.print("Occupied: ");
    Serial.print(occupied ? "true" : "false");
    Serial.print(" | PIR: ");
    Serial.print(pirEnabled ? "ON" : "OFF");
    Serial.print(" | LED: ");
    Serial.println(ledEnabled ? "ON" : "OFF");
  }

  // -------- SEND SENSOR DATA (10 sec) --------
  if (now - lastSendTime >= sendInterval) {
    lastSendTime = now;
    sendSensorData();
  }
}

// Function to update OLED display
void updateDisplay() {
  display.clearDisplay();

  display.setCursor(0, 0);
  display.println("ESP32 Monitor");
  display.drawLine(0, 10, SCREEN_WIDTH, 10, WHITE);

  display.setCursor(0, 15);
  display.print("Temp: ");
  display.print(tempC, 1);
  display.println(" C");

  display.setCursor(0, 27);
  display.print("Humidity: ");
  display.print(humi, 1);
  display.println("%");

  display.setCursor(0, 39);
  if (pirEnabled) {
    display.print("Occupied: ");
    display.println(occupied ? "YES" : "NO");
  } else {
    display.println("Occupied: OFF");
  }

  display.setCursor(0, 51);
  display.print("PIR:");
  display.print(pirEnabled ? "ON" : "OFF");
  display.print(" LED:");
  display.println(ledEnabled ? "ON" : "OFF");

  display.display();
}

// Function to send sensor data to server
void sendSensorData() {
  humi  = dht22.readHumidity();
  tempC = dht22.readTemperature();

  if (isnan(tempC) || isnan(humi)) {
    Serial.println("✗ DHT22 read failed");
    return;
  }

  Serial.println("--- Sensor Reading ---");
  Serial.print("Temperature: ");
  Serial.print(tempC);
  Serial.println(" °C");
  Serial.print("Humidity: ");
  Serial.print(humi);
  Serial.println(" %");
  Serial.print("Occupied: ");
  Serial.println(occupied ? "true" : "false");

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    http.begin(serverDataEndpoint);
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(10000);

    String jsonData = "{";
    jsonData += "\"device_id\": \"" + String(device_id) + "\",";
    jsonData += "\"temperature\": " + String(tempC, 2) + ",";
    jsonData += "\"humidity\": " + String(humi, 2) + ",";
    jsonData += "\"occupied\": " + String(occupied ? "true" : "false");
    jsonData += "}";

    Serial.print("Sending: ");
    Serial.println(jsonData);

    int httpResponseCode = http.POST(jsonData);

    if (httpResponseCode > 0) {
      Serial.print("✓ HTTP Response: ");
      Serial.println(httpResponseCode);
    } else {
      Serial.print("✗ HTTP Error: ");
      Serial.println(httpResponseCode);
    }

    http.end();
  } else {
    Serial.println("✗ WiFi Disconnected");
    WiFi.reconnect();
  }

  Serial.println("--------------------\n");
}

// Function to check control status from dashboard
void checkControlStatus() {
  if (WiFi.status() != WL_CONNECTED) {
    return;
  }

  HTTPClient http;
  
  String url = String(serverControlEndpoint) + "?device_id=" + String(device_id);
  http.begin(url);
  http.setTimeout(5000);

  int httpResponseCode = http.GET();

  if (httpResponseCode == 200) {
    String response = http.getString();
    
    // Parse JSON response
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, response);

    if (!error) {
      bool newPirEnabled = doc["pir_enabled"] | true;
      bool newLedEnabled = doc["led_enabled"] | false;

      // Update PIR state
      if (newPirEnabled != pirEnabled) {
        pirEnabled = newPirEnabled;
        Serial.print("PIR state changed: ");
        Serial.println(pirEnabled ? "ENABLED" : "DISABLED");
      }

      // Update LED state
      if (newLedEnabled != ledEnabled) {
        ledEnabled = newLedEnabled;
        digitalWrite(controlLED, ledEnabled ? HIGH : LOW);
        Serial.print("LED state changed: ");
        Serial.println(ledEnabled ? "ON" : "OFF");
      }
    }
  }

  http.end();
}
