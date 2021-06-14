function onload() {
   fillFacultySelect();
}

function Faculty() {
    this.facultyName = qs('#addFacultyDiv table tr:nth-child(1) > td:nth-child(2) > input').value;
    this.extraInfo = qs('#addFacultyDiv table tr:nth-child(2) > td:nth-child(2) > textarea').value;
}

Faculty.prototype.checkInput = function() {
    if(!this.facultyName) {
        alert('Помилка: не введено назви факультету!');
    } else {
        return this;
    }
}

Faculty.prototype.printInfo = function() {
    const li = document.createElement('li');
    li.innerHTML = `<span style="font-weight:bold;">${this.facultyName}</span>`
    + `, id: <span>${this.id}</span>`
    + (this.extraInfo ? `, додаткова інформація: <span>${this.extraInfo}</span>` : '') + '.'
    + `<div class="centeredContentContainer"><button data-id="${this.id}" onclick="clickEditFaculty(getParentNode(this, 2))" style="font-size:50%">Редагувати факультет</button> <button data-id="${this.id}" onclick="clickDeleteFaculty(getParentNode(this, 2))" style="font-size:50%">Вилучити факультет</button></div>`;
    return li;
}

Faculty.printList = function(faculties) {
    const printInfo = obj => Faculty.prototype.printInfo.call(obj);
    faculties.forEach(f => qs('#searchDepartmentResults ul').appendChild(printInfo(f)));
    if(qs('#searchDepartmentResults ul li')) {
        const clearButtonDiv = document.createElement('div');
        satt(clearButtonDiv, 'class', 'centeredContentContainer');
        clearButtonDiv.innerHTML = `<button onclick="clearSearchFields()">очистити результати пошуку</button>`;
        qs('#searchDepartmentResults').insertBefore(clearButtonDiv, qs(`#searchDepartmentResults > ul`));
    } else {
        qs('#searchDepartmentResults').innerHTML += '<p class="centeredContentContainer">За вказаними критеріями не знайдено жодного факультету</p>';
    }
}

function Department() {
    this.departmentName = qs('#addDepartmentDiv table tr:nth-child(1) > td:nth-child(2) > input').value;
    this.extraInfo = qs('#addDepartmentDiv table tr:nth-child(3) > td:nth-child(2) > textarea').value;
    if(qs('#tdFaculties select')) {
        this.facultyId = qs('#tdFaculties > select').value;
    }
}

Department.prototype.checkInput = function() {
    if(!this.departmentName) {
        alert('Помилка: не введено назви кафедри!');
    } else if (!this.facultyId) {
        alert('Помилка: неможливо вибрати факультет, до якого належить кафедра.');
    } else {
        return this;
    }
}

Department.prototype.printInfo = function() {
    const li = document.createElement('li');
    li.innerHTML = `<span style="font-weight:bold;">${this.departmentName}</span>`
    + `, id: <span>${this.id}</span>`
    + `, факультет: <span></span>`
    + (this.extraInfo ? `, додаткова інформація: <span>${this.extraInfo}</span>` : '') + '.'
    + `<div class="centeredContentContainer"><button data-id="${this.id}" onclick="clickEditDepartment(getParentNode(this, 2), ${this.facultyId})" style="font-size:50%">Редагувати кафедру</button> <button data-id="${this.id}" onclick="clickDeleteDepartment(getParentNode(this, 2))" style="font-size:50%">Вилучити кафедру</button></div>`;
    ajax('OPTIONS', 'facultiesPage', {id: [this.facultyId, true]})
        .then(result => {
            li.querySelector('span:nth-child(3)').innerHTML = JSON.parse(result)[0].facultyName;
        })
        .catch(err => console.error(err));
    return li;
}

Department.printList = function(departments) {
    const printInfo = obj => Department.prototype.printInfo.call(obj);
    departments.forEach(d => qs('#searchDepartmentResults ul').appendChild(printInfo(d)));
    if(qs('#searchDepartmentResults ul li')) {
        const clearButtonDiv = document.createElement('div');
        satt(clearButtonDiv, 'class', 'centeredContentContainer');
        clearButtonDiv.innerHTML = `<button onclick="clearSearchFields()">очистити результати пошуку</button>`;
        qs('#searchDepartmentResults').insertBefore(clearButtonDiv, qs(`#searchDepartmentResults > ul`));
    } else {
        qs('#searchDepartmentResults').innerHTML += '<p class="centeredContentContainer">За вказаними критеріями не знайдено жодної кафедри</p>';
    }
}

function clickCreateNewFaculty() {
    qs('#addFacultyDiv > div > p > strong').innerHTML = "Створити факультет";
    if(!elid('addDepartmentDiv').classList.contains('hidden')) {
        clickCloseaddDepartmentDiv();
    }
    unhide('addFacultyDiv');
    disableMainElements();
}

function clickCreateNewDepartment() {
    qs('#addDepartmentDiv > div > p > strong').innerHTML = "Створити кафедру";
    fillFacultySelect();
    unhide('addDepartmentDiv');
    disableMainElements();
}

function clickCloseaddFacultyDiv() {
    hide('addFacultyDiv');
    if(!qs('#addFacultyDiv > div > p > strong > span')) {
        disableMainElements(false);
    } else {
        unhide('searchDepartmentDiv');
    }
    qs('#addFacultyDiv table tr:nth-child(1) > td:nth-child(2) > input').value = '';
    qs('#addFacultyDiv table tr:nth-child(2) > td:nth-child(2) > textarea').value = '';
}

function clickCloseaddDepartmentDiv() {
    hide('addDepartmentDiv');
    if(!qs('#addDepartmentDiv > div > p > strong > span')) {
        disableMainElements(false);
    } else {
        unhide('searchDepartmentDiv');
    }
    qs('#addDepartmentDiv table tr:nth-child(1) > td:nth-child(2) > input').value = '';
    qs('#addDepartmentDiv table tr:nth-child(3) > td:nth-child(2) > textarea').value = '';
}

function disableMainElements(disable = true) {
    toggleClassQS('#bottomDiv', 'unclickable', disable);
    toggleClassQS('#aDiv', 'unclickable', disable);
}

function clickConfirmAddOrEditFaculty() {
    if(!qs('#addFacultyDiv > div > p > strong > span')) {
        confirmAddFaculty();
    } else {
        confirmEditFaculty();
    }
}

function confirmAddFaculty() {
    const queryObject = new Faculty().checkInput();
    if (queryObject) {
        ajax('POST', 'facultiesPage', queryObject)
        .then(result => {
            console.log(result);
            alert(`Факультет "${queryObject.facultyName}" (id ${JSON.parse(result).insertId}) було успішно створено.`);
            clickCloseaddFacultyDiv();
        })
        .catch(err => {
            console.error(err);
            showXhrError(`Сталась помилка: «${err}».`, '#addFacultyResults');
        });
    }
}

function fillFacultySelect(inSearch = false, facultyId=0) {
    const elPath = inSearch ? '#tdFacultiesInSearch' : '#tdFaculties';
    ajax('OPTIONS', 'facultiesPage', {})
    .then(result => {
        const faculties = JSON.parse(result);
        if(!faculties[0]) {
            qs(elPath).innerHTML = `<p style="color:red">Помилка: у базі даних не знайдено жодного факультету. Перш ніж додавати кафедри, спершу <span onclick="clickCreateNewFaculty()" style="color:blue; text-decoration:underline">створіть факультет(и)</span>.</p>`;
        } else {
            const start = `<select>${inSearch ? '<option value="">Всі факультети</option>' : ''}`;
            qs(elPath).innerHTML = faculties.reduce((accum, f) => {
                return accum + `<option value="${f.id}">${f.facultyName}</option>`;
            }, start) + '</select>';
            if(facultyId) {
                qs(elPath).querySelector('select').value = facultyId;
            }
        }
    })
    .catch(err => {
        qs(elPath).innerHTML = `<p style="color:red">Не вдалося отримати список факультетів: помилка бази даних MySQL. Перевірте з'єднання з сервером та перезавантажте сторінку. Також Ви можете повторити спробу, натиснувши <span onclick="fillFacultySelect(${inSearch, facultyId})" style="color:blue; text-decoration:underline">тут</span>.</p>`;
        console.error(err);
    });
    
}

function clickConfirmAddOrEditDepartment() { //!!!
    if(!qs('#addDepartmentDiv > div > p > strong > span')) {
        confirmAddDepartment();
    } else {
        confirmEditDepartment();
    }
}

function confirmAddDepartment() {
    const queryObject = new Department().checkInput();
    if (queryObject) {
        ajax('POST', 'departmentsPage', queryObject)
        .then(result => {
            console.log(result);
            alert(`Кафедру "${queryObject.departmentName}" (id ${JSON.parse(result).insertId}) було успішно створено.`);
            clickCloseaddDepartmentDiv();
        })
        .catch(err => {
            console.error(err);
            showXhrError(`Сталась помилка: «${err}».`, '#addDepartmentResults');
        });
    }
}

function confirmEditDepartment() {
    const updates  = new Department().checkInput();
    if(updates) {
        const id = qs('#addDepartmentDiv > div > p > strong > span').innerHTML;
        ajax('PATCH', 'departmentsPage', {id: id, updates: updates})
        .then(response => {
            alert(`Кафедру ${updates.departmentName} (id` +
            `${id}) було успішно редаговано.`);
            console.log(response);
            clickCloseaddDepartmentDiv();
            confirmSearchFacultyOrDepartment();
        })
        .catch(err => {
            console.error(err);
            showXhrError(`Сталась помилка: «${err}».`, '#addDepartmentResults');
        })
    }
}

function clickChooseSearchFacultyOrDepartment() {
    clearSearchFields();
    if(document.getElementsByName('facultyOrDepartment')[0].checked) {
        chooseSearchDepartments();
    } else {
        chooseSearchFaculties();
    }
}

function chooseSearchDepartments() {
    //console.log('searching departments...')
    unhideQS('#searchDepartmentDiv tr:nth-child(2)');
    unhideQS('#searchDepartmentDiv tr:nth-child(3)');
    unhideQS('#searchDepartmentDiv tr:nth-child(4)');
    unhideQS('#searchDepartmentDiv tr:nth-child(5)');  
    hideQS('#searchDepartmentDiv tr:nth-child(6)');
    hideQS('#searchDepartmentDiv tr:nth-child(7)');
    hideQS('#searchDepartmentDiv tr:nth-child(8)');
}

function chooseSearchFaculties() {
    hideQS('#searchDepartmentDiv tr:nth-child(2)');
    hideQS('#searchDepartmentDiv tr:nth-child(3)');
    hideQS('#searchDepartmentDiv tr:nth-child(4)');
    hideQS('#searchDepartmentDiv tr:nth-child(5)');  
    unhideQS('#searchDepartmentDiv tr:nth-child(6)');
    unhideQS('#searchDepartmentDiv tr:nth-child(7)');
    unhideQS('#searchDepartmentDiv tr:nth-child(8)');
}

function clickSearchFacultyOrDepartment() {
    fillFacultySelect(true);
    unhide('searchDepartmentDiv');
    disableMainElements();
}

function clearSearchFields() {
    qs('#searchDepartmentDiv tr:nth-child(2) td:nth-child(3) input').value = '';
    qs('#searchDepartmentDiv tr:nth-child(4) td:nth-child(3) textarea').value = '';
    qs('#searchDepartmentDiv tr:nth-child(5) td:nth-child(3) input').value = '';
    qs('#searchDepartmentDiv tr:nth-child(6) td:nth-child(3) input').value = '';
    qs('#searchDepartmentDiv tr:nth-child(7) td:nth-child(3) textarea').value = '';
    qs('#searchDepartmentDiv tr:nth-child(8) td:nth-child(3) input').value = '';
    qs('#searchDepartmentResults').innerHTML = '<ul></ul>';
}

function clickCloseSearchDepartmentDiv() {
    hide('searchDepartmentDiv');
    disableMainElements(false);
    clearSearchFields();
}

function confirmSearchFacultyOrDepartment() {
    qs('#searchDepartmentResults').innerHTML = '<ul></ul>';
    if(document.getElementsByName('facultyOrDepartment')[0].checked) {
        confirmSearchDepartments();
    } else {
        confirmSearchFaculties();
    }
}

function confirmSearchDepartments() {
    const queryObject = {
        departmentName: [qs('#searchDepartmentDiv tr:nth-child(2) td:nth-child(3) input').value, qs('#searchDepartmentDiv tr:nth-child(2) td:nth-child(2) input').checked],
        facultyId: (() => {
            if(qs('#searchDepartmentDiv tr:nth-child(3) td:nth-child(3) select')) {
                return [qs('#searchDepartmentDiv tr:nth-child(3) td:nth-child(3) select').value, true];
            }
        })(),
        extraInfo: [qs('#searchDepartmentDiv tr:nth-child(4) td:nth-child(3) textarea').value, qs('#searchDepartmentDiv tr:nth-child(4) td:nth-child(2) input').checked],
        id: [qs('#searchDepartmentDiv tr:nth-child(5) td:nth-child(3) input').value, true]
    }
    for(const [key, value] of Object.entries(queryObject)) {
        if(!value || !value[0]) { delete queryObject[key]; }
    }
    ajax('OPTIONS', 'departmentsPage', queryObject)
    .then(results => {
        Department.printList(JSON.parse(results));
    })
    .catch(err => {
        console.error(err);
        showXhrError(`Сталась помилка: «${err}».`, '#searchDepartmentErrorResults');
    })
}

function confirmSearchFaculties() {
    const queryObject = {
        facultyName: [qs('#searchDepartmentDiv tr:nth-child(6) td:nth-child(3) input').value, qs('#searchDepartmentDiv tr:nth-child(6) td:nth-child(2) input').checked],
        extraInfo: [qs('#searchDepartmentDiv tr:nth-child(7) td:nth-child(3) textarea').value, qs('#searchDepartmentDiv tr:nth-child(7) td:nth-child(2) input').checked],
        id: [qs('#searchDepartmentDiv tr:nth-child(8) td:nth-child(3) input').value, true]
    }
    for(const [key, value] of Object.entries(queryObject)) {
        if(!value[0]) { delete queryObject[key]; }
    }
    ajax('OPTIONS', 'facultiesPage', queryObject)
    .then(results => {
        Faculty.printList(JSON.parse(results));
    })
    .catch(err => {
        console.error(err);
        showXhrError(`Сталась помилка: «${err}».`, '#searchDepartmentErrorResults');
    })
}

function clickEditFaculty(li) {
    const id = li.querySelector('span:nth-child(2)').textContent;
    const facultyName = li.querySelector('span:nth-child(1)').textContent;
    let extraInfo = '';
    if(li.querySelector('span:nth-child(3)')) {
        extraInfo = li.querySelector('span:nth-child(3)').textContent;
    }
    unhide('addFacultyDiv');
    hide('searchDepartmentDiv');
    qs('#addFacultyDiv > div > p > strong').innerHTML = `Редагувати факультет id<span>${id}</span>`;
    qs('#addFacultyDiv tr:nth-child(1) > td:nth-child(2) > input').value = facultyName;
    qs('#addFacultyDiv tr:nth-child(2) > td:nth-child(2) > textarea').value = extraInfo;
}

function confirmEditFaculty() {
    const updates  = new Faculty().checkInput();
    if(updates) {
        const id = qs('#addFacultyDiv > div > p > strong > span').innerHTML;
        ajax('PATCH', 'facultiesPage', {id: id, updates: updates})
        .then(response => {
            alert(`Факультет ${updates.facultyName} (id` +
            `${id}) було успішно редаговано.`);
            console.log(response);
            clickCloseaddFacultyDiv();
            confirmSearchFacultyOrDepartment();
        })
        .catch(err => {
            console.error(err);
            showXhrError(`Сталась помилка: «${err}».`, '#addFacultyResults');
        })
    }
}

function clickDeleteFaculty(li) {
    const id = li.querySelector('span:nth-child(2)').textContent;
    const facultyName = li.querySelector('span:nth-child(1)').textContent;
    if(confirm(`Ви справді бажаєте вилучити факультет «${facultyName}» (id${id}) разом зі всіма кафедрами, які до нього належать?`)) {
        ajax('DELETE', 'facultiesPage', {id: id})
        .then(response => {
            confirmSearchFacultyOrDepartment();
            console.log(JSON.parse(response));
            alert(`Факультет «${facultyName}» (id${id}) та всі кафедри, які до нього належать, було успішно вилучено.`)
        })
        .catch(err => {
            console.error(err);
            showXhrError(`Сталась помилка: «${err}».`, '#searchDepartmentErrorResults');
        })
    }
}



function clickEditDepartment(li, facultyId) {
    const id = li.querySelector('span:nth-child(2)').textContent;
    const departmentName = li.querySelector('span:nth-child(1)').textContent;
    let extraInfo = '';
    if(li.querySelector('span:nth-child(4)')) {
        extraInfo = li.querySelector('span:nth-child(4)').textContent;
    }
    fillFacultySelect(false, facultyId);
    unhide('addDepartmentDiv');
    hide('searchDepartmentDiv');
    qs('#addDepartmentDiv > div > p > strong').innerHTML = `Редагувати кафедру id<span>${id}</span>`;
    qs('#addDepartmentDiv table tr:nth-child(1) > td:nth-child(2) > input').value = departmentName;
    qs('#addDepartmentDiv table tr:nth-child(3) > td:nth-child(2) > textarea').value = extraInfo; 
}

function clickDeleteDepartment(li) {
    const id = li.querySelector('span:nth-child(2)').textContent;
    const departmentName = li.querySelector('span:nth-child(1)').textContent;
    if(confirm(`Ви справді бажаєте вилучити кафедру «${departmentName}» (id${id})?`)) {
        ajax('DELETE', 'departmentsPage', {id: id})
        .then(response => {
            confirmSearchFacultyOrDepartment();
            console.log(JSON.parse(response));
            alert(`Кафедру «${departmentName}» (id${id}) було успішно вилучено.`)
        })
        .catch(err => {
            console.error(err);
            showXhrError(`Сталась помилка: «${err}».`, '#searchDepartmentErrorResults');
        })
    }
}