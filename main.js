let addBtn = document.getElementById('addBtn')
let saveBtn = document.getElementById('saveBtn')
let todolist = document.getElementById('todolist')

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

modalDeadline.addEventListener('keydown', (e) => e.preventDefault());

const toastElement = document.getElementById('toast')
const toast =  new bootstrap.Toast(toastElement)

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
    Late: 'Сдано с опозданием'
};

const Priority = {
    Medium: 'Средний',
    Low: 'Низкий',
    High: 'Высокий',
    Critical: 'Критический'
};

const macros = {
    '!1': 'Critical',
    '!2': 'High',
    '!3': 'Medium',
    '!4': 'Low'
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

saveBtn.addEventListener('click', async (e) => {
    let text = modalName.value
    let cleaned = text.replace(/[ \t]/g, '')

    if (cleaned.length < 4) {
        toast.show()
    } else {

        const priority = Object.keys(Priority)[modalPriority.value]

        const { cleanedName, editedPriority } = assignPriority(modalName.value, priority);

        let deadline = modalDeadline.value?.trim() === "" ? null : modalDeadline.value

        let { cleanedNameAgain, editedDeadline } = assignDeadline(cleanedName, deadline);

        if (editedDeadline !== null) editedDeadline = new Date(editedDeadline).toISOString()
        let status = Object.keys(Status)[modalStatus.value]
        status = defineStatus(deadline, status)

        let task = new Task(cleanedNameAgain, modalDescription.value, editedDeadline, status, editedPriority);

        if (isNewTask) {

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
            sortByDeadlineAscending()

            renderTasks()

        } else {

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
                    }),
                });

            if (response.ok) {
                task = await response.json();
                currentTaskElement = createHtmlTask(task)
                replaceTaskInTable(idTask, task)
                sortByDeadlineAscending()
                renderTasks()
            } else console.error("Ошибка при редактировании задачи");
        }
        modalBody.hide()
    }
})

function replaceTaskInTable(idTask, task) {
    const index = table.findIndex(t => t.id === idTask);
    if (index !== -1) {
        table[index] = task;
    }
}


function createHtmlTask(task) {
    let newTask = addEmptyTask()

    addListenersToNewTask(newTask, task)
    setValuesToShortTask(newTask, task)

    return newTask
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
        newTask.children[0].children[1].children[1].children[0].textContent = toLocalDatetimeInputValue(new Date(task.deadline), false)
    }
    task.status = defineStatus(task.deadline, task.status)
    newTask.children[0].children[1].children[1].children[1].textContent = Status[task.status]
}

function setValuesToModal(task) {
    modalName.value = task.name
    modalDescription.value = task.description
    modalDeadline.value = task.deadline === null ? "" : toLocalDatetimeInputValue(new Date(task.deadline), true)
    modalStatus.value = Object.keys(Status).indexOf(task.status)
    modalPriority.value = Object.keys(Priority).indexOf(task.priority)
    modalCreatedOn.value = toLocalDatetimeInputValue(new Date(task.createdOn), false)
    modalModifiedOn.value = toLocalDatetimeInputValue(new Date(task.modifiedOn), false)
}

function toLocalDatetimeInputValue(date, format) {
    const pad = (n) => n.toString().padStart(2, '0');

    if(format) return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    else return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function setDefaultValuesToModal() {
    modalName.value = "Новая задача"
    modalDescription.value = ""
    modalDeadline.value = ""
    modalStatus.value = 0
    modalPriority.value = 0
    let date = new Date().toISOString();
    modalCreatedOn.value = toLocalDatetimeInputValue(new Date(date), false)
    modalModifiedOn.value = toLocalDatetimeInputValue(new Date(date), false)
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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(task.status)
            }).then(r => {
            setValuesToShortTask(newTask, task);
        })
    })

    newTask.children[0].children[1].addEventListener('click', async (event) => {
        isNewTask = 0
        currentTaskElement.innerHTML = newTask.innerHTML
        idTask = task.id

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

    if (deadline !== null) {
        if(deadline < currDate) {
            if(status === "Active")
                return "Overdue"
            else if (status === "Completed")
                return "Late"
        }
        else {
            if(status === "Overdue")
                return "Active"
            else if(status === "Late")
                return "Completed"
        }
    }
    else {
        if(status === "Overdue")
            return "Active"
        else if(status === "Late")
            return "Completed"
    }
    return status
}

function assignPriority(name, priority) {
    let cleanedName = name;
    let editedPriority = priority;

    if (editedPriority === "Medium") {
        for (const [macro, value] of Object.entries(macros)) {
            if (name.includes(macro)) {
                editedPriority = value;
                cleanedName = name.replace(macro, '').trim();
                break;
            }
        }
    }

    return { cleanedName, editedPriority };
}

function assignDeadline(name, deadline) {
    let cleanedNameAgain = name;
    let editedDeadline = deadline;

    if (deadline == null) {
        const regex = /!before\s+(\d{2}[.-]\d{2}[.-]\d{4})/i;
        const match = name.match(regex);

        if (match !== null) {
            const rawDate = match[1].replace(/-/g, '.');
            const [day, month, year] = rawDate.split('.');
            const formattedDate = `${year}-${month}-${day}`;

            const dateObj = new Date(formattedDate);
            if (!isNaN(dateObj.getTime())) {
                editedDeadline = formattedDate;
                cleanedNameAgain = name.replace(regex, '').trim();
            }
        }
    }

    return { cleanedNameAgain, editedDeadline };
}


function sortByDeadlineAscending() {
    table.sort((a, b) => {
        if (a.deadline === null && b.deadline === null) return 0;
        if (a.deadline === null) return 1;
        if (b.deadline === null) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
    });
}

function renderTasks() {
    const listContainer = todolist.children[2];
    listContainer.innerHTML = ""; // Очистить список
    table.forEach(task => {
        const taskElement = createHtmlTask(task);
        listContainer.appendChild(taskElement);
    });
}



window.onload = async function () {
    let response = await fetch(host + "/tasks/list",
        {
            method: 'GET'
        })

    /** @type {{ todoItems: any[] }} */
    const json = await response.json();
    table = json.todoItems
    sortByDeadlineAscending()
    renderTasks()
}
