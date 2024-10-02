package com.hits.todolist

import kotlinx.serialization.Serializable

@Serializable
data class TaskDto(
    val id: String,
    val isDone: Boolean,
    val text: String
)
