let addBtn = document.getElementById('addBtn')
let openBtn = document.getElementById('openBtn')
let saveBtn = document.getElementById('saveBtn')
let todolist = document.getElementById('todolist')

let table = []

class Task {
    constructor(id, isDone, text) {
        this.id = id;
        this.isDone = isDone;
        this.text = text;
    }
}

addBtn.addEventListener('click', addTask)

const host = "http://localhost:80"

async function addTask() {
    let id = crypto.randomUUID()

    await fetch(host + "/tasks",
        {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({Id: id, isDone: false, Text: ""}),
        })

    let task = new Task(id, false, "")

    table.unshift(task)
    let newTask = addTaskToList(task)
    todolist.children[2].append(newTask)

    //addListenersToNewTask(newTask, task)
}

function addTaskToList(task) {
    let newTask = addEmptyTask()

    addListenersToNewTask(newTask, task)

    newTask.children[0].children[0].children[0].checked = task.isDone
    newTask.children[0].children[1].value = task.text

    return newTask
}

function addListenersToNewTask(newTask, task) {
    newTask.children[0].children[2].addEventListener('click', (event) => {
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
    newTask.children[0].children[1].addEventListener('focusout', (event) => {
        task.text = event.target.value

        fetch(host + `/tasks/${task.id}/text`,
            {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(task.text)
            }).then(r => r.text())
    })
}

function addEmptyTask() {
    let task = document.createElement('div')
    task.className = 'task'
    task.innerHTML = '' +
        '<div class="input-group">\n' +
        '  <div class="input-group-text">\n' +
        '    <input class="form-check-input mt-0" type="checkbox" value="" aria-label="Checkbox for following text input">\n' +
        '  </div>\n' +
        '  <input type="text" class="form-control" aria-label="Text input with checkbox">\n' +
        '<div class="input-group-text">\n' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg transition" viewBox="0 0 16 16">\n' +
        '  <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>\n' +
        '</svg>' +
        '</div>' +
        '</div>'

    return task
}

window.onload = async function () {
    let response = await fetch(host + "/tasks/list",
        {
            method: 'GET'
        })

    let result = await response.text()
    result = result.substring(13)
    result = result.substring(0, result.length - 1)
    table = JSON.parse(result)


    for(let i = 0; i < table.length; i++) {
        let newTask = addTaskToList(table[i])
        todolist.children[2].append(newTask)
    }
}
