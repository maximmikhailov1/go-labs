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

  const username = document.getElementById('lusername').value;
  const password = document.getElementById('lpassword').value;

  try {
    const response = await fetch('/api/signin', {
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

  const username = document.getElementById('susername').value;
  const password = document.getElementById('spassword').value;
  const firstName = document.getElementById('first-name').value;
  const secondName = document.getElementById('second-name').value;
  const patronymic = document.getElementById('patronymic').value;
  const group = document.getElementById('group').value;

  try {
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password, firstName, secondName, patronymic, group })
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