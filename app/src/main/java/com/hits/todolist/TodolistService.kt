package com.hits.todolist

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path

interface TodolistService {
    @GET("tasks/list")
    suspend fun viewTodoList(): Response<ListDto>

    @POST("tasks")
    suspend fun addTodoItem(@Body body: TaskDto): Response<Unit>

    @DELETE("tasks/{id}")
    suspend fun deleteTodoItem(@Path("id") id: String): Response<Unit>

    @PATCH("tasks/{id}/text")
    suspend fun editTextTodoItem(@Path("id") id: String, @Body body: String): Response<Unit>

    @PATCH("tasks/{id}/state")
    suspend fun changeStateTodoItem(@Path("id") id: String): Response<Unit>
}