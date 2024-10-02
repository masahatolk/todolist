package com.hits.todolist

import android.annotation.SuppressLint
import android.content.Context
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.BaseAdapter
import android.widget.CheckBox
import android.widget.EditText
import android.widget.ImageView
import android.widget.TextView
import androidx.lifecycle.LifecycleCoroutineScope
import com.hits.todolist.databinding.ActivityMainBinding
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class TodolistAdapter(
    private val context: Context,
    private val dataSource: ArrayList<Task>,
    private val service: TodolistService,
    private val scope: LifecycleCoroutineScope
) : BaseAdapter() {

    private val inflater: LayoutInflater =
        context.getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater

    private val binding = ActivityMainBinding.inflate(inflater)

    override fun getCount(): Int {
        return dataSource.size
    }

    override fun getItem(position: Int): Any {
        return dataSource[position]
    }

    override fun getItemId(position: Int): Long {
        return position.toLong()
    }

    @SuppressLint("ViewHolder", "ResourceType")
    override fun getView(position: Int, convertView: View?, parent: ViewGroup?): View {
        val view = inflater.inflate(R.layout.task, parent, false)
        val item = dataSource[position]

        view.findViewById<CheckBox>(R.id.checkBox).isChecked = item.isDone
        view.findViewById<EditText>(R.id.textDescription).setText(item.text)

        view.findViewById<CheckBox>(R.id.checkBox).setOnClickListener() {
            item.isDone = !item.isDone

            scope.launch(Dispatchers.IO + exceptionHandler) {
                service.changeStateTodoItem(item.id)
            }
        }
        view.findViewById<EditText>(R.id.textDescription)
            .addTextChangedListener(object : TextWatcher {
                override fun beforeTextChanged(
                    s: CharSequence?,
                    start: Int,
                    count: Int,
                    after: Int
                ) {
                }

                override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}

                override fun afterTextChanged(s: Editable?) {
                    item.text = view.findViewById<TextView>(R.id.textDescription).text.toString()

                    scope.launch(Dispatchers.IO + exceptionHandler) {
                        service.editTextTodoItem(item.id, item.text)
                    }
                }
            })

        view.findViewById<ImageView>(R.id.delete).setOnClickListener {
            dataSource.remove(item)
            scope.launch(Dispatchers.IO + exceptionHandler) {
                service.deleteTodoItem(item.id)
            }

            notifyDataSetChanged()
        }
        return view
    }
}