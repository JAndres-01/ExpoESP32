const loginElement = document.querySelector('#login-form');
const contentElement = document.querySelector('#content-sign-in');
const authBarElement = document.querySelector('#authentication-bar');
const menuUserEmail = document.querySelector('#menu-user-email');

const sensorElements = {
  temperature: [document.getElementById('temp'), document.getElementById('t2')],
  humidity: [document.getElementById('hum')],
};

const timeElement = document.getElementById('time');
const dateElement = document.getElementById('date');
const date2Element = document.getElementById('date2');

let readingsRef = null;

const setText = (element, value) => {
  if (element) element.textContent = value;
};

const setVisible = (element, isVisible) => {
  if (element) element.classList.toggle('is-hidden', !isVisible);
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
  setText(date2Element, timeString);
};

const resetSensorValues = () => {
  sensorElements.temperature.forEach((element) => setText(element, '--.- \u00b0C'));
  sensorElements.humidity.forEach((element) => setText(element, '---%'));
};

const showLoggedOutUI = () => {
  setVisible(loginElement, true);
  setVisible(authBarElement, false);
  setVisible(contentElement, false);
  setText(menuUserEmail, '');
  resetSensorValues();
};

const showLoggedInUI = (user) => {
  setVisible(loginElement, false);
  setVisible(authBarElement, true);
  setVisible(contentElement, true);
  setText(menuUserEmail, user.email);
};

const listenToReading = (name, unit, fallback = 'N/A') => {
  readingsRef.child(name).on(
    'value',
    (snapshot) => {
      const rawValue = snapshot.val();
      const numericValue = Number.parseFloat(rawValue);
      const value = rawValue === null || Number.isNaN(numericValue) ? fallback : `${numericValue.toFixed(1)} ${unit}`;
      sensorElements[name].forEach((element) => setText(element, value));
    },
    (error) => {
      console.error(`Error leyendo ${name}:`, error);
      sensorElements[name].forEach((element) => setText(element, 'Error'));
    }
  );
};

const setupUI = (user) => {
  if (readingsRef) {
    readingsRef.off();
    readingsRef = null;
  }

  if (!user) {
    showLoggedOutUI();
    return;
  }

  showLoggedInUI(user);
  readingsRef = db.ref(`UsersData/${user.uid}`);
  listenToReading('temperature', '\u00b0C');
  listenToReading('humidity', '%');
};

updateClock();
setInterval(updateClock, 1000);
