package com.hits.todolist

import android.content.Intent
import android.os.Bundle
import android.os.Environment
import android.provider.DocumentsContract
import android.util.Log
import android.view.Menu
import android.view.MenuItem
import android.widget.ListView
import androidx.activity.result.ActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.FileProvider
import androidx.navigation.ui.AppBarConfiguration
import com.hits.todolist.databinding.ActivityMainBinding
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.encodeToJsonElement
import java.io.BufferedWriter
import java.io.File
import java.io.FileWriter
import java.io.Writer


class MainActivity : AppCompatActivity() {

    private lateinit var appBarConfiguration: AppBarConfiguration
    private lateinit var binding: ActivityMainBinding
    private lateinit var listView: ListView
    private val list = ArrayList<Task>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayShowTitleEnabled(false);

        listView = binding.listView


        val adapter = TodolistAdapter(this, list)
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
            R.id.save -> saveJson()
        }
        return super.onOptionsItemSelected(item)
    }

    private val launcher = registerForActivityResult<Intent, ActivityResult>(
        ActivityResultContracts.StartActivityForResult()
    ) { result: ActivityResult ->
        if (result.resultCode == RESULT_OK) {
            val data = result.data
            Log.d("TREST", "data: $data")
        }
    }


    private fun openJson() {
        val uri = FileProvider.getUriForFile(this, "${applicationContext.packageName}.provider", getExternalFilesDir("/Android/")!!)
        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
            setType("*/*")
            putExtra(DocumentsContract.EXTRA_INITIAL_URI, uri)
        }
        launcher.launch(intent)
    }

    private fun saveJson() {
        save(Json.encodeToJsonElement(list).toString())
    }

    private fun save(jsonString: String) {
        val output: Writer
        val file = createFile()
        output = BufferedWriter(FileWriter(file))
        output.write(jsonString)
        output.close()
    }

    private fun createFile(): File {
        val fileName = "todolistData"
        val storageDir = getExternalFilesDir("/Android/")!!

        if (!storageDir.exists()) {
            storageDir.mkdir()
        }

        return File.createTempFile(
            fileName,
            ".json",
            storageDir
        )
    }
}