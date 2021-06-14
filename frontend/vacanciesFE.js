function Vacancy() {
    this.workType = qs('#workType').value;
    this.department = qs('#department select').value;
    this.workLoad = qs('#workLoad').value;
    this.startDate = qs('#startDate').value;
    this.endDate = qs('#endDate').value || null;
    this.substEmployee = qs('#endDate').value ? elid('substEmpl').value : 0;
    this.extraInfo = qs('#extraInfo').value;
}

Vacancy.prototype.printInfo = function() {
    trimDates(this, 'endDate', 'startDate');
    const li = document.createElement('li');
    li.innerHTML = `ID вакансії: ${this.id}, тип роботи: ${(() => {
        if(this.workType === 0) {
            return 'Працівник адміністрації';
        } else if(this.workType === 1) {
            return 'Працівник технічого персоналу';
        } else if(this.workType === 2) {
            return 'Працівник кафедри (інженерно-технічний склад)';
        } else if(this.workType === 3) {
            return 'Працівник кафедри (викладацький склад)';
        }
    })()}` + `${this.workType > 1 ? ', кафедра: <span></span>': ''}` +
    `, ставка: ${this.workLoad}, статус вакансії: ` +
    `${!this.endDate ? 'нове робоче місце' : 'тимчасова (на місце ' +
    'працівника в декретній відпустці)'}${this.startDate ? ', ' +
    'дата початку роботи за вакансією: ' + this.startDate : ''}` + 
    `${this.endDate ? ', дата, до якої' +
    ' посада відльна: ' + this.endDate : ''}${this.endDate ? ', ' +
    'ID працівника, на заміну якому створено тимчасову вакансію: ' +
    this.substEmployee : ''}${this.extraInfo ? ', додаткова інфор' +
    'мація: ' + this.extraInfo : ''}.`
    +`<div class="centeredContentContainer">
    <button onclick="clickEditVacancy(this)"style="font-size:50%">
    Редагувати вакансію</button> <button onclick="clickAddEmployeeByVacancy(this)" style="font-size:50%">Додати працівника за вакансією</button> <button onclick="clickDeleteVacancy(this)" style="font-size:50%">Вилучити вакансію</button></div>`;
    satt(li, 'data-obj', JSON.stringify(this));
    const departmentSpan = li.querySelector('span:nth-child(1)');
    if (departmentSpan) {
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

Vacancy.printVacancyList = function(queryObject) {
    const print = el => Vacancy.prototype.printInfo.call(el); 
    elid('searchResultDiv').innerHTML = '<ul></ul>';
    if(queryObject.length) {
        queryObject.forEach(vacancy => {
            qs('#searchResultDiv > ul').appendChild(print(vacancy));
        });
        const clearButtonDiv = document.createElement('div');
        satt(clearButtonDiv, 'class', 'centeredContentContainer');
        clearButtonDiv.innerHTML = `<button onclick="elid('searchResultDiv').innerHTML = '<ul></ul>'">очистити результати пошуку</button>`;
        elid('searchResultDiv').insertBefore(clearButtonDiv, qs('#searchResultDiv > ul'));
    } else {
        qs(`#searchResultDiv`).innerHTML += '<p class="centeredContentContainer">За вказаними критеріями не знайдено жодної вакансії.</p>';
    }
}

function onload() {
    fillDepartmentSelect();
    listener('#bottomDiv > div:nth-child(1) > button', 'click', clickOpenSearchVacancyDiv);
    listener('#bottomDiv > div:nth-child(2) > button', 'click', clickAddVacancy);
    listener('#addDepartmentButton', 'click', clickSubmitAddOrEditVacancy);
    listener('#searchVacancyButton', 'click', clickSubmitSearch);
    listener('#addEmplByVacancyButton3', 'click', clickSubmitAddEmplByVacancy);
}

function stateOfAddEditDepartmentTr() {
    const [val, id] = [elid('workType').value, 'addEditDepartmentTr'];
    (val > 1) ? unhide(id) : (() => {
        hide(id);
        qs("#department select").value = '';
    })();
}

function stateOfAddEditDepartmentTrInSearch() {
    const [val, id] = [elid('workTypeInSearch').value, 'addEditDepartmentTrInSearch'];
    (!val || val > 1) ? unhide(id) : (() => {
        hide(id);
        qs("#departmentInSearch > select").value = '';
    })();
}

function fillDepartmentSelect(upd = false) {
    const fill = (ih, isSuccess = true) => {
        const els = [qs('#department'), qs('#departmentInSearch'), qs('#department3')];
        if(isSuccess) {
            els[0].innerHTML = `<select>${ih}</select>`;
            els[1].innerHTML = `<select><option value="">Всі</option>${ih}</select>`;
            els[2].innerHTML = `<select disabled>${ih}</select>`;
        } else {
            els.forEach(el => el.innerHTML = ih);
        }
    }
    if(!qs("#department select") || upd) {
        ajax('OPTIONS', 'departmentsPage', {})
        .then(result => {
            departments = JSON.parse(result);
            if(!departments[0]) {
                fill(`<p style="color:red">Помилка: у базі даних: не знайдено жодної кафедри. Перш ніж додавати працівників, спершу <span onclick="window.location.href='departments.html'" style="color:blue; text-decoration:underline">перейдіть на сторінку кафедр і факультетів</span> та створіть нову кафедру.</p>`, false);
            } else {
                fill(departments.reduce((acc, d) => {
                    return acc + `<option value="${d.id}">${d.departmentName}</option>`;
                }, ''));
            }
        })
        .catch(err => {
            console.error(err);
            fill(`<p style="color:red">Не вдалося отримати список кафедр: помилка бази даних MySQL. Перевірте з'єднання з сервером та перезавантажте сторінку. Також Ви можете повторити спробу, натиснувши <span onclick="fillDepartmentSelect()" style="color:blue; text-decoration:underline">тут</span>.</p>`, false);
        })
    }
}

function clickCloseAddVacancyDiv() {
    hide('addVacancyDiv');
    if(qs('#addVacancyDiv > div > p').innerHTML.match('id')) {
        unhide('searchVacancyDiv');
    } else {
        disableMainElements(false);
    }
}

function clickAddVacancy() {
    qs('#workType').value = '0';
    qs('#department select').value = '';
    qs('#workLoad').value = 1.0;
    qs('#startDate').value = new Date().toJSON().slice(0,10);
    qs('#endDate').value = '';
    ['substEmplTr', 'workEndDateTr'].forEach(id => hide(id));
    qs('#extraInfo').value = '';
    qs('#substEmployee3').value = 0;
    hide('addEditDepartmentTr');
    unhide('addVacancyDiv');
    fillDepartmentSelect(true);
    sattid('addVacancyDiv', 'data-action', 'add');
    qs('#addVacancyDiv > div > p').innerHTML = 'Додати вакансію';
    disableMainElements();
}

function clickSubmitAddOrEditVacancy() {
    const queryObject = new Vacancy();
    const isAdd = qs('#addVacancyDiv > div > p').innerHTML.match('Додати');
    isAdd ? submitAddVacancy(queryObject) : submitEditVacancy(queryObject);
}

function submitAddVacancy(queryObject) {
    ajax('POST', 'vacanciesPage', queryObject)
    .then(response => {
        console.log(response)
        const resObj = JSON.parse(response);
        alert(`Вакансію id${resObj.insertId} було успішно додано до бази даних.`);
        clickCloseAddVacancyDiv();
    })
    .catch(errorText =>  {
        console.error(errorText)
        showXhrError(`Сталась помилка: «${errorText}».`
        + ` Спробуйте повторити операцію.`, '#addDivResults');
    });
}

function submitEditVacancy(queryObject) {
    console.log(queryObject);
    ajax('PATCH', 'vacanciesPage', { updates: queryObject,
        id: +qs('#addVacancyDiv > div > p > span').innerHTML }) 
    .then(response => {
        console.log(response);
        clickCloseAddVacancyDiv();
        alert(`Вакансію id${queryObject.id}) було успішно редаговано.`);
        qs('#searchVacancyButton').click();
    })
    .catch(errorText => {
        console.error(errorText)
        showXhrError(`Сталась помилка: «${errorText}».`
        + ` Спробуйте повторити операцію.`, '#addDivResults'); 
    });
}

function clickSubmitSearch() {
    const queryObj = { };
    const addKey = (keyName, qsPath, sign='=', value=undefined) => {
        if(qs(qsPath).value) {
            queryObj[keyName] = [value===undefined ? qs(qsPath).value : value, sign];
        }
    }
    addKey('workType', '#workTypeInSearch');
    addKey('department', '#departmentInSearch > select');
    addKey('endDate', '#vacancyStatus', (() => {
        return qs('#vacancyStatus').value === '1' ? 'IS' : 'IS NOT';
    })(), null);
    ajax('OPTIONS', 'vacanciesPage', queryObj)
    .then(results => Vacancy.printVacancyList(JSON.parse(results)))
    .catch(errMessage => {
        console.error(errMessage);
        alert(`Помилка: "${errMessage}".`);
    });
}

function clickOpenSearchVacancyDiv() {
    unhide('addEditDepartmentTrInSearch');
    qs('#workTypeInSearch').value = '';
    qs('#departmentInSearch > select').value = '';
    qs('#vacancyStatus').value = '';
    disableMainElements();
    unhide('searchVacancyDiv');
}

function clickCloseSearchVacancyDiv() {
    disableMainElements(false);
    hide('searchVacancyDiv');
}

function clickEditVacancy(li) {
    const vacancy = JSON.parse(gatt(getParentNode(li, 2), 'data-obj'));
    const displ = vacancy.endDate ? unhideQS : hideQS;
    ['#workEndDateTr', '#substEmplTr'].forEach(tr => displ(tr));
    qs('#addVacancyDiv > div > p').innerHTML = `Редагувати вакансію id<span>${vacancy.id}</span>`;
    unhide('addVacancyDiv');
    hide('searchVacancyDiv');
    const fillLine = (key, path=null, fn=x=>x) => qs(path || `#${key}`).value = fn(vacancy[key]);
    [['workType'], ['department', '#department select'], ['workLoad'], ['substEmployee', '#substEmpl'],
    ['startDate', null, x => x ? x.slice(0, 10) : ''], ['endDate', null, x => x ? x.slice(0, 10) : ''],
    ['extraInfo']].forEach(([...args]) => fillLine(...args));
}

function clickDeleteVacancy(li=null, id) {
    id = li ? JSON.parse(gatt(getParentNode(li, 2), 'data-obj')).id : id;
    if(!li || confirm(`Ви справді бажаєте вилучити вакансію id${id}?`)) {
        ajax('DELETE', "vacanciesPage", { id: id })
            .then(response => {
                console.log(JSON.parse(response));
                alert(`Вакансію  id${id} було успішно вилучено з бази даних.`);
                qs('#searchVacancyButton').click();
            })
            .catch(errMessage => {
                console.error(errMessage);
                alert(`Помилка: "${errMessage}".`);
            });
    }
}

function clickAddEmployeeByVacancy(li) {
    unhide('addEmplByVacancyDiv');
    hide('searchVacancyDiv');
    const vacancy = JSON.parse(gatt(getParentNode(li, 2), 'data-obj'));
    qs('#vacancyIdSpanForAddEmpl').innerHTML = vacancy.id;
    console.log(vacancy);
    fillDepartmentSelect();
    [['name3'], ['phone3'], ['birthDate3'], ['numOfChildren3', '0'], ['gender3', 'm']]
        .forEach(([id, val]) => elid(id).value = val === undefined ? '' : val);
    [['#workType3', 'workType'], ['#workLoad3', 'workLoad'], ['#workStartDate3', 'startDate'],
    ['#maternityLeaveEndDate3', 'endDate'], ['#substEmployee3', 'substEmployee'],
    ['#extraInfo3', 'extraInfo'], ['#department3 > select', 'department']]
        .forEach(([path, key]) => qs(path).value = vacancy[key]);
    const displ = vacancy.endDate ? unhide : hide;
    ['maternityLeaveEndDateTr3', 'substEmployeeTr3'].forEach(id => displ(id));
}

function clickSubmitAddEmplByVacancy() {
    let employee = { workEndDate: null, currentStatus: 3 };//!!!
    [['#name3', 'fullName', x => x.trim()], ['#gender3', 'gender'], ['#phone3', 'phone'],
    ['#birthDate3', 'birthDate'], ['#numOfChildren3', 'numOfChildren'],
    ['#workType3', 'workType'], ['#workLoad3', 'workLoad'],
    ['#workStartDate3', 'workStartDate'], ['#substEmployee3', 'substEmployee'],
    ['#maternityLeaveEndDate3', 'tempEndDate',  x => x || null],
    ['#department select', 'department', x => qs('#workType3').value > 1 ? x : 0],
    ['#extraInfo3', 'extraInfo']].forEach(([path, key, callback = x => x]) => { //!!!!
        employee[key] = callback(qs(path).value);
    });
    employee = (() => {
        if(!employee.fullName.match(/(.+)\s(.+)/)) {
            alert('Помилка: неправельне введення у полі \"ПІБ (прізвище, ім\'я, по-батькові)\".');
        }
        else if(!employee.phone.match(/^0(\d{9})$/)) {
            alert('Помилка: неправельне введення у полі \"Телефон\" (номер повинен починатись із 0 та містити 10 цифр).');
        }
        else if(!employee.birthDate) {
            alert('Помилка: не вказано дату народження.')
        }
        else if(!employee.workStartDate) {
            alert('Помилка: не вказано дату початку роботи.')
        } else {
            return employee;
        }
        return null;
    })();
    if(employee) {
        ajax('POST', "employeesPage", employee)
            .then(response => {
                const resObj = JSON.parse(response);
                alert(`Працівника ${employee.fullName} (id` +
                    `${resObj.insertId}) було успішно додано до бази даних.`);
                    clickDeleteVacancy(null, qs('#vacancyIdSpanForAddEmpl').innerHTML);
                    clickCloseAddEmplByVacancyDiv();
            })
            .catch(errorText => {
                showXhrError(`Сталась помилка: «${errorText}».`
                    + ` Спробуйте повторити операцію.`, '#addEmplByVacancyDivResults3');
            });
    }
}

function clickCloseAddEmplByVacancyDiv() {
    hide('addEmplByVacancyDiv');
    unhide('searchVacancyDiv');
    qs('#searchVacancyButton').click();
}



const disableMainElements = (disable=true) => {
    toggleClassQS('#bottomDiv', 'unclickable', disable);
}