---
layout: demo_list
permalink: /demo_list
---

<div class="container col-lg-8 col-md-12">
  <!-- Sort Buttons with Icons -->
  <div class="mb-3">
    <button class="btn btn-primary" onclick="sortDemos('title', this)">
      Title <span class="fa fa-sort" aria-hidden="true"></span>
    </button>
    <button class="btn btn-primary" onclick="sortDemos('date', this)">
      Date Added <span class="fa fa-sort" aria-hidden="true"></span>
    </button>
    <button class="btn btn-primary" onclick="sortDemos('last_updated', this)">
      Date Updated <span class="fa fa-sort" aria-hidden="true"></span>
    </button>
  </div>

  <!-- Checkboxes for Music and Sound Filters -->
  <div class="mb-3">
    <span>Filter:</span>
    <label>
      <input type="checkbox" id="filter-music" onclick="filterDemos()" /> 
      Music
    </label>
    <label class="ml-3">
      <input type="checkbox" id="filter-sound" onclick="filterDemos()" /> 
      Sound
    </label>
  </div>

  <div id="demo_list" class="row">
    {% assign ordered_demos = site.demos | sort:"date" %}
    {% for demo in ordered_demos reversed %}
    <div class="demo-item col-lg-6 col-md-6 col-sm-12 mb-4" data-title="{{ demo.title }}" data-date="{{ demo.date }}" data-last_updated="{{ demo.lastUpdated }}" data-music="{{ demo.music }}" data-sound="{{ demo.sound }}">
      <div class="row align-items-center demo-row" onclick="toggleDetails(this)">
        <!-- Thumbnail Image -->
        <div class="col-6 thumbnail-container">
          <img src="/assets/images/thumbnails/{{ demo.slug }}.png" alt="{{ demo.title }} thumbnail" class="thumbnail-image" onerror="this.onerror=null; this.src='/assets/thumbnails/placeholder.png';">
        </div>

        <!-- Demo Title -->
        <div class="col-6">
          <a href="{{ demo.url }}" class="btn btn-outline-dark tag-btn">
            <span class="fa fa-play" aria-hidden="true"></span> {{ demo.title }}
          </a>
          <br>

{% assign formattedDate = demo.date | date: "%Y-%m-%d" %}
{% assign formattedLastUpdated = demo.lastUpdated | date: "%Y-%m-%d" %}

<span>Added: {{ formattedDate }}</span>
{% if demo.lastUpdated %}
  {% if formattedLastUpdated != formattedDate %}
    <br><span>Updated: {{ formattedLastUpdated }}</span>
  {% endif %}
{% endif %}

          <br>
          {% if demo.music %}
            <span class="fa fa-music" aria-hidden="true" title="Has music"></span>
          {% endif %}
          {% if demo.sound %}
            <span class="fa fa-volume-up" aria-hidden="true" title="Has sound"></span>
          {% endif %}
        </div>
      </div>

      <!-- Combined Techs and Changelog Section -->
      <div class="row demo-details" style="display:none; position: absolute; width: 100%;">
        <div class="col-12">
          {% for techname in demo.techs %}
            {% assign tech = site.techs | where: "slug", techname | first %}
            <a href="{{ tech.url }}" class="btn btn-sm btn-outline-dark tag-btn">
              <span class="fa fa-tag" aria-hidden="true"></span> {{ tech.shortTitle }}
            </a>
          {% endfor %}

          {% if demo.changelog %}
          <h5>Changelog</h5>
          <ul>
            {% for change in demo.changelog %}
            <li>{{ change }}</li>
            {% endfor %}
          </ul>
          {% endif %}
        </div>
      </div>
    </div>  
    {% endfor %}
  </div>
</div>

<script>
  let currentOpen = null; // Track the currently opened row

  // Function to toggle details (techs + changelog)
  function toggleDetails(row) {
    event.stopPropagation();

    const details = row.nextElementSibling;
    const allDetails = document.querySelectorAll('.demo-details');

    // Close any currently open details
    allDetails.forEach(detail => {
      if (detail !== details) {
        detail.style.display = 'none';
        detail.previousElementSibling.classList.remove('active');
      }
    });

    // make all items inactive and then make this item active
    const allItems = document.querySelectorAll('.demo-item');
    allItems.forEach(item => {
      item.classList.remove('active');
    })
    row.parentElement.classList.add('active');

    // expand the clicked row
    details.style.display = 'block';
    currentOpen = details;
  }

  let sortOrder = 'asc'; // Track the current sort order globally
  let lastCriteria = ''; // Track the last sorted criteria

  function sortDemos(criteria, button) {
    const demoList = document.getElementById('demo_list');
    const demos = Array.from(demoList.getElementsByClassName('demo-item'));

    // Toggle sort order if the same criteria is clicked twice
    if (lastCriteria === criteria) {
      sortOrder = (sortOrder === 'asc') ? 'desc' : 'asc';
    } else {
      sortOrder = 'asc'; // Default to ascending if sorting by a new criteria
    }
    lastCriteria = criteria; // Update last sorted criteria

    // Sorting logic based on criteria and order
    demos.sort((a, b) => {
      const aValue = a.getAttribute(`data-${criteria}`).toLowerCase();
      const bValue = b.getAttribute(`data-${criteria}`).toLowerCase();
      
      if (criteria === 'title') {
        return (sortOrder === 'asc') ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else if (criteria === 'date' || criteria === 'last_updated') {
        return (sortOrder === 'asc') ? new Date(aValue) - new Date(bValue) : new Date(bValue) - new Date(aValue);
      }
    });

    // Clear and re-append sorted demo items
    demoList.innerHTML = '';
    demos.forEach(demo => demoList.appendChild(demo));

    // Update the sort icons
    updateSortIcons(button);
  }

  // Function to update the sort icons on the buttons
  function updateSortIcons(activeButton) {
    const buttons = document.querySelectorAll('.btn-primary');

    // Remove the icons from all buttons
    buttons.forEach(button => {
      button.querySelector('span').className = 'fa fa-sort';
    });

    // Update the active button's icon
    const icon = activeButton.querySelector('span');
    if (sortOrder === 'asc') {
      icon.className = 'fa fa-sort-up'; // Ascending icon
    } else {
      icon.className = 'fa fa-sort-down'; // Descending icon
    }
  }

  // Function to filter demos based on Music and Sound checkboxes
  function filterDemos() {
    const filterMusic = document.getElementById('filter-music').checked;
    const filterSound = document.getElementById('filter-sound').checked;
    const demoItems = document.getElementsByClassName('demo-item');

    for (let i = 0; i < demoItems.length; i++) {
      const demoItem = demoItems[i];
      const hasMusic = demoItem.getAttribute('data-music') === 'true';
      const hasSound = demoItem.getAttribute('data-sound') === 'true';

      // Show the demo if it matches the filter criteria
      if (
        (!filterMusic || hasMusic) && 
        (!filterSound || hasSound)
      ) {
        demoItem.style.display = 'block'; // Show the demo
      } else {
        demoItem.style.display = 'none'; // Hide the demo
      }
    }
  }

  // Deselect the currently selected item when clicking outside
  document.addEventListener('click', () => {

      const allItems = document.querySelectorAll('.demo-item');
      allItems.forEach(item => {
        item.classList.remove('active');
      })

      const allDetails = document.querySelectorAll('.demo-details');
      allDetails.forEach(det => {
        det.style.display = 'none';
      })

      currentOpen = null;
  });
</script>

<style>
  .thumbnail-container {
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }

  .thumbnail-image {
    object-fit: cover;
    width: 150px; /* Ensure uniform height */
    height: 150px; /* Ensure uniform height */
  }

  .demo-item .row {
    align-items: center;
    transition: background-color 0.3s;
    cursor: pointer;
  }

  .demo-item.active {
    background-color: #DDD;
  }

  /* Techs and Changelog combined section */
  .demo-details {
    background-color: #DDD;
    padding: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    z-index: 10;
  }

  .demo-item:hover {
    background-color: #DDD; /* Fading hover color */
  }

  /* Ensure the techs + changelog section is overlayed */
  .demo-item {
    position: relative;
  }
</style>
