package com.hits.todolist

import kotlinx.serialization.Serializable

@Serializable
class ListDto(
    val todoItems: List<TaskDto>
)