// Получение ID записи из URL
const recordId = window.location.pathname.split('/').pop(); // Получение ID из URL

// Функция для загрузки данных о записи
async function loadRecordDetails() {
  try {
    const response = await fetch(`/api/records/${recordId}`);
    const recordInfo = await response.json();
    console.log(recordInfo)

    // Заполнение таблицы студентов
    populateStudentsTable(recordInfo.Students);
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
  }
}

// Функция для заполнения таблицы студентов
function populateStudentsTable(students) {
  const tableBody = document.getElementById('studentsTable').getElementsByTagName('tbody')[0];
  tableBody.innerHTML = '';

  students.forEach(student => {
    const row = tableBody.insertRow();
    const lastNameCell = row.insertCell();
    const firstNameCell = row.insertCell();
    const groupCell = row.insertCell();

    lastNameCell.textContent = student.SecondName;
    firstNameCell.textContent = student.FirstName;
    groupCell.textContent = student.Group
  });
}

// Вызов функции при загрузке страницы
loadRecordDetails();