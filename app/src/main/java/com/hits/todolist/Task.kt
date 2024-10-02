package com.hits.todolist

import java.util.UUID

class Task(
    var id: String = UUID.randomUUID().toString(),
    var isDone: Boolean = false,
    var text: String = ""
)
