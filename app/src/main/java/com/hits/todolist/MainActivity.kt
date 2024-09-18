package com.hits.todolist

import android.content.Intent
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import android.widget.ListView
import androidx.activity.result.ActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.navigation.ui.AppBarConfiguration
import com.hits.todolist.databinding.ActivityMainBinding
import kotlinx.serialization.Serializable
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json


class MainActivity : AppCompatActivity() {

    private lateinit var appBarConfiguration: AppBarConfiguration
    private lateinit var binding: ActivityMainBinding
    private lateinit var listView: ListView
    private val list = ArrayList<Task>()
    private lateinit var adapter: TodolistAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayShowTitleEnabled(false);

        listView = binding.listView

        adapter = TodolistAdapter(this, list)
        listView.adapter = adapter

        binding.fab.setOnClickListener {
            val newTask = Task()
            list.add(newTask)
            adapter.notifyDataSetChanged()
        }
    }

    override fun onCreateOptionsMenu(menu: Menu?): Boolean {
        menuInflater.inflate(R.menu.menu_main, menu)
        return super.onCreateOptionsMenu(menu)
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        when (item.itemId) {
            R.id.open -> openJson()
            R.id.save -> save()
        }
        return super.onOptionsItemSelected(item)
    }

    private val launcher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result: ActivityResult ->
        if (result.resultCode == RESULT_OK) {
            val data = result.data
            val uri = data?.data ?: return@registerForActivityResult

            val file = contentResolver.openInputStream(uri) ?: return@registerForActivityResult
            val xxx: XXX = Json.decodeFromString(file.bufferedReader().readText())
            list.clear()
            list.addAll(xxx.aaa)
            adapter.notifyDataSetChanged()
        }
    }


    private fun openJson() {
        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
            setType("*/*")
        }
        launcher.launch(intent)
    }

    @Serializable
    data class XXX(val aaa: ArrayList<Task>)

    private val launcher2 = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result: ActivityResult ->
        if (result.resultCode == RESULT_OK) {
            val data = result.data
            val uri = data?.data ?: return@registerForActivityResult

            val writer = contentResolver.openOutputStream(uri)?.bufferedWriter()
            writer?.write(Json.encodeToString(XXX(list)))
            writer?.close()
        }
    }

    private fun save() {
        val intent = Intent(Intent.ACTION_CREATE_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "application/json"
            putExtra(Intent.EXTRA_TITLE, "data.json")
        }
        launcher2.launch(intent)
    }
}