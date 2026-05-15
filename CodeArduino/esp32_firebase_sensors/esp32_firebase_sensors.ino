/*
  ESP32 + BME280 + Firebase Realtime Database

  Este sketch envia temperatura, humedad y presion a la ruta que usa la web:
  UsersData/{USER_UID}/temperature
  UsersData/{USER_UID}/humidity
  UsersData/{USER_UID}/pressure

  Librerias necesarias en Arduino IDE:
  - Firebase ESP Client by Mobizt
  - Adafruit BME280 Library
  - Adafruit Unified Sensor
*/

#include <WiFi.h>
#include <Wire.h>
#include <Adafruit_BME280.h>
#include <Firebase_ESP_Client.h>

#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

// WiFi
#define WIFI_SSID "TU_WIFI"
#define WIFI_PASSWORD "TU_PASSWORD_WIFI"

// Firebase
#define API_KEY "AIzaSyDmiM6oUtlqwGnLR8sR_tmFd0Laq6jU7_g"
#define DATABASE_URL "https://expo-esp32-8e87c-default-rtdb.firebaseio.com/"

// Usuario creado en Firebase Authentication.
#define USER_EMAIL "joseandres2035@gmail.com"
#define USER_PASSWORD "jose11"

// UID del mismo usuario anterior. Debe coincidir con Firebase Auth.
#define USER_UID "vNtCE0HypCXzySzs2JmSxL5adNn1"

// Intervalo de envio
const unsigned long SEND_INTERVAL_MS = 5000;

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;
Adafruit_BME280 bme;

unsigned long lastSend = 0;

void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Conectando a WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }

  Serial.println();
  Serial.print("WiFi conectado. IP: ");
  Serial.println(WiFi.localIP());
}

void setupFirebase() {
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  config.token_status_callback = tokenStatusCallback;

  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void setupSensor() {
  if (!bme.begin(0x76)) {
    Serial.println("No se encontro el BME280 en 0x76. Probando 0x77...");

    if (!bme.begin(0x77)) {
      Serial.println("Error: revisa el cableado I2C del BME280.");
      while (true) {
        delay(1000);
      }
    }
  }

  Serial.println("BME280 listo.");
}

bool sendFloat(const String& path, float value) {
  if (Firebase.RTDB.setFloat(&fbdo, path, value)) {
    return true;
  }

  Serial.print("Error enviando ");
  Serial.print(path);
  Serial.print(": ");
  Serial.println(fbdo.errorReason());
  return false;
}

void sendReadings() {
  const float temperature = bme.readTemperature();
  const float humidity = bme.readHumidity();
  const float pressure = bme.readPressure() / 100.0F;

  const String basePath = "/UsersData/" + String(USER_UID);

  Serial.println("Enviando lecturas...");
  Serial.print("Temperatura: ");
  Serial.print(temperature);
  Serial.println(" C");
  Serial.print("Humedad: ");
  Serial.print(humidity);
  Serial.println(" %");
  Serial.print("Presion: ");
  Serial.print(pressure);
  Serial.println(" hPa");

  sendFloat(basePath + "/temperature", temperature);
  sendFloat(basePath + "/humidity", humidity);
  sendFloat(basePath + "/pressure", pressure);
}

void setup() {
  Serial.begin(115200);
  delay(500);

  connectWiFi();
  setupSensor();
  setupFirebase();
}

void loop() {
  if (!Firebase.ready()) {
    delay(200);
    return;
  }

  if (millis() - lastSend >= SEND_INTERVAL_MS) {
    lastSend = millis();
    sendReadings();
  }
}
