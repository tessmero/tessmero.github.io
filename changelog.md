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
  {% assign combined_titles_count = 0 %}

  {% for change in sorted_changes %}
    {% assign parts = change | split: '|' %}
    {% assign current_date = parts[0] %}
    {% assign current_title = parts[1] %}
    {% assign current_message = parts[2] %}

    {% if current_date == last_date and current_message == last_message %}
      {% assign combined_titles = current_title | append: ", " | append: combined_titles %}
      {% assign combined_titles_count = combined_titles_count | plus: 1 %}
    {% else %}
      {% if last_date != "" %}
        <li>
          {% assign first_char = last_message | strip | slice: 0, 1 %}

          {% if combined_titles_count > 1 %}
            {{ last_date }} <details style="display:inline;"><summary style="display:inline;"><b>{{ combined_titles_count }} Demos...</b></summary> <b>{{ combined_titles }}</b></details>
          {% else %}
            {{ last_date }} <b>{{ combined_titles }}</b> 
            {% if first_char != '<' %}
              <br>
            {% endif %}
          {% endif %}
          
          &nbsp;&nbsp;{{ last_message | strip }}
        </li>
      {% endif %}

      {% assign last_date = current_date %}
      {% assign last_message = current_message %}
      {% assign combined_titles = current_title %}
      {% assign combined_titles_count = 1 %}
    {% endif %}
  {% endfor %}

  {% if last_date != "" %}
    <li>
      {{ last_date }} <b>{{ combined_titles }}</b> 
      <br>&nbsp;&nbsp;{{ last_message | strip }}
    </li>
  {% endif %}
</ul>

{% include music-player.html %}
