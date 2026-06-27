const map = L.map("map").setView([54, -2], 5);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "© OpenStreetMap"
}).addTo(map);

const markerCluster = L.markerClusterGroup();
map.addLayer(markerCluster);

let lightbox;

const categoryIcons = {
  "Castle": "🏰",
  "Town": "🏘️",
  "National Park": "⛰️",
  "Abbey": "⛪",
  "Aqueduct": "🌉",
  "Viewpoint": "🌄",
  "Church": "⛪"
};

places.forEach(place => {
  place.photos = [];

for (let i = 1; i <= place.count; i++) {
  place.photos.push(`photos/${place.base}-${i}.jpg`);
}
});

function createIcon(category) {
  const iconEmoji = categoryIcons[category] || "📍";

  return L.divIcon({
    html: `<div class="custom-marker">${iconEmoji}</div>`,
    className: "custom-div-icon",
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });
}

function createPopup(place, index) {
  let gallery = "";

  place.photos.forEach((photo, i) => {
    gallery += `
      <a href="${photo}"
         class="glightbox"
         data-gallery="gallery-${index}"
         data-title="${place.name}"
         data-description="${place.description}">
        ${i === 0 ? `<img src="${photo}" class="popup-img">` : ""}
      </a>
    `;
  });

  return `
    <div class="popup-title">${place.name}</div>
    <p><b>${place.category}</b></p>
    <p>${place.description}</p>
    ${gallery}
    <br>
    <small>Click photo to open fullscreen gallery</small>
  `;
}

function renderMarkers() {
  markerCluster.clearLayers();

  const searchText = document
    .getElementById("searchBox")
    .value
    .toLowerCase();

  const selectedCategory =
    document.getElementById("categoryFilter").value;

  places.forEach((place, index) => {
    const matchesSearch =
      place.name.toLowerCase().includes(searchText) ||
      place.description.toLowerCase().includes(searchText);

    const matchesCategory =
      selectedCategory === "All" ||
      place.category === selectedCategory;

    if (matchesSearch && matchesCategory) {
      const marker = L.marker(place.coords, {
        icon: createIcon(place.category)
      });

      marker.bindPopup(createPopup(place, index), {
        maxWidth: 380
      });

      markerCluster.addLayer(marker);
    }
  });

  if (lightbox) {
    lightbox.destroy();
  }

  lightbox = GLightbox({
    selector: ".glightbox",
    touchNavigation: true,
    loop: true,
    zoomable: true
  });
}

document
  .getElementById("searchBox")
  .addEventListener("input", renderMarkers);

document
  .getElementById("categoryFilter")
  .addEventListener("change", renderMarkers);

map.on("popupopen", function () {
  if (lightbox) {
    lightbox.reload();
  }
});

renderMarkers();
