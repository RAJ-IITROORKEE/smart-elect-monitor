#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

// DHT22 Sensor Configuration
#define DHT22_PIN 15

// Device Configuration
const char* device_id = "node_01";

// WiFi Credentials
const char* ssid = "hotspot";
const char* password = "password";

// Server Configuration
const char* serverName = "https://voltedge-smart-monitor.vercel.app/api/sensor-data";

DHT dht22(DHT22_PIN, DHT22);

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n=== ESP32 Sensor Node Initializing ===");
  Serial.print("Device ID: ");
  Serial.println(device_id);

  // Connect to WiFi
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

  // Initialize DHT22 Sensor
  dht22.begin();
  Serial.println("✓ DHT22 Sensor Initialized");
  Serial.println("=================================\n");
}

void loop() {
  // Read sensor data
  float humi  = dht22.readHumidity();
  float tempC = dht22.readTemperature();

  // Validate sensor readings
  if (isnan(tempC) || isnan(humi)) {
    Serial.println("✗ Failed to read from DHT22 sensor!");
    delay(10000);
    return;
  }

  // Display readings on Serial Monitor
  Serial.println("--- Sensor Reading ---");
  Serial.print("Device ID: ");
  Serial.println(device_id);
  Serial.print("Temperature: ");
  Serial.print(tempC);
  Serial.println(" °C");
  Serial.print("Humidity: ");
  Serial.print(humi);
  Serial.println(" %");

  // Send data to server if WiFi is connected
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    // Configure HTTP client
    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(10000); // 10 second timeout

    // Build JSON payload
    String jsonData = "{";
    jsonData += "\"device_id\": \"" + String(device_id) + "\",";
    jsonData += "\"temperature\": " + String(tempC, 2) + ",";
    jsonData += "\"humidity\": " + String(humi, 2);
    jsonData += "}";

    Serial.print("Sending: ");
    Serial.println(jsonData);

    // Send POST request
    int httpResponseCode = http.POST(jsonData);

    // Handle response
    if (httpResponseCode > 0) {
      Serial.print("✓ HTTP Response: ");
      Serial.println(httpResponseCode);
      
      String response = http.getString();
      Serial.print("Server Response: ");
      Serial.println(response);
    } else {
      Serial.print("✗ HTTP Error: ");
      Serial.println(httpResponseCode);
      Serial.println(http.errorToString(httpResponseCode));
    }

    http.end();
  } else {
    Serial.println("✗ WiFi Disconnected - Attempting to reconnect...");
    WiFi.reconnect();
  }

  Serial.println("--------------------\n");

  // Wait 10 seconds before next reading
  delay(10000);
}
