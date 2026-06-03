const USER_UID = 'vNtCE0HypCXzySzs2JmSxL5adNn1';

const sensorElements = {
  temperature: [document.getElementById('temp')],
  humidity: [document.getElementById('hum')],
};

const timeElement = document.getElementById('time');
const dateElement = document.getElementById('date');
const date2Element = document.getElementById('date2');
const sensorStatusElement = document.getElementById('sensor-status');

let readingsRef = null;
let connectionRef = null;
let staleDataTimer = null;
let readingsPollTimer = null;
const EXPECTED_READING_INTERVAL_MS = 2000;
const DISCONNECT_GRACE_MS = 3000;
const STALE_DATA_TIMEOUT_MS = EXPECTED_READING_INTERVAL_MS + DISCONNECT_GRACE_MS;
const READINGS_POLL_INTERVAL_MS = 2000;
let sensorStartedAt = null;
let latestReadingSignature = null;

const setText = (element, value) => {
  if (element) element.textContent = value;
};

const getActiveSeconds = () => {
  if (sensorStartedAt === null) {
    return 0;
  }

  return Math.floor((Date.now() - sensorStartedAt) / 1000);
};

const updateClock = () => {
  const now = new Date();
  const timeString = now.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const dateString = now.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  setText(timeElement, timeString);
  setText(dateElement, dateString);
  setText(date2Element, formatDuration(getActiveSeconds()));
};

const formatDuration = (rawSeconds) => {
  const totalSeconds = Math.max(0, Math.floor(Number(rawSeconds) || 0));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, '0'))
    .join(':');
};

const resetSensorValues = () => {
  sensorElements.temperature.forEach((element) => setText(element, '--.- \u00b0C'));
  sensorElements.humidity.forEach((element) => setText(element, '---%'));
  sensorStartedAt = null;
  latestReadingSignature = null;
  setText(date2Element, formatDuration(0));
};

const setSensorStatus = (isOnline) => {
  setText(sensorStatusElement, isOnline ? 'Conectado' : 'Sin conexion');
  if (sensorStatusElement) {
    sensorStatusElement.classList.toggle('status-online', isOnline);
    sensorStatusElement.classList.toggle('status-offline', !isOnline);
  }
};

const setSensorMessage = (message, isOnline = false) => {
  setText(sensorStatusElement, message);
  if (sensorStatusElement) {
    sensorStatusElement.classList.toggle('status-online', isOnline);
    sensorStatusElement.classList.toggle('status-offline', !isOnline);
  }
};

const markSensorsOffline = (message = 'Sin conexion') => {
  staleDataTimer = null;
  resetSensorValues();
  setSensorMessage(message);
};

const armStaleDataTimer = () => {
  clearTimeout(staleDataTimer);
  staleDataTimer = setTimeout(markSensorsOffline, STALE_DATA_TIMEOUT_MS);
};

const refreshStaleDataTimer = () => {
  setSensorStatus(true);
  armStaleDataTimer();
};

const clearSensorTimers = () => {
  clearTimeout(staleDataTimer);
  staleDataTimer = null;
  clearInterval(readingsPollTimer);
  readingsPollTimer = null;
  if (connectionRef) {
    connectionRef.off();
    connectionRef = null;
  }
};

const formatReading = (rawValue, unit, fallback = 'N/A') => {
  const numericValue = Number.parseFloat(rawValue);
  return rawValue === null || Number.isNaN(numericValue) ? fallback : `${numericValue.toFixed(1)} ${unit}`;
};

const showReadings = (readings) => {
  if (!readings) {
    console.warn('Firebase respondio sin datos en la ruta del usuario.');
    markSensorsOffline('Sin datos');
    return;
  }

  console.log('Lectura recibida:', readings);
  const incomingUptimeSeconds = Math.max(0, Math.floor(Number(readings.uptimeSeconds) || 0));
  const readingSignature = `${readings.readingCount ?? ''}:${readings.lastUpdateMs ?? ''}:${incomingUptimeSeconds}`;

  if (latestReadingSignature === null) {
    latestReadingSignature = readingSignature;
    return;
  }

  if (readingSignature !== latestReadingSignature) {
    latestReadingSignature = readingSignature;
    sensorElements.temperature.forEach((element) => setText(element, formatReading(readings.temperature, '\u00b0C')));
    sensorElements.humidity.forEach((element) => setText(element, formatReading(readings.humidity, '%')));
    if (sensorStartedAt === null) {
      sensorStartedAt = Date.now() - (incomingUptimeSeconds * 1000);
    }
    setText(date2Element, formatDuration(getActiveSeconds()));
    refreshStaleDataTimer();
  }
};

const showReadingsError = (error, shouldStop = true) => {
  console.error('Error leyendo sensores:', error);
  if (shouldStop) clearSensorTimers();
  setSensorMessage(error?.code === 'PERMISSION_DENIED' || error?.message?.includes('401') ? 'Sin permiso' : 'Error');
  Object.values(sensorElements).flat().forEach((element) => setText(element, 'Error'));
};

const getReadingsUrl = () => {
  const databaseUrl = db.app.options.databaseURL.replace(/\/$/, '');
  return `${databaseUrl}/UsersData/${USER_UID}.json?ts=${Date.now()}`;
};

const pollReadings = async () => {
  try {
    console.log('Leyendo Firebase por REST...');
    const response = await fetch(getReadingsUrl(), {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    showReadings(await response.json());
  } catch (error) {
    showReadingsError(error, false);
  }
};

const listenToReadings = () => {
  connectionRef = db.ref('.info/connected');
  connectionRef.on('value', (snapshot) => {
    console.log('Conexion Realtime Database:', snapshot.val());
    if (!snapshot.val()) setSensorStatus(false);
  });

  readingsRef.on(
    'value',
    (snapshot) => showReadings(snapshot.val()),
    showReadingsError
  );

  pollReadings();
  readingsPollTimer = setInterval(pollReadings, READINGS_POLL_INTERVAL_MS);
};

const logReadingsPath = () => {
  console.log(`Leyendo Firebase en UsersData/${USER_UID}`);

  readingsRef.once('value')
    .then((snapshot) => {
      console.log('Datos iniciales del dashboard:', snapshot.val());
    })
    .catch((error) => {
      console.error('No se pudo leer la ruta inicial del dashboard:', error);
    });
};

const setupUI = () => {
  if (readingsRef) {
    readingsRef.off();
    readingsRef = null;
  }
  clearSensorTimers();

  resetSensorValues();
  setSensorStatus(false);
  readingsRef = db.ref(`UsersData/${USER_UID}`);
  logReadingsPath();
  listenToReadings();
};

updateClock();
setInterval(updateClock, 250);
setupUI();
