import PhotoSwipeLightbox from "https://unpkg.com/photoswipe@5/dist/photoswipe-lightbox.esm.js";

const map = L.map("map").setView([54, -2], 5);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "© OpenStreetMap"
}).addTo(map);

const markerCluster = L.markerClusterGroup();
map.addLayer(markerCluster);

const categoryIcons = {
  "Castle": "🏰",
  "Town": "🏘️",
  "National Park": "⛰️",
  "Abbey": "⛪",
  "Aqueduct": "🌉",
  "Viewpoint": "🌄",
  "Church": "⛪",
  "Coast": "🌊",
  "Wildlife": "🦋",
  "Zoo": "🦁",
  "Historic Architecture": "🏛️",
  "National Landscape": "🌿"
};

let lightbox = null;

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
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
}

function createPopup(place, index) {
  const galleryId = `gallery-${index}`;
  let galleryHtml = `<div class="pswp-gallery" id="${galleryId}">`;
  place.photos.forEach((photo, photoIndex) => {
    galleryHtml += `
      <a href="${photo}"
         data-pswp-width="2000"
         data-pswp-height="1333"
         target="_blank">
        ${photoIndex === 0 ? `<img src="${photo}" class="popup-img" alt="${place.name}">` : ""}
      </a>`;
  });
  galleryHtml += `</div>`;
  const websiteLink = place.website
    ? `
      <p>
        🌐 <a href="${place.website}"
              target="_blank"
              rel="noopener noreferrer">
          More information
        </a>
      </p>
      `
    : "";
  return `
    <div class="popup-title">${place.name}</div>
    <span class="popup-category">${place.category}</span>
    <p class="popup-description">${place.description}</p>
    ${websiteLink}
    ${galleryHtml}
    <span class="popup-help">Click photo to open fullscreen gallery</span>`;
}

function initPhotoSwipe() {
  if (lightbox) lightbox.destroy();
  lightbox = new PhotoSwipeLightbox({
    gallery: ".pswp-gallery",
    children: "a",
    pswpModule: () => import("https://unpkg.com/photoswipe@5/dist/photoswipe.esm.js")
  });
  lightbox.init();
}

function renderMarkers() {
  markerCluster.clearLayers();
  const searchText = document.getElementById("searchBox").value.toLowerCase();
  const selectedCategory = document.getElementById("categoryFilter").value;
  places.forEach((place, index) => {
    const matchesSearch =
      place.name.toLowerCase().includes(searchText) ||
      place.description.toLowerCase().includes(searchText) ||
      place.category.toLowerCase().includes(searchText);
    const matchesCategory = selectedCategory === "All" || place.category === selectedCategory;
    if (matchesSearch && matchesCategory) {
      const marker = L.marker(place.coords, { icon: createIcon(place.category) });
      marker.bindPopup(createPopup(place, index), { maxWidth: 380 });
      markerCluster.addLayer(marker);
    }
  });
  initPhotoSwipe();
}

document.getElementById("searchBox").addEventListener("input", renderMarkers);
document.getElementById("categoryFilter").addEventListener("change", renderMarkers);
map.on("popupopen", () => initPhotoSwipe());
renderMarkers();
