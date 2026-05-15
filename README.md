# ESP32 Climate Monitor 🌡️

Dashboard en tiempo real para monitorear datos de temperatura, humedad y presión enviados por un ESP32 a través de Firebase Realtime Database.

## Características ✨

- **Autenticación Firebase:** Sistema seguro de login con email y contraseña
- **Datos en Tiempo Real:** Visualización instantánea de datos enviados por el ESP32
- **Diseño Moderno:** Interfaz glassmorphism con tema oscuro y gradientes
- **Responsive:** Compatible con dispositivos móviles y desktop
- **Visualización Clara:** Dos paneles - uno con temperatura grande y otro con detalles completos

## Estructura del Proyecto 📁

```
public/
├── index.html          # Página principal (login + dashboard)
├── style.css           # Estilos únicos y optimizados
├── 404.html            # Página de error (Firebase)
└── scripts/
    ├── auth.js         # Lógica de autenticación
    └── index.js        # Lógica de lectura de datos
```

## Configuración 🔧

### Requisitos
- Proyecto Firebase configurado
- Base de datos Realtime Database con estructura: `UsersData/{uid}/{temperature, humidity, pressure}`
- Reglas de seguridad configuradas en Firebase

### Variables de Entorno (Firebase Config)
Las credenciales están en `public/index.html`. Asegúrate de:
1. Reemplazar con tu propia configuración de Firebase
2. Mantener las credenciales seguidas

## Estructura de Datos en Firebase 📊

```
UsersData
└── {uid}
    ├── temperature: number
    ├── humidity: number
    └── pressure: number
```

## Cómo Usar 🚀

1. Abre la aplicación en `public/index.html`
2. Inicia sesión con tu cuenta Firebase
3. Los datos se sincronizarán automáticamente cada segundo
4. Cierra sesión con el botón logout

Puedes encontrar un ejemplo de la interfaz en este [enlace](https://tutorial.picaio.com/2022/06/29/realtime-database-firebase-esp32/).

## Contribuciones 🚀

¡Contribuciones son bienvenidas! Si tienes ideas para mejorar la dashboard, corregir errores o agregar nuevas características, no dudes en abrir un "issue" o enviar un "pull request".

## Créditos 🙌

Este proyecto fue creado por PICAIO SAS y está inspirado en proyectos similares de la comunidad de IoT y desarrollo web.

## Licencia 📝

Este proyecto está bajo la licencia [MIT](LICENSE).
