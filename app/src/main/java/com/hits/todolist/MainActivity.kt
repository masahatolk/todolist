package com.hits.todolist

import android.os.Bundle
import com.google.android.material.snackbar.Snackbar
import androidx.appcompat.app.AppCompatActivity
import androidx.navigation.findNavController
import androidx.navigation.ui.AppBarConfiguration
import androidx.navigation.ui.navigateUp
import android.view.Menu
import android.view.MenuItem
import android.widget.ListView
import com.hits.todolist.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {

    private lateinit var appBarConfiguration: AppBarConfiguration
    private lateinit var binding: ActivityMainBinding
    private lateinit var listView: ListView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        listView = binding.listView

        //val listOfTasks = Task.getTasksFromFile("tasks.json", this)

        val list = ArrayList<Task>()

        val adapter = TodolistAdapter(this, list)
        listView.adapter = adapter

        binding.fab.setOnClickListener {
            val newTask = Task()
            list.add(newTask)
            adapter.notifyDataSetChanged()
        }
    }
}