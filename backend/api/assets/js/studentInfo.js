const studentId = window.location.pathname.split('/').pop()

async function loadStudentRecordsDetails() {
    try {
        const response = await fetch(`/api/student/${studentId}`);
        const recordsInfo = await response.json();
        console.log(recordsInfo)

        // Заполнение таблицы студентов
        populateRecordsTable(recordsInfo.Records);
    } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
    }
}

function populateRecordsTable(records) {
    const tableBody = document.getElementById('records-table').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';
  
    records.forEach(record => {
        const row = tableBody.insertRow();
        const date = row.insertCell();
        const classNumber = row.insertCell();
        const audienceNumber = row.insertCell();
        const tutor = row.insertCell();
        const deleteB = row.insertCell();
        const LabDateUnFormatted = new Date(record.LabDate);
        const LabDateFormatted = new Intl.DateTimeFormat(['ban','id']).format(LabDateUnFormatted);
        date.textContent = LabDateFormatted;
        classNumber.textContent = record.ClassNumber;
        audienceNumber.textContent = record.AudienceNumber;
        tutor.textContent = record.Tutor;
    });
}
loadStudentRecordsDetails();