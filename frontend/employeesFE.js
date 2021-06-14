function Employee() {
    this.fullName = elid("name").value.trim();
    this.phone = elid("phone").value;
    this.gender = elid("gender").value;
    this.birthDate = elid("birthDate").value;
    this.numOfChildren = elid("numOfChildren").value;
    this.workStartDate = elid("workStartDate").value;
    this.workType = elid("workType").value;
    this.workLoad = elid("workLoad").value;
    this.currentStatus = elid("currentStatus").value;
    this.extraInfo = elid("extraInfo").value;
    this.workEndDate = elid("workEndDate").value || null;
    this.maternityLeaveEndDate = elid('maternityLeaveEndDate').value || null;
    this.substEmployee = 0;
    this.tempEndDate = null;
    this.department = (elid("workType").value > 1) ? qs("#department select").value : 0;
}

Employee.prototype.checkFields = function() {
    if(!this.fullName.match(/(.+)\s(.+)/)) {
        alert('Помилка: неправельне введення у полі \"ПІБ (прізвище, ім\'я, по-батькові)\".');
    }
    else if(!this.phone.match(/^0(\d{9})$/)) {
        alert('Помилка: неправельне введення у полі \"Телефон\" (номер повинен починатись із 0 та містити 10 цифр).');
    }
    else if(!this.birthDate) {
        alert('Помилка: не вказано дату народження.')
    }
    else if(!this.workStartDate) {
        alert('Помилка: не вказано дату початку роботи.')
    } else {
        return this;
    }
    return null;
}

Employee.prototype.printInfo = function(searchResultDivId) {
    trimDates(this, 'birthDate', 'workStartDate', 'workEndDate', 'maternityLeaveEndDate');
    const searchDivId = gatt(getParentNode(elid(searchResultDivId), 2), 'id');
    const li = document.createElement('li');
    li.innerHTML = `<span style="font-weight:bold;">${this.fullName}</span>`
    + ', id: ' + this.id
    + ', стать: ' + (this.gender === 'f' ? 'жін.' : 'чол.')
    + ', тел. 0' + this.phone + ", нар. " + this.birthDate
    + ", кількість дітей: " + (this.numOfChildren === 3 ? '3 або більше' : this.numOfChildren)
    + ", дата початку роботи: " + this.workStartDate
    + ", тип роботи: " + (() => {
        if (this.workType === 3) {
            return 'працівник кафедри (викладацький склад)';
        } else if(this.workType === 2) {
            return 'працівник кафедри (інженерно-технічний склад)';
        } else if(this.workType === 1) {
            return 'працівник технічого персоналу'
        } else {
            return 'працівник адміністрації';
        }
    })()  + ((this.workType > 1) ? ', кафедра: <span></span>' : '')
    + ", ставка: " + this.workLoad
    + ", поточний статус: " + (() => {
        if(this.currentStatus === 3) {
            if(!this.tempEndDate) { 
                return 'чинний працівник (постійне робоче місце)';
            } else {
                return "чинний працівник (тимчасове робоче місце замість працівника в декрентій відпустці)"
                + `, дата завершення роботи за тимчасовою вакансією: ${this.tempEndDate.slice(0,10)}, id працівника ` +
                `в декретній відпустці, якого заміняє поточний працівник: ${this.substEmployee}`
            }
        } else if(this.currentStatus === 1) {
            return `колишній працівник, дата припинення роботи: ${this.workEndDate}`;
        } else if(this.currentStatus === 0) {
            return `колишній працівник (пенсіонер), дата припинення роботи: ${this.workEndDate}`;
        } else {
            return `у декретній відпустці, планована дата завершення декретної відпустки: ${this.maternityLeaveEndDate}`;
        }
    })()
    + (this.extraInfo ? ', додаткова інформація: ' + this.extraInfo : '') + '.'
    + `<div class="centeredContentContainer"><button data-id="${this.id}" onclick="clickEditEmployee(gatt(this, 'data-id'), '${searchDivId}')" style="font-size:50%">Редагувати працівника</button> <button data-id="${this.id}" onclick="clickDeleteEmployee(this)" style="font-size:50%">Вилучити працівника</button></div>`
    const departmentSpan = li.querySelector('span:nth-child(2)');
    if(departmentSpan) {
        ajax('OPTIONS', 'departmentsPage', { id: [this.department, true] })
        .then(result => {
            const department = JSON.parse(result)[0];
            if(department) {
                departmentSpan.innerHTML = department.departmentName;
            } else {
                departmentSpan.innerHTML = 'невідома кафедра';
            }  
        })
        .catch(err => {
            console.error(err);
            departmentSpan.innerHTML = this.department;
        });
    }
    return li;
}

Employee.prototype.fillEditForm = function() {
    trimDates(this, 'birthDate', 'workStartDate', 'workEndDate', 'maternityLeaveEndDate');
    elid("name").value = this.fullName;
    elid("phone").value = '0' + this.phone;
    elid("gender").value = this.gender;
    elid("birthDate").value = this.birthDate;
    elid("numOfChildren").value = this.numOfChildren;
    elid("workStartDate").value = this.workStartDate;
    elid("workType").value = this.workType;
    if(elid("workType").value > 1) {
        qs("#department select").value = this.department;
    }
    elid("workLoad").value = this.workLoad;
    elid("currentStatus").value = this.currentStatus;
    elid("workEndDate").value = this.workEndDate ? this.workEndDate : '';
    elid("maternityLeaveEndDate").value = this.maternityLeaveEndDate ? this.maternityLeaveEndDate : '';
    elid("extraInfo").value = this.extraInfo;
    selectCurrentStatus(elid("currentStatus").value, false);
    stateOfAddEditDepartmentTr();
}

Employee.printEmployeeList = function (queryObject, searchResultDivId) {
    const printEmplInfo = empl => Employee.prototype.printInfo.call(empl, searchResultDivId);
    queryObject.forEach(empl => {
        qs(`#${searchResultDivId} > ul`).appendChild(printEmplInfo(empl));
    });
    if (qs(`#${searchResultDivId} > ul li`)) {
        const clearButtonDiv = document.createElement('div');
        satt(clearButtonDiv, 'class', 'centeredContentContainer');
        clearButtonDiv.innerHTML = `<button onclick="elid('${searchResultDivId}').innerHTML = '<ul></ul>'">очистити результати пошуку</button>`;
        elid(searchResultDivId).insertBefore(clearButtonDiv, qs(`#${searchResultDivId} > ul`));
    } else {
        qs(`#${searchResultDivId}`).innerHTML += '<p class="centeredContentContainer">За вказаними критеріями не знайдено жодного працівника</p>';
    }
}

function clickEditEmployee(id, searchDivId) {
    ajax('OPTIONS', `employeesPage`, {id: [id, true]})
    .then((results) => {
        unhide('addEmployeeDiv');
        fillDepartmentSelect();
        qs('#addEmployeeDiv > div > p').innerHTML = `Редагувати працівника id<span>${id}</span>`;
        sattid('addEmployeeDiv', 'data-action', searchDivId);
        disableMainElements();
        clickCloseSearchEmployeeDiv(searchDivId, false);
        const employee = JSON.parse(results)[0];
        sattid('addEmployeeDiv', 'data-status', employee.currentStatus)
        Employee.prototype.fillEditForm.call(employee);
        toggleClass('tempEndDateTr', 'hidden', !employee.tempEndDate);
    })
    .catch(err => {alert(err)})
}

function clickDeleteEmployee(button) {
    const id = gatt(button, 'data-id');
    const fullName = getParentNode(button, 2).textContent.replace(/,(.+)$/, '');
    if(confirm(`Ви справді бажаєте вилучити працівника ${fullName} (id${id})?`)) {
        ajax('DELETE', "employeesPage", {id: id})
        .then(response => {
            console.log(JSON.parse(response));
            alert(`Працівника ${fullName} (id${id}) було успішно вилучено з бази даних.`);
            if(getParentNode(button, 6) === elid('searchEmployeeDiv')) {
                clickSubmitSearch();
            } else {
                elid('updateSearch2Button').click();
            }
        })
        .catch(errorText => {
            console.error(errorText);
            alert(`Помилка: "${errorText}".`)
        });
    }
}

function onload() {
    fillDepartmentSelect();
    listener('#bottomDiv > div:nth-child(1) > button', 'click', clickAddEmployee);
    listener('#bottomDiv > div:nth-child(2) > button', 'click', () => location.href = 'vacancies.html');
    listener('#bottomDiv > div:nth-child(3) > button', 'click', clickSearchEmployee);
    listener('#bottomDiv > div:nth-child(4) > button', 'click', clickSearchEmployeeByCategories);
    //listenerQs('#bottomDiv > button:nth-child(3)', 'click', clickEmployeesArchive);
    listener('#addEmployeeButton', 'click', clickSubmitAddOrEdit);
    listener('#searchEmployeeButton', 'click', clickSubmitSearch);
    listener('#addSearchFieldButton', 'click', clickAddSearchFieldButton);
    //clickAddSearchFieldButton();
}

function fillDepartmentSelect(upd = false) {
    if(!qs("#department select") || upd) {
        ajax('OPTIONS', 'departmentsPage', {})
        .then(result => {
            departments = JSON.parse(result);
            //console.log(departments);
            if(!departments[0]) {
                qs('#department').innerHTML = `<p style="color:red">Помилка: у базі даних: не знайдено жодної кафедри. Перш ніж додавати працівників, спершу <span onclick="window.location.href='departments.html'" style="color:blue; text-decoration:underline">перейдіть на сторінку кафедр і факультетів</span> та створіть нову кафедру.</p>`;
            } else {
                qs("#department").innerHTML = departments.reduce((acc, department) => {
                    return acc + `<option value="${department.id}">${department.departmentName}</option>`;
                }, '<select>') + '</select>';
            }
        })
        .catch(err => {
            console.error(err);
            qs("#department").innerHTML = `<p style="color:red">Не вдалося отримати список кафедр: помилка бази даних MySQL. Перевірте з'єднання з сервером та перезавантажте сторінку. Також Ви можете повторити спробу, натиснувши <span onclick="fillDepartmentSelect()" style="color:blue; text-decoration:underline">тут</span>.</p>`;
        })
    }
}

function clickAddEmployee() {
    unhide('addEmployeeDiv');
    fillDepartmentSelect(true);
    sattid('addEmployeeDiv', 'data-action', 'add');
    qs('#addEmployeeDiv > div > p').innerHTML = 'Додати працівника';
    disableMainElements();
}

function clickSearchEmployee() {
    unhide('searchEmployeeDiv');
    disableMainElements();
}

function clickSubmitAddOrEdit() {
    const queryObject = new Employee().checkFields();
    if (queryObject) {
        const idSpan = qs('#addEmployeeDiv > div > p > span');
        if (!idSpan) {
            submitAdd(queryObject);
        } else {
            submitEdit(queryObject, idSpan.innerHTML, gattid('addEmployeeDiv', 'data-action'));
        }
    }
}
    
function submitAdd(queryObject)  {
    ajax('POST', "employeesPage", queryObject)
        .then(response => {
            const resObj = JSON.parse(response);
            alert(`Працівника ${queryObject.fullName} (id` +
            `${resObj.insertId}) було успішно додано до бази даних.`);
            clickCloseAddEmployeeDiv();
        })
        .catch(errorText =>  {
            showXhrError(`Сталась помилка: «${errorText}».`
            + ` Спробуйте повторити операцію.`, '#addDivResults');
        });
}

function submitEdit(queryObject, employeeId, searchDivId) { // searchDivId - data-action
    //console.log(searchDivId)
    //console.log({id: employeeId, updates: queryObject})
    ajax('PATCH', 'employeesPage', {id: employeeId, updates: queryObject})
    .then(response => {
        alert(`Працівника ${queryObject.fullName} (id` +
        `${employeeId}) було успішно редаговано.`);
        console.log(response);
        clickCloseAddEmployeeDiv();
        const [oldSt, newSt] = [gattid('addEmployeeDiv', 'data-status'), queryObject.currentStatus];
        //console.log(queryObject)
        console.log(`Old status: ${oldSt}, new status: ${newSt}`);
        if(newSt === '2' && oldSt === '3') {
            ajax('POST', 'vacanciesPage', {
                workType: queryObject.workType,
                department: queryObject.department,
                workLoad: queryObject.workLoad,
                startDate: new Date().toJSON().slice(0,10),
                endDate: queryObject.maternityLeaveEndDate,
                substEmployee: employeeId,
                extraInfo: ''
            }).then(response => {
                console.log(response)
                const resObj = JSON.parse(response);
                alert(`Вакансію id${resObj.insertId} було успішно додано до бази даних.`);
            })
        } else if(oldSt === '2' && newSt !== '2') {
            ajax('DELETE', "vacanciesPage", { substEmployee: employeeId })
            .then(response => {
                console.log(JSON.parse(response));
                alert(`Тимчасову вакансію на заміну працівникові з id${employeeId} було успішно вилучено з бази даних.`);
            })
            .catch(errMessage => {
                console.error(errMessage);
                alert(`Помилка: "${errMessage}".`);
            });
        }
        if(searchDivId === 'searchEmployeeDiv') {
            clickSubmitSearch();
        } else {
            elid('updateSearch2Button').click();
        }
    })
    .catch(errorText => {
        showXhrError(`Сталась помилка: «${errorText}».`
        + ` Спробуйте повторити операцію.`, '#addDivResults'); 
    })
}

function stateOfAddEditDepartmentTr() {
    if(elid("workType").value > 1) {
        unhide('addEditDepartmentTr');
    } else {
        hide('addEditDepartmentTr');
        qs("#department select").value = '';
    }
}

function selectCurrentStatus(value, autofill=true) {
    if(value === '3') {
        hide('maternityLeaveEndDateTr');
        hide('workEndDateTr');
        if(autofill) {
            elid('maternityLeaveEndDate').value = '';
            elid('workEndDate').value = '';
        }
    } else if (value === '2') {
        hide('workEndDateTr');
        unhide('maternityLeaveEndDateTr');
        if(autofill) {
            const  date = new Date();
            date.setFullYear(date.getFullYear() + 3);
            elid('maternityLeaveEndDate').value = date.toJSON().slice(0,10);
            elid('workEndDate').value = '';
        }
    } else {
        hide('maternityLeaveEndDateTr');
        unhide('workEndDateTr');
        if(autofill) {
            elid('workEndDate').value = new Date().toJSON().slice(0,10);
            elid('maternityLeaveEndDate').value = '';
        }
    }
}

function clickSubmitSearch() {
    elid('searchResultDiv').innerHTML = '<ul></ul>';
    const createPair = nthChild => {
        const key = qs(`#searchEmployeeDiv > div > table tr:nth-child(${nthChild}) > td:nth-child(1) > select`).value;
        if(!key) {
            return null;
        }
        const isPrecise = qs(`#searchEmployeeDiv > div > table > tbody > tr:nth-child(${nthChild}) > td:nth-child(2) > div > input[type=checkbox]`).checked;
        let value;
        if (qs(`#searchEmployeeDiv > div > table > tbody > tr:nth-child(${nthChild}) > td:nth-child(3) > input`)) {
            value = qs(`#searchEmployeeDiv > div > table > tbody > tr:nth-child(${nthChild}) > td:nth-child(3) > input`).value;
        } else if(qs(`#searchEmployeeDiv > div > table > tbody > tr:nth-child(${nthChild}) > td:nth-child(3) > select`)) {
            value = qs(`#searchEmployeeDiv > div > table > tbody > tr:nth-child(${nthChild}) > td:nth-child(3) > select`).value;
        } else if(qs(`#searchEmployeeDiv > div > table > tbody > tr:nth-child(${nthChild}) > td:nth-child(3) > textarea`)) {
            value = qs(`#searchEmployeeDiv > div > table > tbody > tr:nth-child(${nthChild}) > td:nth-child(3) > textarea`).value;
        }
        return [key, [value, isPrecise]];
    }
    const queryObject = {};
    for (let i = 2; !!qs(`#searchEmployeeDiv > div > table > tbody > tr:nth-child(${i})`); i++) {
        //[key, [value, isPrecise]] = createPair(i);
        const pair = createPair(i);
        if(pair) {
            [key, [value, isPrecise]] = pair;
            queryObject[key] = [value, isPrecise];
        }
    }
    //console.log(queryObject)
    ajax('OPTIONS', `employeesPage`, queryObject)
    .then(results => { Employee.printEmployeeList(JSON.parse(results), 'searchResultDiv') })
    .catch(errMessage => {
        console.error(errMessage);
        alert(`Помилка: "${errMessage}".`);
    });
    //console.log(Object.getOwnPropertyNames(queryObject).length ? queryObject : null);
}

const clearInputInaddEmployeeDiv = () => {
    elid("name").value = '';
    elid("phone").value ='';
    elid("gender").value = 'm';
    elid("birthDate").value = '';
    elid("numOfChildren").value = '0';
    elid("workStartDate").value = '';
    elid("workType").value = '3';
    unhide('addEditDepartmentTr'); //
    qs("#department select").value = '';
    elid("workLoad").value = '1.0';
    elid("currentStatus").value = '3';
    elid("extraInfo").value = '';
    hide('maternityLeaveEndDateTr');
    hide('workEndDateTr');
}

function clickAddSearchFieldButton() {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>
        <select onchange="selectSearchParam(this)">
            <option value="">Не обрано</option>
            <option value="fullName">ПІБ</option>
            <option value="phone">Номер телефону (у форматі з 0)</option>
            <option value="id">ID</option>
            <option value="gender">стать</option>
            <option value="numOfChildren">Кількість дітей</option>
            <option value="birthDate">Дата народження</option>
            <option value="workStartDate">Дата початку роботи</option>
            <option value="department">Тип роботи / кафедра</option>
            <option value="workLoad">Розмір ставки</option>
            <option value="extraInfo">Додаткова інформація</option>
        </select>
    </td>
    <td><div class="centeredContentContainer"><input type="checkbox" style="width:2vh;" checked disabled="true"></div></td>
    <td></td>`;
    if(!qs('#searchEmployeeDiv > div > table > tr:nth-child(6)')) {
        qs('#searchEmployeeDiv > div > table > tbody').appendChild(tr);
    } else {
        alert('Ви не можете провадити пошук за більш ніж 5 критеріями.')
    }   
}

function selectSearchParam(el) {
    const tr = el.parentNode.parentNode;
    const disableAndCheckPrecise = (disable=true) => {
        const checkbox = tr.querySelector('td:nth-child(2) > div > input');
        if(disable) {
            satt(checkbox, 'disabled');
            satt(checkbox, 'checked');
        } else {
            checkbox.removeAttribute('disabled');
            checkbox.removeAttribute('checked');
        }
    }
    const rightTd = el.parentNode.parentNode.querySelector('td:nth-child(3)');
    rightTd.innerHTML = (value => {
        if(!value) {
            //console.log(tr.parentNode.querySelector('tr:nth-child(1)'))
            if(tr !== tr.parentNode.querySelector('tr:nth-child(2)')) {
                tr.parentNode.removeChild(tr);
            } else {
                return ''
            }
        } else if (value === 'fullName') {
            disableAndCheckPrecise(false);
            return '<input>';
        } else if (value === 'phone' || value === 'id') {
            disableAndCheckPrecise();
            return '<input type="number">';
        } else if (value === 'gender') {
            disableAndCheckPrecise();
            return `
            <select>
                <option value="m">Чоловіча</option>
                <option value="f">Жіноча</option>
                </select>`;
        } else if (value === 'numOfChildren') {
            disableAndCheckPrecise();
            return `<select>
                <option value="0">Бездітний(-а)</option>
                <option value="1">1 дитина</option>
                <option value="2">2 дитини</option>
                <option value="3">Багатодітний(-а), більше 3 дітей</option>
                </select>`;
        } else if(value === 'workLoad') {
            disableAndCheckPrecise();
            return '<input type="number" min="0" max="2" step="0.25" value="1.0">';
        } else if(value === 'extraInfo') {
            disableAndCheckPrecise(false);
            return '<textarea></textarea>';
        } else if(value.match(/date/i)) {
           disableAndCheckPrecise();
           return `<input type="date"></td>`; 
        }
        // допрацювати тип роботи і кафедру
    })(el.value);
}

const disableMainElements = (disable=true) => {
    //toggleClassQS('body > h1', 'unclickable', disable);
    toggleClassQS('#bottomDiv', 'unclickable', disable);
    toggleClassQS('body > a', 'unclickable', disable);
}

function clickCloseAddEmployeeDiv() {
    const searchDivId = gattid('addEmployeeDiv', 'data-action');
    hide('addEmployeeDiv');
    clearInputInaddEmployeeDiv();
    if(searchDivId && searchDivId.match('search')) {
        unhide(searchDivId);
    } else {
        disableMainElements(false);
    }
}

function clearSearch(searchDivId) {
    elid(searchDivId === 'searchEmployeeDiv' ? 'searchResultDiv' : 'searchResultDiv2').innerHTML = '<ul></ul>';
    if(searchDivId === 'searchEmployeeDiv') {
        qs('#searchEmployeeDiv > div > table').innerHTML = `<tr>
        <th>Критерії пошуку</th>
        <th style="font-size:50%">Точний збіг</th>
        <th>Значення</th>
        </tr>`;
    }  
}

function clickCloseSearchEmployeeDiv(searchDivId, clearSearchResults = true) {
    hide(searchDivId);
    if(clearSearchResults) {
        clearSearch(searchDivId);
        disableMainElements(false);
    }
}

function clickSearchEmployeeByCategories() {
    unhide('searchEmployeeDiv2');
    disableMainElements();
}

function clearCategorizedSearch() {
    elid('searchResultDiv2').innerHTML = '<ul></ul>';
}

function clickSubmitSearchByCategory(queryObject, header, button) {
    //console.log(queryObject.queryStatement)
    sattid('updateSearch2Button', 'onclick', gatt(button, 'onclick'));
    elid('searchResultDiv2').innerHTML = '<ul></ul>';
    return ajax('OPTIONS', 'employeesPage', queryObject)
    .then(results => {
        Employee.printEmployeeList(JSON.parse(results), 'searchResultDiv2');
        const p = document.createElement('p');
        satt(p, 'class', 'centeredContentContainer');
        p.innerHTML = `<strong>${header}</strong>`;
        qs('#searchResultDiv2').insertBefore(p, qs('#searchResultDiv2 ul'));
    }).catch(errMessage => {
        console.error(errMessage);
        alert(`Помилка: "${errMessage}".`);
    });
}
     

function searchNoChildren(button) {
    clickSubmitSearchByCategory({ queryStatement: 'SELECT * FROM Employees WHERE numOfChildren = 0 AND currentStatus > 1' }, 'Бездітні працівники', button);
}

function searchManyChildren(button) {
    clickSubmitSearchByCategory({ queryStatement: 'SELECT * FROM Employees WHERE numOfChildren = 3 AND currentStatus > 1' }, 'Багатодітні працівники (які мають троє або більше дітей)', button);
}

function searchAlmostRetired(button) {
    const  date = new Date();
    date.setFullYear(date.getFullYear() - 58);
    const dateStr = date.toJSON().slice(0,10);
    clickSubmitSearchByCategory({ queryStatement: `SELECT * FROM Employees WHERE birthDate <= '${dateStr}' AND currentStatus = 3` }, 'Працівники передпенсійного віку (віком від 58 повних років)', button);
}

function searchJubilees(button) {
    const lastDigit = Number(new Date().getFullYear()).toString().slice(3,4);
    clickSubmitSearchByCategory({ queryStatement: `SELECT * FROM Employees WHERE birthDate REGEXP "...${lastDigit}-..-.." AND currentStatus = 3` }, 'Ювіляри поточного року (працівники, у яким цьогоріч виповнюється кругла сума років)', button);
}

function searchVeterans(button) {
    const  date = new Date();
    date.setFullYear(date.getFullYear() - 30);
    const dateStr = date.toJSON().slice(0,10);
    clickSubmitSearchByCategory({ queryStatement: `SELECT * FROM Employees WHERE workStartDate <= '${dateStr}' AND currentStatus = 3` }, 'Ветерани (працівники, прийняті на роботу понад 30 років тому)', button);
}

function searchMaternityLeave(button) {
    clickSubmitSearchByCategory({ currentStatus: [2, true] }, 'Працівники в декретній відпустці', button);
}

function seachArchive(button) {
    clickSubmitSearchByCategory({ queryStatement: 'SELECT * FROM Employees WHERE currentStatus < 2' }, 'Архів працівників', button);
}

function seachArchiveDismissed(button) {
    clickSubmitSearchByCategory({ currentStatus: [1, true] }, 'Архів працівників (крім пенсіонерів)', button );
}

function seachArchiveRetired(button) {
    clickSubmitSearchByCategory({ currentStatus: [0, true] }, 'Архів працівників (тільки пенсіонери)', sbutton);
}