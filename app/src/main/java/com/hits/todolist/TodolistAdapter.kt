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
import android.widget.Toast
import androidx.core.text.set
import com.hits.todolist.databinding.ActivityMainBinding

class TodolistAdapter(private val context: Context, private val dataSource: ArrayList<Task>) :
    BaseAdapter() {

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

        view.findViewById<CheckBox>(R.id.checkBox).isChecked = item.isChecked
        view.findViewById<EditText>(R.id.textDescription).setText(item.text)

        view.findViewById<CheckBox>(R.id.checkBox).setOnClickListener() {
            item.isChecked = !item.isChecked
        }
        view.findViewById<EditText>(R.id.textDescription)
            .addTextChangedListener(object : TextWatcher {
                override fun beforeTextChanged(
                    s: CharSequence?,
                    start: Int,
                    count: Int,
                    after: Int
                ) {}

                override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                    item.text = view.findViewById<TextView>(R.id.textDescription).text.toString()
                }

                override fun afterTextChanged(s: Editable?) {}
            })
        /*if (!hasFocus) {
            item.text = v.findViewById<TextView>(R.id.textDescription).text.toString()
        }*/

        view.findViewById<ImageView>(R.id.delete).setOnClickListener() {
            dataSource.remove(item)
            notifyDataSetChanged()
        }
        return view
    }
}