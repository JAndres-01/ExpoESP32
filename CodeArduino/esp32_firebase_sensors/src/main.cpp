#include <Arduino.h>
#include <WiFi.h>
#include <DHT.h>
#include <Firebase_ESP_Client.h>

// WiFi de la casa donde estara conectado el ESP32.
#define WIFI_SSID "TU_WIFI"
#define WIFI_PASSWORD "TU_PASSWORD_WIFI"

// Firebase del proyecto de la web.
#define API_KEY "AIzaSyDmiM6oUtlqwGnLR8sR_tmFd0Laq6jU7_g"
#define DATABASE_URL "https://expo-esp32-8e87c-default-rtdb.firebaseio.com/"

// Usuario creado en Firebase Authentication. Debe ser el mismo usuario de la web.
#define USER_EMAIL "joseandres2035@gmail.com"
#define USER_PASSWORD "jose11"

// UID del mismo usuario anterior. Debe coincidir con Firebase Auth y con la ruta de la web.
#define USER_UID "vNtCE0HypCXzySzs2JmSxL5adNn1"

// Sensor DHT11.
#define DHTPIN 4
#define DHTTYPE DHT11

const unsigned long SEND_INTERVAL_MS = 10000;

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;
DHT dht(DHTPIN, DHTTYPE);

unsigned long lastSend = 0;
unsigned long readingCount = 0;
unsigned long failedSendCount = 0;
unsigned long lastFirebaseWaitLog = 0;

void connectWiFi() {
  WiFi.setSleep(false);
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

void ensureWiFi() {
  if (WiFi.status() == WL_CONNECTED) {
    return;
  }

  Serial.println("WiFi desconectado. Reintentando...");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long startAttempt = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startAttempt < 15000) {
    Serial.print(".");
    delay(500);
  }

  Serial.println();
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("WiFi reconectado. IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("No se pudo reconectar al WiFi todavia.");
  }
}

void setupFirebase() {
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  Serial.println("Firebase inicializado. Esperando autenticacion...");
}

void setupSensor() {
  dht.begin();
  Serial.println("DHT11 listo.");
}

bool sendDashboardData(String path, float temperature, float humidity) {
  const unsigned long nextReadingCount = readingCount + 1;
  const unsigned long uptimeSeconds = millis() / 1000;
  FirebaseJson json;
  json.set("temperature", temperature);
  json.set("humidity", humidity);
  json.set("uptimeSeconds", uptimeSeconds);
  json.set("lastUpdateMs", millis());
  json.set("readingCount", nextReadingCount);

  if (Firebase.RTDB.updateNode(&fbdo, path.c_str(), &json)) {
    readingCount = nextReadingCount;
    return true;
  }

  failedSendCount++;
  Serial.print("Error enviando ");
  Serial.print(path);
  Serial.print(": ");
  Serial.println(fbdo.errorReason());
  Serial.print("Envios fallidos acumulados: ");
  Serial.println(failedSendCount);
  Serial.println("Se reintentara en el siguiente intervalo.");
  return false;
}

void sendReadings() {
  const float temperature = dht.readTemperature();
  const float humidity = dht.readHumidity();

  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Error leyendo DHT11");
    return;
  }

  const String basePath = "/UsersData/" + String(USER_UID);
  Serial.println("Enviando lecturas...");
  Serial.print("Temperatura: ");
  Serial.print(temperature);
  Serial.println(" C");
  Serial.print("Humedad: ");
  Serial.print(humidity);
  Serial.println(" %");

  if (sendDashboardData(basePath, temperature, humidity)) {
    Serial.print("Lectura enviada correctamente. Numero: ");
    Serial.println(readingCount);
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);

  connectWiFi();
  setupSensor();
  setupFirebase();
}

void loop() {
  ensureWiFi();

  if (!Firebase.ready()) {
    if (millis() - lastFirebaseWaitLog >= SEND_INTERVAL_MS) {
      lastFirebaseWaitLog = millis();
      Serial.println("Firebase todavia no esta listo. Esperando token/conexion...");
    }
    delay(200);
    return;
  }

  if (millis() - lastSend >= SEND_INTERVAL_MS) {
    lastSend = millis();
    sendReadings();
  }
}
