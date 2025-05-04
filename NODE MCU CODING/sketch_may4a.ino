#include <WiFi.h>
#include <HTTPClient.h>
#include "DHT.h"

// --- DHT Setup ---
#define DHTPIN 4       // DHT11 connected to GPIO 4
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

// --- MQ Sensor Pins ---
#define MQ6_PIN 32      // MQ6 to GPIO 32
#define MQ135_PIN 33    // MQ135 to GPIO 33

// --- WiFi & ThingSpeak ---
const char* ssid = "Vasan's Nothing !";
const char* password = "sabarivasan1239";
String apiKey ="UYRIA167739FLXZH";

void setup() {
  Serial.begin(115200);
  dht.begin();

  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");
}

void loop() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  // Read analog values
  int mq6Value = analogRead(MQ6_PIN);
  int mq135Value = analogRead(MQ135_PIN);

  // Estimate gas values (basic scaling)
  float lpg_ppm = mq6Value * 0.2;
  float propane_ppm = lpg_ppm * 0.9;
  float butane_ppm = lpg_ppm * 1.1;
  float co2_ppm = mq135Value * 0.3;

  Serial.println("---- Sensor Readings ----");
  Serial.print("Temperature: "); Serial.print(temperature); Serial.println(" °C");
  Serial.print("Humidity: "); Serial.print(humidity); Serial.println(" %");
  Serial.print("LPG: "); Serial.print(lpg_ppm); Serial.println(" ppm");
  Serial.print("Propane: "); Serial.print(propane_ppm); Serial.println(" ppm");
  Serial.print("Butane: "); Serial.print(butane_ppm); Serial.println(" ppm");
  Serial.print("CO2: "); Serial.print(co2_ppm); Serial.println(" ppm");
  Serial.println("--------------------------");

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = "http://api.thingspeak.com/update?api_key=" + apiKey;
    url += "&field1=" + String(temperature);
    url += "&field2=" + String(humidity);
    url += "&field3=" + String(co2_ppm);
    url += "&field4=" + String(lpg_ppm);
    url += "&field5=" + String(propane_ppm);
    url += "&field6=" + String(butane_ppm);

    http.begin(url);
    int httpResponseCode = http.GET();
    if (httpResponseCode > 0) {
      Serial.print("ThingSpeak Response Code: ");
      Serial.println(httpResponseCode);
    } else {
      Serial.print("Error in HTTP request: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  }

  delay(20000); // Wait 20 seconds before next update (ThingSpeak limit)
}