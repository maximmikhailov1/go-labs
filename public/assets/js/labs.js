const labForm = document.getElementById('lab-form');
const labTable = document.getElementById('lab-table');
labForm.addEventListener('submit', (event) => {
    event.preventDefault();

    // Получение значений из формы

    const subjectName = document.getElementById('subject-name').value;
    const labNumber = document.getElementById('lab-number').value;
    const labDescription = document.getElementById('lab-description').value;
    const routersRequired = parseInt(document.getElementById('routers-required').value);
    const switchesRequired = parseInt(document.getElementById('switches-required').value);

    // Отправка данных на бекэнд (например, с помощью fetch API)
    fetch('../api/labs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            SubjectName: subjectName,
            Number : labNumber,
            Description: labDescription,
            RoutersRequired: routersRequired,
            SwitchesRequired: switchesRequired
        })
    })
    .then(response => {
        // Обработка ответа от бекэнда
        if (response.ok) {
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
    fetch('../api/labs')
    .then(response => {
        return response.json();
    })
    .then(labs => {
        const tableBody = labTable.querySelector('tbody');
        tableBody.innerHTML = '';
        for (let i = 0; i< labs.length; i++){
            const row = tableBody.insertRow();
            const lab = labs[i]
            row.insertCell().textContent = lab.SubjectName;
            row.insertCell().textContent = lab.Number;
            row.insertCell().textContent = lab.Description;
            row.insertCell().textContent = lab.RoutersRequired;
            row.insertCell().textContent = lab.SwitchesRequired;
            row.insertCell().innerHTML = `<input class="button delete" type="button" id="button${lab.ID}" value="Удалить" onclick="labDelete(this,${lab.ID})">`
        }
        })
    .catch(error => {
        console.error('Ошибка получения данных из бекэнда:', error);
    });
}
// Функция для удаления строки в таблице
function labDelete(obj, id){
    var row = obj.parentNode.parentNode;
    row.parentNode.removeChild(row)
    fetch(`api/labs/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
    })
}
// Инициализация таблицы
updateLabTable();
