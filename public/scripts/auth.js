const loginForm = document.querySelector('#login-form');
const settingsBtn = document.querySelector('#settings-btn');
const settingsMenu = document.querySelector('#settings-menu');
const logoutBtn = document.querySelector('#logout-btn');
const errorMessage = document.getElementById('error-message');
const settingsMenuAnimationTime = 200;

let settingsMenuCloseTimer = null;

auth.onAuthStateChanged((user) => {
  if (typeof setupUI === 'function') {
    setupUI(user);
  }
});

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const email = loginForm['input-email'].value.trim();
  const password = loginForm['input-password'].value;

  if (!email || !password) {
    errorMessage.textContent = 'Por favor completa todos los campos';
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      errorMessage.textContent = '';
      loginForm.reset();
    })
    .catch((error) => {
      console.error('Error de login:', error.code, error.message);
      errorMessage.textContent = 'Credenciales Invalidas';
    });
});

const openSettingsMenu = () => {
  clearTimeout(settingsMenuCloseTimer);
  settingsMenu.classList.remove('settings-menu-out');
  settingsMenu.classList.remove('is-hidden');
};

const closeSettingsMenu = () => {
  if (settingsMenu.classList.contains('is-hidden')) return;

  clearTimeout(settingsMenuCloseTimer);
  settingsMenu.classList.add('settings-menu-out');

  settingsMenuCloseTimer = setTimeout(() => {
    settingsMenu.classList.add('is-hidden');
    settingsMenu.classList.remove('settings-menu-out');
  }, settingsMenuAnimationTime);
};

settingsBtn.addEventListener('click', (event) => {
  event.stopPropagation();

  if (settingsMenu.classList.contains('is-hidden') || settingsMenu.classList.contains('settings-menu-out')) {
    openSettingsMenu();
  } else {
    closeSettingsMenu();
  }
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('#authentication-bar')) {
    closeSettingsMenu();
  }
});

logoutBtn.addEventListener('click', (event) => {
  event.preventDefault();
  closeSettingsMenu();
  auth.signOut();
});
