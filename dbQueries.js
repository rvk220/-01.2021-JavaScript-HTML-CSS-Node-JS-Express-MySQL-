const query = require('./MySQL.js').query;

function createEmployeeTableIfNotExists() {
    return query(`CREATE TABLE IF NOT EXISTS Employees (id int NOT NULL AUTO_INCREMENT, fullName varchar(100), phone int, gender char(1), birthDate date, numOfChildren tinyint, workStartDate date, workType tinyint, department int, workLoad dec(3,2), currentStatus tinyint, workEndDate date, maternityLeaveEndDate date, tempEndDate date, substEmployee int, extraInfo varchar(255), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci`);
}

function postEmployee(employee) {
    const { fullName, phone, gender, birthDate, workStartDate, numOfChildren,
        workType, department, workLoad, currentStatus, extraInfo, workEndDate,
        maternityLeaveEndDate, tempEndDate, substEmployee } = employee;
    const statement = `INSERT INTO Employees (fullName, phone, gender, birthDate, workStartDate, numOfChildren, workType, department, workLoad, currentStatus, workEndDate, maternityLeaveEndDate, tempEndDate, substEmployee, extraInfo) VALUES ("${fullName}", "${phone}", "${gender}", "${birthDate}", "${workStartDate}", "${numOfChildren}", "${workType}", "${department}", "${workLoad}", "${currentStatus}", ${workEndDate ? `"${workEndDate}"` : null}, ${maternityLeaveEndDate ? `"${maternityLeaveEndDate}"` : null}, ${tempEndDate ? `"${tempEndDate}"` : null}, ${substEmployee ? `${substEmployee}` : 0}, "${extraInfo}")`;
    return query(statement)
    .catch(() => createEmployeeTableIfNotExists()
    .then(() => query(statement)))
}

function searchEmployee(requestBody) {
    let statement;
    if (!requestBody.queryStatement) {
        statement = "SELECT * FROM Employees";
        if (Object.getOwnPropertyNames(requestBody).length) {
            const proc = (value, isPrecise) => {
                return isPrecise ? `= "${value}"` : `LIKE '%${value}%'`;
            }
            let isFirst = true;
            for (const [key, [value, isPrecise]] of Object.entries(requestBody)) {
                statement += (isFirst ? ' WHERE ' : ' AND ') + `${key} ${proc(value, isPrecise)}`;
                if (isFirst) { isFirst = false }
            }
        }
    } else {
        statement = requestBody.queryStatement;
    }
    return query(statement)
    .catch(() => createEmployeeTableIfNotExists()
    .then(() => query(statement)))
}

function editEmployee({ id, updates }) {
    const { fullName, phone, gender, birthDate, workStartDate, numOfChildren,
        workType, department, workLoad, currentStatus, extraInfo, workEndDate,
        maternityLeaveEndDate, tempEndDate, substEmployee } = updates;
    const statement = `UPDATE Employees SET fullName = '${fullName}', phone = '${phone}', gender = '${gender}', birthDate = '${birthDate}', workStartDate = '${workStartDate}', numOfChildren = '${numOfChildren}', workType = '${workType}', department = '${department}', workLoad = '${workLoad}', currentStatus = '${currentStatus}', workEndDate = ${workEndDate ? `"${workEndDate}"` : null}, maternityLeaveEndDate = ${maternityLeaveEndDate ? `"${maternityLeaveEndDate}"` : null}, tempEndDate = ${tempEndDate ? `"${tempEndDate}"` : null}, substEmployee = ${substEmployee ? `${substEmployee}` : 0}, extraInfo = '${extraInfo}' WHERE id = ${id}`;
    return query(statement)
    .catch(() => createEmployeeTableIfNotExists()
    .then(() => query(statement)))
}

function deleteEmployee({id}) {
    return query(`DELETE FROM Employees WHERE id = ${id}`);
}

function createFacultiesTableIfNotExists() {
    return query(`CREATE TABLE IF NOT EXISTS Faculties (id int NOT NULL AUTO_INCREMENT, facultyName varchar(255), extraInfo text, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci`)
}

function postFaculty({ facultyName, extraInfo }) {
    const statement = `INSERT INTO Faculties (facultyName, extraInfo) VALUES ("${facultyName}", "${extraInfo}")`;
    return query(statement)
    .catch(() => createFacultiesTableIfNotExists().then(() => query(statement)))
}

function searchFaculty(requestBody) {
    //console.log(requestBody)
    let statement;
    if(requestBody.queryStatement) {
        statement = requestBody.queryStatement;
    } else {
        statement = 'SELECT * FROM Faculties';
        if (Object.getOwnPropertyNames(requestBody).length) {
            const proc = (value, isPrecise) => {
                return isPrecise ? `= "${value}"` : `LIKE '%${value}%'`;
            }
            let isFirst = true;
            for (const [key, [value, isPrecise]] of Object.entries(requestBody)) {
                statement += (isFirst ? ' WHERE ' : ' AND ') + `${key} ${proc(value, isPrecise)}`;
                if (isFirst) { isFirst = false }
            }
        }
    }
    return query(statement)
    .catch(() => createFacultiesTableIfNotExists().then(() => query(statement)))
}

function editFaculty({id, updates}) {
    const statement = `Update Faculties SET facultyName = '${updates.facultyName}', extraInfo = '${updates.extraInfo}' WHERE id = ${id}`;
    return query(statement);   
}

function deleteFaculty({id}) {
    return query(`DELETE FROM Faculties WHERE id = ${id}`)
    .then(deletedFacultyResult => {
        return query(`DELETE FROM Departments WHERE facultyId = ${id}`)
        .then(deletedDepartmentsResult => {
            return {deletedFacultyResult, deletedDepartmentsResult};
        })
    })
}

function createDepartmentsTableIfNotExists() {
    return query(`CREATE TABLE IF NOT EXISTS Departments (id int NOT NULL AUTO_INCREMENT, departmentName varchar(255), facultyId int, extraInfo text, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci`)
}

function postDepartment({ departmentName, facultyId, extraInfo}) {
    const statement = `INSERT INTO Departments (departmentName, facultyId, extraInfo) VALUES ("${departmentName}", ${facultyId}, "${extraInfo}")`;
    return query(statement)
    .catch(() => createDepartmentsTableIfNotExists().then(() => query(statement)))
}

function searchDepartment(requestBody) {
    let statement;
    if(requestBody.queryStatement) {
        statement = requestBody.queryStatement;
    } else {
        statement = 'SELECT * FROM Departments';
        if (Object.getOwnPropertyNames(requestBody).length) {
            const proc = (value, isPrecise) => {
                return isPrecise ? `= "${value}"` : `LIKE '%${value}%'`;
            }
            let isFirst = true;
            for (const [key, [value, isPrecise]] of Object.entries(requestBody)) {
                statement += (isFirst ? ' WHERE ' : ' AND ') + `${key} ${proc(value, isPrecise)}`;
                if (isFirst) { isFirst = false }
            }
        }
    }
    return query(statement)
    .catch(() => createFacultiesTableIfNotExists().then(() => query(statement)))
}


function editDepartment({id, updates}) {
    const statement = `Update Departments SET departmentName = '${updates.departmentName}', facultyId = '${updates.facultyId}', extraInfo = '${updates.extraInfo}' WHERE id = ${id}`;
    return query(statement);
}

function deleteDepartment({id}) {
    return query(`DELETE FROM Departments WHERE id = ${id}`);
}

function createVacanciesTableIfNotExists() {
    return query(`CREATE TABLE IF NOT EXISTS Vacancies (id int NOT NULL AUTO_INCREMENT, workType tinyint, department int, workLoad dec(3,2), startDate date, endDate date, substEmployee int, extraInfo varchar(255), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci`);
}

function postVacancy({ workType, department, workLoad, startDate, endDate, substEmployee, extraInfo }) {
    const statement = `INSERT INTO Vacancies (workType, department, workLoad, startDate, endDate, substEmployee, extraInfo) VALUES ("${workType}", "${department}", "${workLoad}", ${startDate ? `"${startDate}"` : null}, ${endDate ? `"${endDate}"` : null}, "${substEmployee}", "${extraInfo}")`
    return query(statement)
    .catch(() => createVacanciesTableIfNotExists()
        .then(() => query(statement)));
}

function searchVacancy(requestBody) {
    let [statement, isFirst] = ["SELECT * FROM Vacancies", true];
    for(const [key, [value, sign]] of Object.entries(requestBody)) {
        statement += (isFirst ? ' WHERE ' : ' AND ') +`${key} ${sign} ${value}`;
        if (isFirst) { isFirst = false; }
    }
    return query(statement)
    .catch(() => createVacanciesTableIfNotExists()
        .then(() => query(statement)))
}

function editVacancy({ id, updates }) {
    const { workType, department, workLoad, startDate,
        endDate, substEmployee, extraInfo } = updates;
    const statement = `UPDATE Vacancies SET workType = '${workType}', department ='${department}', workLoad = '${workLoad}', startDate = '${startDate}', endDate = '${endDate}', substEmployee = '${substEmployee}', extraInfo = '${extraInfo}' WHERE id = ${id}`;
    return query(statement);
}

function deleteVacancy({ id, substEmployee }) {
    return query('DELETE FROM Vacancies WHERE ' +
    (id ? `id = ${id}` : `substEmployee = ${substEmployee}`));
}

module.exports = {postEmployee, createEmployeeTableIfNotExists, searchEmployee, editEmployee, deleteEmployee,
    postFaculty, searchFaculty, postDepartment, editFaculty, deleteFaculty, searchDepartment, editDepartment,
    deleteDepartment, postVacancy, searchVacancy, editVacancy, deleteVacancy };