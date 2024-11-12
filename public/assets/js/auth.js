const loginForm = document.querySelector('.login-form');
const registerForm = document.querySelector('.registration-form');
const loginSwitch = document.getElementById('login-switch');
const registerSwitch = document.getElementById('register-switch');

// Переключение между формами
loginSwitch.addEventListener('click', () => {
  loginForm.style.display = 'block';
  registerForm.style.display = 'none';
  loginSwitch.classList.add('active');
  registerSwitch.classList.remove('active');
});

registerSwitch.addEventListener('click', () => {
  loginForm.style.display = 'none';
  registerForm.style.display = 'block';
  loginSwitch.classList.remove('active');
  registerSwitch.classList.add('active');
});

// Обработчики отправки форм (аналогичны обработчикам в предыдущем примере)
loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    if (response.ok) {
      // Успешный вход
      window.location.href = '/'; // Перенаправление на главную страницу
    } else {
      // Ошибка входа
      const error = await response.json();
      alert(error.message);
    }
  } catch (error) {
    console.error('Ошибка при отправке формы входа:', error);
  }
});

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    if (response.ok) {
      // Успешная регистрация
      alert('Регистрация прошла успешно! Вы можете войти.');
      //window.location.href = '/auth';
    } else {
      // Ошибка регистрации
      const error = await response.json();
      alert(error.message);
    }
  } catch (error) {
    console.error('Ошибка при отправке формы регистрации:', error);
  }
});