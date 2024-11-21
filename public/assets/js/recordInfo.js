// Получение ID записи из URL
const recordId = window.location.pathname.split('/').pop(); // Получение ID из URL

// Функция для загрузки данных о записи
// async function loadRecordDetails() {
//   try {
//     const response = await fetch(`/api/records/${recordId}`);
//     const record = await response.json();

//     // Заполнение данных о записи
//     document.getElementById('date').textContent = record.LabDate;
//     document.getElementById('time').textContent = record.ClassNumber;
//     document.getElementById('teacher').textContent = record.Tutor;

//     // Заполнение таблицы студентов
//     populateStudentsTable(record.Students);
//   } catch (error) {
//     console.error('Ошибка при загрузке данных:', error);
//   }
// }

// // Функция для заполнения таблицы студентов
// function populateStudentsTable(students) {
//   const tableBody = document.getElementById('studentsTable').getElementsByTagName('tbody')[0];
//   tableBody.innerHTML = '';

//   students.forEach(student => {
//     const row = tableBody.insertRow();
//     const lastNameCell = row.insertCell();
//     const firstNameCell = row.insertCell();
//     const groupCell = row.insertCell();
//     const labWorkCell = row.insertCell();

//     lastNameCell.textContent = student.LastName;
//     firstNameCell.textContent = student.FirstName;
//     groupCell.textContent = student.Group;
//     labWorkCell.textContent = student.LabWork;
//   });
// }

// // Вызов функции при загрузке страницы
// loadRecordDetails();