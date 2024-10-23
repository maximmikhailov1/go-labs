
const labForm = document.getElementById('lab-form');
const labTable = document.getElementById('lab-table');
labForm.addEventListener('submit', (event) => {
    event.preventDefault();

    // Получение значений из формы

    const labDate = document.getElementById('lab-date').value;
    const labDateToBack = new Date(labDate)
    const classNumber = parseInt(document.getElementById('class-number').value)
    const audienceNumber = parseInt(document.getElementById('audience-number').value);
    const tutor = document.getElementById('tutor').value;
    console.log(labDate,classNumber,audienceNumber,tutor)
    // Отправка данных на бекэнд (например, с помощью fetch API)
    fetch('api/records', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            LabDate: labDateToBack,
            ClassNumber : classNumber,
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
    fetch('api/records')
    .then(response => {
        return response.json();
    })
    .then(records => {
        const tableBody = labTable.querySelector('tbody');
        tableBody.innerHTML = '';
        for (let i = 0; i< records.length; i++){
            const row = tableBody.insertRow();
            record = records[i]
            recordId = record.ID
            const LabDateUnFormatted = new Date(record.LabDate);
            const LabDateFormatted = new Intl.DateTimeFormat(['ban', 'id']).format(LabDateUnFormatted);
            console.log(LabDateFormatted);
            row.insertCell().textContent = LabDateFormatted;
            row.insertCell().textContent = record.ClassNumber;
            row.insertCell().textContent = record.AudienceNumber;
            row.insertCell().textContent = record.Tutor;
            row.insertCell().textContent = record.Student_IDs;
            row.insertCell().innerHTML=`<input class="button delete" type="button" id="button${recordId}" value="Удалить" onclick="deleteRow(this,${recordId})">`
        }
        })
    .catch(error => {
        console.error('Ошибка получения данных из бекэнда:', error);
    });
}
// Функция для удаления строки в таблице
function deleteRow(obj, id){
    var row = obj.parentNode.parentNode;
    row.parentNode.removeChild(row)
    fetch(`api/records/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
    })
}
// Инициализация таблицы
updateLabTable();
