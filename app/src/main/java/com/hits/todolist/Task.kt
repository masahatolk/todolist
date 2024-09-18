package com.hits.todolist

import kotlinx.serialization.Serializable

@Serializable
class Task {
    var isChecked: Boolean = false
    var text: String = ""
}
