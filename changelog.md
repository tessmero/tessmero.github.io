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

{% assign sorted_changes = all_changes | sort %}

<ul>
  {% for change in sorted_changes reversed %}

    {% assign parts = change | split: '|' %}
    <li>
      {{ parts[0] }} <b>{{parts[1]}}</b> 
      <br>&nbsp;&nbsp;{{parts[2]}}
    </li>
  {% endfor %}
</ul>