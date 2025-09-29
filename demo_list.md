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
    <label class="ml-3">
      <input type="checkbox" id="filter-hasReports" onclick="filterDemos()" /> 
      Reports
    </label>
    <label class="ml-3">
      <input type="checkbox" id="filter-music" onclick="filterDemos()" /> 
      Music
    </label>
    <label class="ml-3">
      <input type="checkbox" id="filter-sound" onclick="filterDemos()" /> 
      Sound
    </label>
    {% for tech in site.techs %}
    <label class="ml-2">
      <input type="checkbox" 
             class="filter-tech-checkbox"
             id="filter-tech-{{ tech.slug }}" 
             value="{{ tech.slug }}" 
             onclick="filterDemos()" /> 
      {{ tech.shortTitle }}
    </label>
  {% endfor %}
</div>


  <div id="demo_list" class="row">
    {% assign ordered_demos = site.demos | sort:"date" %}
    {% for demo in ordered_demos reversed %}
      {% unless demo.hidden %}
    <div class="demo-item col-lg-6 col-md-6 col-sm-12 mb-4" 
     data-title="{{ demo.title }}" 
     data-date="{{ demo.date }}" 
     data-last_updated="{{ demo.lastUpdated }}" 
     data-music="{{ demo.music }}" 
     data-sound="{{ demo.sound }}" 
     data-hasReports="{{ demo.hasReports }}"
     data-techs="{{ demo.techs | join: ',' }}"
     >
      <div class="row align-items-center demo-row" onclick="toggleDetails(this)">
        <!-- Thumbnail Image -->
        <div class="col-6 thumbnail-container">
          <img src="/assets/images/thumbnails/{{ demo.slug }}.png" alt="{{ demo.title }} thumbnail" class="thumbnail-image" onerror="this.onerror=null; this.src='/assets/thumbnails/placeholder.png';">
        </div>

        <!-- Demo Title -->
        <div class="col-6">
          <a style="width:100%" href="{{ demo.url }}" class="btn btn-outline-dark tag-btn">
            <span class="fa fa-play" aria-hidden="true"></span> {{ demo.title }}
          </a>
          <br>

{% assign formattedDate = demo.date | date: "%Y-%m-%d" %}
{% assign formattedLastUpdated = demo.lastUpdated | date: "%Y-%m-%d" %}

<span style="font-size:14px;">Added: {{ formattedDate }}</span>
{% if demo.lastUpdated %}
  {% if formattedLastUpdated != formattedDate %}
    <br><span style="font-size:14px;">Updated: {{ formattedLastUpdated }}</span>
  {% endif %}
{% endif %}

          <br>
          {% if demo.music %}
            <span class="fa fa-music" aria-hidden="true" title="Has music"></span>
          {% endif %}
          {% if demo.sound %}
            <span class="fa fa-volume-up" aria-hidden="true" title="Has sound"></span>
          {% endif %}

          {% for techname in demo.techs %}
            {% assign tech = site.techs | where: "slug", techname | first %}
  {% if tech %}
    <button style="font-size: 0.8em;" class="py-0 btn btn-sm btn-outline-dark tag-btn tech-filter-btn" data-tech="{{ tech.slug }}">
              <span class="fa fa-tag" aria-hidden="true"></span> {{ tech.shortTitle }}
            </button>
            {% endif %}
          {% endfor %}
          {% if demo.hasReports %}
            {% if demo.slug == 'recursio' %}
              <button  style="width:100%;height:25px;font-size: 0.9em;" data-src="/iframe/{{ demo.slug }}/reports/index.html" class="py-0 btn btn-sm btn-outline-dark">
                <span class="fa fa-check" aria-hidden="true"></span> Reports (SPOILERS)
              </button>
            {% else %}
              <button  style="width:100%;height:25px;font-size: 0.9em;" data-src="/iframe/{{ demo.slug }}/reports/index.html" class="py-0 btn btn-sm btn-outline-dark">
                <span class="fa fa-check" aria-hidden="true"></span> View Reports
              </button>
            {% endif %}
          {% endif %}
        </div>



      <!-- Changelog Section -->
      </div>

      <div class="row demo-details" style="display:none; position: absolute; width: 100%;">
        <div class="col-12">
          {% if demo.changelog %}
          <b>Changelog</b>
          <ul class="changelog">
            {% for change in demo.changelog %}
            <li>{{ change }}</li>
            {% endfor %}
          </ul>
          {% endif %}
        </div>
      </div>
    </div>  
  {% endunless %}
    {% endfor %}
  </div>
</div>
<div id="modal" class="modal">
  <div class="modal-content">
    <span class="close">&times;</span>
    <iframe id="modalIframe" src="" frameborder="0"></iframe>
  </div>
</div>
<script>
  document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('modal');
  const modalIframe = document.getElementById('modalIframe');
  const closeBtn = document.querySelector('.close');

  // Function to open the modal
  function openModal(src) {
    modalIframe.src = src;
    modal.style.display = 'block';
  }

  // Function to close the modal
  function closeModal() {
    modal.style.display = 'none';
    modalIframe.src = '';
  }

  // Event listener for <a> tags with data-src
  document.querySelectorAll('button[data-src]').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      openModal(this.getAttribute('data-src'));
    });
  });

  // Close modal when clicking the close button
  closeBtn.addEventListener('click', closeModal);

  // Close modal when clicking outside the iframe
  window.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });
});

</script>
<style>
  .modal {
  display: none;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
}

.modal-content {
  position: relative;
  margin: 10% auto;
  width: 80%;
  height: 80%;
}

.close {
  position: absolute;
  right: 10px;
  top: 5px;
  color: #fff;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
}

#modalIframe {
  width: 100%;
  height: 100%;
}

</style>

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

    // Find the iframe descendant and set its src to its data-src attribute
    const iframe = details.querySelector('iframe');
    if (iframe && iframe.hasAttribute('data-src')) {
      iframe.src = iframe.getAttribute('data-src');
    }
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

window.onpageshow = function(event) {
    filterDemos();
};
  // Function to filter demos based on Music and Sound checkboxes
function filterDemos() {
  const filterMusic = document.getElementById('filter-music').checked;
  const filterSound = document.getElementById('filter-sound').checked;
  const filterHasReports = document.getElementById('filter-hasReports').checked;
  const demoItems = document.getElementsByClassName('demo-item');

  // Get all selected tech filters
  const selectedTechs = Array.from(document.querySelectorAll('input[id^="filter-tech-"]:checked'))
    .map(checkbox => checkbox.value);

  for (let i = 0; i < demoItems.length; i++) {
    const demoItem = demoItems[i];
    const hasMusic = demoItem.getAttribute('data-music') === 'true';
    const hasSound = demoItem.getAttribute('data-sound') === 'true';
    const hasReports = demoItem.getAttribute('data-hasReports') === 'true';
    const demoTechs = demoItem.getAttribute('data-techs').split(',');

    // Check if demo passes all filters
    const techMatch = selectedTechs.length === 0 || 
      selectedTechs.every(tech => demoTechs.includes(tech));

    if (
      (!filterMusic || hasMusic) &&
      (!filterSound || hasSound) &&
      (!filterHasReports || hasReports) &&
      techMatch
    ) {
      demoItem.style.display = 'block';
    } else {
      demoItem.style.display = 'none';
    }
  }
  // Scroll to the top of the page
  window.scrollTo(0, 0);
}

function filterByTech(techSlug) {
   const checkboxes = document.querySelectorAll(`input[type="checkbox"].filter-tech-checkbox`);
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });
  const checkbox = document.getElementById(`filter-tech-${techSlug}`);
  if (checkbox) {
    checkbox.checked = true;
    filterDemos();
  }
}

// Add event listeners to tech filter buttons
document.querySelectorAll('.tech-filter-btn').forEach(button => {
  button.addEventListener('click', function(event) {
    event.stopPropagation();
    filterByTech(this.getAttribute('data-tech'));
  });
});

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

{% include music-player.html %}



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

  .changelog {
    font-size: 14px;
  }
</style>
