const { request, response } = require('express');
const e = require('express');
const express = require('express');
const app = express();
const q = require('./dbQueries.js');
app.use(express.json({ type: ['application/json', 'application/csp-report'] }));
app.use(express.static('frontend'));
app.listen(3000);

function success(response, statusCode=200) {
    return result => { response.status(statusCode).json(result); }
}
function error (response, statusCode=418) {
    return err => { response.status(statusCode).json(err); }
}

app.post('/employeesPage', function(request, response) {
    q.postEmployee(request.body)
    .then(success(response, 201))
    .catch(error(response));
});

app.options('/employeesPage', function(request, response) {
    q.searchEmployee(request.body)
    .then(success(response, 200))
    .catch(error(response));
});

app.patch('/employeesPage', (request, response) => {
    console.log(request.body);
    q.editEmployee(request.body)
    .then(success(response, 201))
    .catch(error(response));
});

app.delete('/employeesPage', (request, response) => {
    q.deleteEmployee(request.body)
    .then(result => {response.status(200).json(result)})
    .catch(error(response));
});

app.post('/facultiesPage', (request, response) => {
    q.postFaculty(request.body)
    .then(success(response, 201))
    .catch(error(response));
});

app.options('/facultiesPage', (request, response) => {
    q.searchFaculty(request.body)
    .then(success(response, 200))
    .catch(error(response));
});

app.patch('/facultiesPage', (request, response) => {
    q.editFaculty(request.body)
    .then(success(response, 201))
    .catch(error(response));
});

app.delete('/facultiesPage', (request, response) => {
    q.deleteFaculty(request.body)
    .then(success(response, 201))
    .catch(error(response));
});

app.post('/departmentsPage', (request, response) => {
    q.postDepartment(request.body)
    .then(success(response, 201))
    .catch(error(response));
})

app.options('/departmentsPage', (request, response) => {
    q.searchDepartment(request.body)
    .then(success(response, 200))
    .catch(error(response));
});

app.patch('/departmentsPage', (request, response) => {
    q.editDepartment(request.body)
    .then(success(response, 201))
    .catch(error(response));
});

app.delete('/departmentsPage', (request, response) => {
    q.deleteDepartment(request.body)
    .then(success(response, 200))
    .catch(error(response));
});

app.post('/vacanciesPage', (request, response) => {
    q.postVacancy(request.body)
    .then(success(response, 200))
    .catch(error(response));
});

app.options('/vacanciesPage', (request, response) => {
    q.searchVacancy(request.body)
    .then(success(response, 200))
    .catch(error(response));
});

app.patch('/vacanciesPage', (request, response) => {
    q.editVacancy(request.body)
    .then(success(response, 201))
    .catch(error(response));
});

app.delete('/vacanciesPage', (request, response) => {
    q.deleteVacancy(request.body)
    .then(success(response, 200))
    .catch(error(response));
});

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
})

process.on('SIGINT', function() {
    console.warn('\nЗупинка сервера за допомогою SIGINT (Ctrl-C)....');
    process.exit();
})