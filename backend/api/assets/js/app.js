const dateSelect = document.getElementById('lab-date');
const labSelect = document.getElementById('lab-number');
const timeSelect = document.getElementById('class-number');
const registrationForm = document.getElementById('registration-form')


registrationForm.addEventListener('submit',(event)=>{
  event.preventDefault() 
  const discipline = document.getElementById("discipline").value
  const labNumber = document.getElementById("lab-number").value
  const labDate = new Date(document.getElementById("lab-date").value)
  const classNumber = parseInt(document.getElementById("class-number").value)
  const studentSurname = document.getElementById("student-surname").value
  const studentName = document.getElementById("student-name").value
  const studentGroup = document.getElementById("student-group").value
  const description = document.getElementById("description").value

  fetch('../api/registration', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        Discipline: discipline,
        LabNumber : labNumber,
        LabDate: labDate,
        ClassNumber: classNumber,
        StudentSurname: studentSurname,
        StudentName: studentName,
        StudentGroup: studentGroup,
        Description: description
    })
  })
  .then(response => {
      // Обработка ответа от бекэнда
      if (response.ok) {
          console.log(response.json)
      } else {
          console.error('Ошибка отправки данных на бекэнд.');
      }
  })
  .catch(error => {
      console.error('Ошибка сети:', error);
  }); 
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