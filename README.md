# ExpoSP32 - Monitoreo de Sensores con ESP32 

Proyecto educativo de electrónica e IoT que integra un microcontrolador ESP32 con sensores para capturar datos ambientales (temperatura, humedad y presión) y transmitirlos a través de una aplicación web en tiempo real usando Firebase.

## Objetivo del Proyecto

Este proyecto fue desarrollado como una herramienta de aprendizaje para mejorar nuestros conocimientos en:
- **Electrónica:** Uso de microcontroladores ESP32 y sensores
- **IoT (Internet of Things):** Transmisión de datos desde dispositivos embebidos
- **Desarrollo Web:** Integración frontend con servicios en la nube
- **Backend as a Service:** Uso de Firebase como plataforma

## Descripción General

La aplicación consta de dos partes principales:
1. **Firmware ESP32:** Lee sensores de temperatura, humedad y presión, y envía los datos a Firebase
2. **Dashboard Web:** Interfaz para visualizar los datos en tiempo real (basada en plantilla existente)

## Cambios Implementados por el Equipo

-  **Integración Firebase:** Conexión de la aplicación web con Firebase Realtime Database
-  **Sistema de Autenticación:** Login seguro con email y contraseña
-  **Visualización en Tiempo Real:** Datos actualizados automáticamente desde el ESP32

## Estructura del Proyecto

```
ExpoSP32/
├── database.rules.json     # Reglas de seguridad Firebase
├── firebase.json           # Configuración Firebase Hosting
├── README.md              # Este archivo
├── CodeArduino/           # Código del ESP32
│   └── esp32_firebase_sensors/
│       └── esp32_firebase_sensors.ino
└── public/                # Aplicación web (plantilla mejorada)
    ├── index.html         # Página principal (login + dashboard)
    ├── style.css          # Estilos
    ├── 404.html           # Página de error
    └── scripts/
        ├── auth.js        # Lógica de autenticación Firebase
        └── index.js       # Lectura de datos en tiempo real
```

## Configuración

### Requisitos
- Proyecto Firebase configurado con Realtime Database habilitado
- ESP32 con sensores conectados
- Conexión WiFi disponible

### Variables de Entorno (Firebase Config)
Las credenciales de Firebase se deben configurar en `public/index.html`

### Estructura de Datos en Firebase

```
UsersData
└── {uid}
    ├── temperature: number
    ├── humidity: number
    └── pressure: number
```


## Equipo y Contribuciones

Este es un proyecto colaborativo donde cada miembro del equipo contribuyó con:
- Configuración del hardware (sensores y ESP32)
- Desarrollo del firmware para el microcontrolador
- Integración con Firebase
- Desarrollo de la interfaz web y autenticación

## Licencia

Este proyecto está bajo la licencia [MIT](LICENSE).
