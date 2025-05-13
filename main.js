let addBtn = document.getElementById('addBtn')
let saveBtn = document.getElementById('saveBtn')
let todolist = document.getElementById('todolist')

const modal = document.getElementById('modal');
const staticBackdrop = document.getElementById('staticBackdrop');
const modalBody = new bootstrap.Modal(staticBackdrop);

let modalName = document.getElementById('name')
let modalPriority = document.getElementById('priority')
let modalStatus = document.getElementById('status')
let modalDeadline = document.getElementById('deadline')
let modalDescription = document.getElementById('description')
let modalCreatedOn = document.getElementById('createdOn')
let modalModifiedOn = document.getElementById('modifiedOn')

let isNewTask = 0
let currentTaskElement = document.createElement('div')
currentTaskElement.className = 'task'
let idTask

class Task {
    constructor(name, description, deadline, status, priority) {
        this.name = name;
        this.description = description;
        this.deadline = deadline;
        this.status = status;
        this.priority = priority;
    }
}

let table = []

const Status = {
    Active: 'Активно',
    Completed: 'Выполнено',
    Overdue: 'Просрочено',
    Late: 'Выполнено с опозданием'
};

const Priority = {
    Low: 'Низкий',
    Medium: 'Средний',
    High: 'Высокий',
    Critical: 'Критический'
};

function getKeyByValue(obj, value) {
    return Object.keys(obj).find(key => obj[key] === value);
}

function getStatus(value) {
    return getKeyByValue(Status, value);
}

function getPriority(value) {
    return getKeyByValue(Priority, value);
}

const host = "http://localhost:80"

addBtn.addEventListener('click', (e) => {
    isNewTask = 1;
    setDefaultValuesToModal();
    modalBody.show();
})

modal.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (modalName.length < 4) {
        alert("Название задачи должно содержать минимум 4 символа.");
        return;
    }

    const status = getStatus(modalStatus.value)
    const priority = getPriority(modalPriority.value)
    const deadline = modalDeadline.value?.trim() === "" ? null : modalDeadline.value

    let task = new Task(modalName.value, modalDescription.value, new Date(deadline).toISOString(), status, priority);

    if(isNewTask) {

        const response = await fetch(host + "/tasks", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: task.name,
                description: task.description,
                deadline: task.deadline,
                status: task.status,
                priority: task.priority,
            }),
        });

        if (response.ok) {
            const newTask = await response.json();
            task.id = newTask.id;
            task.createdOn = newTask.createdOn;
            task.modifiedOn = newTask.modifiedOn;
        } else console.error("Ошибка при создании задачи");

        table.unshift(task)

        let htmlTask = createHtmlTask(task)
        htmlTask.dataset.id = task.id
        todolist.children[2].append(htmlTask)
    }
    else {
        const response = await fetch(host + `/tasks/edit/${idTask}`,
            {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: task.name,
                    description: task.description,
                    deadline: task.deadline,
                    status: task.status,
                    priority: task.priority,
                })
            }).then(r => r.text())

        if (response.ok) {
            task = await response.json();
            currentTaskElement = createHtmlTask(task)
        } else console.error("Ошибка при редактировании задачи");
    }
})


function createHtmlTask(task) {
    let newTask = addEmptyTask()

    addListenersToNewTask(newTask, task)
    setValuesToShortTask(newTask, task)

    return newTask
}

function formatDate(isoString) {
    const date = new Date(isoString);

    const get = {
            hours: date.getUTCHours(),
            minutes: date.getUTCMinutes(),
            day: date.getUTCDate(),
            month: date.getUTCMonth() + 1,
            year: date.getUTCFullYear()
        }

    const pad = n => n.toString().padStart(2, '0');

    return `${pad(get.day)}.${pad(get.month)}.${get.year} ${pad(get.hours)}:${pad(get.minutes)}`;
}


function setValuesToShortTask(newTask, task) {
    if(task.status === 'Completed' || task.status === 'Late') {
        newTask.children[0].children[0].children[0].checked = true
    }
    newTask.children[0].children[1].children[0].textContent = task.name
    if(task.deadline === null) {
        newTask.children[0].children[1].children[1].children[0].textContent = "-"
    }
    else {
        newTask.children[0].children[1].children[1].children[0].textContent = formatDate(task.deadline)
    }
    task.status = defineStatus(task.deadline, task.status)
    newTask.children[0].children[1].children[1].children[1].textContent = Status[task.status]
}

function setValuesToModal(task) {
    modalName.value = task.name
    modalDescription.value = task.description
    modalDeadline.value = task.deadline
    modalStatus.value = task.status
    modalPriority.value = task.priority
    modalCreatedOn.value = formatDate(task.createdOn)
    modalModifiedOn.value = formatDate(task.modifiedOn)
}

function setDefaultValuesToModal() {
    modalName.value = "Новая задача"
    modalDescription.value = ""
    modalDeadline.value = ""
    modalStatus.value = "Active"
    modalPriority.value = "Normal"
}

function addListenersToModal(modal, task) {
    modal.children[0].children[0].children[0].addEventListener('input', (e) => {
        task.name = modal.children[0].children[0].children[0].value
    })
}

function addListenersToNewTask(newTask, task) {
    newTask.children[0].children[2].children[0].addEventListener('click', (event) => {
        newTask.remove()
        let ind = table.indexOf(task)
        table.splice(ind, 1)

        fetch(host + `/tasks/${task.id}`,
            {
                method: 'DELETE'
            }).then(r => r.text())
    })

    newTask.children[0].children[0].children[0].addEventListener('change', (event) => {
        task.status = switchStatus (task.deadline, task.status)
        task.status = defineStatus(task.deadline, task.status)

        fetch(host + `/tasks/${task.id}/state`,
            {
                method: 'PATCH',
                body: String({Status: task.status})
            }).then(r => r.text())
    })

    newTask.children[0].children[1].addEventListener('click', (event) => {
        isNewTask = 0
        currentTaskElement.innerHTML = newTask.innerHTML
        idTask = event.currentTarget.dataset.id

        setValuesToModal(task)
        modalBody.show()
    })
}

function addEmptyTask() {
    let task = document.createElement('div')
    task.className = 'task'
    task.innerHTML = '' +
        '<div class="input-group">' +
            '<div class="input-group-text">' +
                '<input class="form-check-input mt-0" type="checkbox" value=""' +
                       'aria-label="Checkbox for following text input">' +
            '</div>' +
            '<div class="form-control">' +
                '<div class="form-control">Новая задача</div>' +
                '<div class="horizontal">' +
                    '<div class="form-control">01.01.2025</div>' +
                    '<div class="form-control">Активно</div>' +
                '</div>' +
            '</div>' +
            '<div class="input-group-text">' +
                '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"' +
                     'class="bi bi-x-lg transition" viewBox="0 0 16 16">' +
                    '<path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>' +
                '</svg>' +
            '</div>' +
        '</div>'

    return task
}

// при нажатии на чекбокс
function switchStatus(deadline, status) {
    if (status === "Active") {
        return "Completed"
    } else if (status === "Overdue") {
        return "Late"
    } else {
        return "Active"
    }
}

// выполнять при каждой загрузке списка задач
function defineStatus(deadline, status) {
    let currDate = new Date().toISOString();

    if (status === "Active" && deadline < currDate) {
        return "Overdue"
    }
    else return status
}


window.onload = async function () {
    let response = await fetch(host + "/tasks/list",
        {
            method: 'GET'
        })

    /** @type {{ todoItems: any[] }} */
    const json = await response.json();
    table = json.todoItems


    for (let i = 0; i < table.length; i++) {
        let newTask = createHtmlTask(table[i])
        todolist.children[2].append(newTask)
    }
}
