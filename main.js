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

modal.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (modal.children[0].children[0].children[0].value.length < 4) {
        alert("Название задачи должно содержать минимум 4 символа.");
        return;
    }

    const status = getStatus(modalStatus.value)
    const priority = getPriority(modalPriority.value)
    const deadline = modalDeadline.value?.trim() === "" ? null : modalDeadline.value

    let task = new Task(modalName.value, modalDescription.value, deadline, status, priority);

    await fetch(host + "/tasks",
        {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: modalName.value,
                description: modalDescription.value,
                deadline: deadline,
                status: status,
                priority: priority,
            }),
        })

    table.unshift(task)

    let htmlTask = createHtmlTask(task)
    todolist.children[2].append(htmlTask)
})


function createHtmlTask(task) {
    let newTask = addEmptyTask()

    addListenersToNewTask(newTask, task)
    setValuesToShortTask(newTask, task)

    return newTask
}

function setValuesToShortTask(newTask, task) {
    if(task.status === 'COMPLETED' || task.status === 'LATE') {
        newTask.children[0].children[0].children[0].checked = true
    }
    newTask.children[0].children[1].children[1].children[0].value = task.deadline
    //newTask.children[0].children[0].children[0].checked = task.isDone
    //newTask.children[0].children[1].value = task.text
}

function setValuesToModal(task) {
    modal.children[0].children[0].children[0].value = task.name

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
        task.isDone = newTask.children[0].children[0].children[0].checked

        fetch(host + `/tasks/${task.id}/state`,
            {
                method: 'PATCH'
            }).then(r => r.text())
    })

    newTask.children[0].children[1].addEventListener('click', (event) => {
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
    if (status === Status.Active) {
        status = Status.Completed
    } else if (status === Status.Overdue) {
        status = Status.Late
    } else {
        status = Status.Active
        defineStatus(deadline, status)
    }
}

// выполнять при каждой загрузке списка задач
function defineStatus(deadline, status) {
    let currDate = Date.now()
    if (status === Status.Active && deadline < currDate) {
        status = Status.Overdue
    }
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
