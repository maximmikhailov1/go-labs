const dateSelect = document.getElementById('lab-date');
const labSelect = document.getElementById('lab-number');
const timeSelect = document.getElementById('class-number');
const registrationForm = document.getElementById('registration-form')


registrationForm.addEventListener('submit',(event)=>{
  event.preventDefault()
  console.log("zzz")  
}

)
// Функция для получения дат с сервера
async function getLabs() {
  try {
    const response = await fetch('../api/labs/numbers');
    const labNumbers = await response.json();

    labNumbers.forEach(labNumber => {
      const option = document.createElement('option');
      option.value = labNumber;
      option.text = labNumber;
      labSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Ошибка при получении лаб:', error);
  }
}
async function getDates() {
  try {
    const response = await fetch('../api/records/dates/');
    const dates = await response.json();

    dates.forEach(date => {
      const option = document.createElement('option');
      option.value = date;
      option.text = date;
      dateSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Ошибка при получении дат:', error);
  }
}

// Функция для получения времен для выбранной даты
async function getTimes(date) {
  try {
    const response = await fetch(`../api/records/times/${date}`);
    const times = await response.json();

    timeSelect.innerHTML = '';
    times.forEach(time => {
      const option = document.createElement('option');
      option.value = time;
      option.text = time;
      timeSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Ошибка при получении времен:', error);
  }
}

// Обработчик изменения даты
dateSelect.addEventListener('change', () => {
  const selectedDate = dateSelect.value;
  getTimes(selectedDate);
});

// Вызов функции при загрузке страницы
getDates();
getLabs();