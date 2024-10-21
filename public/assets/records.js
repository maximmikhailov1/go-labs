
const labForm = document.getElementById('lab-form');
const labTable = document.getElementById('lab-table');

labForm.addEventListener('submit', (event) => {
    event.preventDefault();

    // Получение значений из формы
    const timeStart = document.getElementById('time-start').value;
    const audienceNumber = parseInt(document.getElementById('audience-number').value);
    const tutor = document.getElementById('tutor').value;
    // Отправка данных на бекэнд (например, с помощью fetch API)
    fetch('/add-record', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            LabTimeStart: timeStart,
            AudienceNumber: audienceNumber,
            Tutor: tutor,
        })
    })
    .then(response => {
        // Обработка ответа от бекэнда
        if (response.ok) {
            labForm.reset();
            updateLabTable();
        } else {
            console.error('Ошибка отправки данных на бекэнд.');
        }
    })
    .catch(error => {
        console.error('Ошибка сети:', error);
    });
});

// Функция для обновления таблицы с данными из бекэнда
function updateLabTable() {
    fetch('/get-records')
    .then(response => {
        return response.json();
    })
    .then(records => {
        const tableBody = labTable.querySelector('tbody');
        tableBody.innerHTML = '';
        for (let i = 0; i< records.length; i++){
            const row = tableBody.insertRow();
            record = records[i]
            row.insertCell().textContent = record.LabTimeStart; // Предполагается, что LabTimeStart будет в формате строки
            row.insertCell().textContent = record.AudienceNumber;
            row.insertCell().textContent = record.Tutor;
            row.insertCell().textContent = record.Student_IDs;
            //TODO: ADD DELETE BUTTON
        }
        })
    .catch(error => {
        console.error('Ошибка получения данных из бекэнда:', error);
    });
}

// Инициализация таблицы
updateLabTable();
