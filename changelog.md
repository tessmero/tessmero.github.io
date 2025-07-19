---
layout: page
title: "Changelog"
---

{% assign all_changeables = site.demos | concat: site.changelogs %}

{% assign all_changes = "" | split: ',' %}
{% for changeable in all_changeables %}
  {% for change in changeable.changelog %}
    {% assign date = change | slice: 0, 10 %}
    {% assign message = change | slice: 11, change.size %}
    {% assign modChange = date | append: '|' | append: changeable.title | append: '|' | append: message %}
    {% assign all_changes = all_changes | push: modChange %}
  {% endfor %}
{% endfor %}

{% assign sorted_changes = all_changes | sort | reverse %}

<ul>
  {% assign last_date = "" %}
  {% assign last_message = "" %}
  {% assign combined_titles = "" %}

  {% for change in sorted_changes %}
    {% assign parts = change | split: '|' %}
    {% assign current_date = parts[0] %}
    {% assign current_title = parts[1] %}
    {% assign current_message = parts[2] %}

    {% if current_date == last_date and current_message == last_message %}
      {% assign combined_titles = current_title | append: ", " | append: combined_titles %}
    {% else %}
      {% if last_date != "" %}
        <li>
          {{ last_date }} <b>{{ combined_titles }}</b> 
          <br>&nbsp;&nbsp;{{ last_message }}
        </li>
      {% endif %}

      {% assign last_date = current_date %}
      {% assign last_message = current_message %}
      {% assign combined_titles = current_title %}
    {% endif %}
  {% endfor %}

  {% if last_date != "" %}
    <li>
      {{ last_date }} <b>{{ combined_titles }}</b> 
      <br>&nbsp;&nbsp;{{ last_message }}
    </li>
  {% endif %}
</ul>


{% include music-player.html %}
