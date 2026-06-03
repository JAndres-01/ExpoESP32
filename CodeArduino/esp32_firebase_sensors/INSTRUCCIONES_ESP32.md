# Instrucciones para subir el codigo al ESP32 con VS Code

Este sketch envia los datos del DHT11 a Firebase para que aparezcan en la web.

## 1. Abrir el proyecto en VS Code

Tu amigo debe abrir esta carpeta en VS Code:

```text
CodeArduino/esp32_firebase_sensors
```

No debe abrir solamente el archivo `.ino`; debe abrir la carpeta completa para que PlatformIO detecte `platformio.ini`.

## 2. Instalar PlatformIO

En VS Code, instalar la extension:

```text
PlatformIO IDE
```

PlatformIO instalara automaticamente las librerias definidas en `platformio.ini`:

- `Firebase ESP Client` by Mobizt
- `DHT sensor library` by Adafruit
- `Adafruit Unified Sensor`

## 3. Archivo principal

El archivo que PlatformIO compila es:

```text
src/main.cpp
```

El archivo `.ino` se deja como referencia para Arduino IDE, pero en VS Code con PlatformIO se usa `src/main.cpp`.

## 4. Cambiar el WiFi

Tu amigo debe cambiar estas lineas por el WiFi de su casa:

```cpp
#define WIFI_SSID "TU_WIFI"
#define WIFI_PASSWORD "TU_PASSWORD_WIFI"
```

## 5. Revisar sensor

El codigo espera un DHT11 conectado asi:

```text
DHT11 VCC  -> 3.3V
DHT11 GND  -> GND
DHT11 DATA -> GPIO 4
```

Si el sensor esta conectado a otro pin, cambiar:

```cpp
#define DHTPIN 4
```

## 6. Subir al ESP32

En VS Code con PlatformIO:

1. Conectar el ESP32 por USB.
2. Abrir PlatformIO.
3. Presionar **Upload**.
4. Abrir **Serial Monitor** a `115200`.

Si todo esta bien, deberia verse algo parecido a:

```text
WiFi conectado. IP: ...
Firebase inicializado. Esperando autenticacion...
DHT11 listo.
Enviando lecturas...
Temperatura: 24.00 C
Humedad: 60.00 %
```

## 7. Ver en la web

Abrir la web e iniciar sesion con el usuario configurado en el sketch. La web lee:

```text
UsersData/{USER_UID}/temperature
UsersData/{USER_UID}/humidity
```

Si el usuario y el UID coinciden, los datos apareceran automaticamente.
