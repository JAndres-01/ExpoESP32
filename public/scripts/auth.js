const loginForm = document.querySelector('#login-form');
const settingsBtn = document.querySelector('#settings-btn');
const settingsMenu = document.querySelector('#settings-menu');
const logoutBtn = document.querySelector('#logout-btn');
const errorMessage = document.getElementById('error-message');

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
      errorMessage.textContent = error.message;
    });
});

settingsBtn.addEventListener('click', (event) => {
  event.stopPropagation();
  settingsMenu.classList.toggle('is-hidden');
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('#authentication-bar')) {
    settingsMenu.classList.add('is-hidden');
  }
});

logoutBtn.addEventListener('click', (event) => {
  event.preventDefault();
  settingsMenu.classList.add('is-hidden');
  auth.signOut();
});
