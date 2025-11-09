const listing = window.listingData;

let map;
let poiLayer; // for nearby attractions layer

function initMap() {
  let lat, lon;

  if (listing.geometry && listing.geometry.coordinates.length === 2) {
    lon = listing.geometry.coordinates[0];
    lat = listing.geometry.coordinates[1];
  } else {
    // Default: Gurgaon, India
    lat = 28.4595;
    lon = 77.0266;
  }

  map = L.map("map").setView([lat, lon], 13);

  // Base OSM tiles
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);

  // Listing marker
  L.marker([lat, lon])
    .addTo(map)
    .bindPopup(`<b>${listing.title || "Listing Location"}</b><br>${listing.location || "Gurgaon"}`)
    .openPopup();

  // Fix Leaflet layout rendering
  setTimeout(() => map.invalidateSize(), 250);
}

// Fetch nearby Points of Interest (POIs)
async function fetchNearbyPOI() {
  if (poiLayer) {
    map.removeLayer(poiLayer);
    poiLayer = null;
    document.getElementById("togglePOI").innerHTML = '<i class="fa-solid fa-location-dot"></i> Show Nearby Attractions';
    return;
  }

  const [lon, lat] = listing.geometry?.coordinates || [77.0266, 28.4595];
  const overpassURL = `https://overpass-api.de/api/interpreter?data=[out:json];(node["tourism"="attraction"](around:2000,${lat},${lon});node["amenity"="restaurant"](around:2000,${lat},${lon});node["amenity"="cafe"](around:2000,${lat},${lon});node["leisure"="park"](around:2000,${lat},${lon}););out;`;

  try {
    const res = await fetch(overpassURL);
    const data = await res.json();

    poiLayer = L.layerGroup();

    data.elements.forEach((el) => {
      if (el.lat && el.lon) {
        const marker = L.marker([el.lat, el.lon]).bindPopup(
          `<b>${el.tags.name || "Unnamed Place"}</b><br>${el.tags.amenity || el.tags.tourism || el.tags.leisure}`
        );
        poiLayer.addLayer(marker);
      }
    });

    poiLayer.addTo(map);
    document.getElementById("togglePOI").innerHTML = '<i class="fa-solid fa-xmark"></i> Hide Nearby Attractions';
  } catch (err) {
    console.error("Overpass API error:", err);
    alert("Unable to load nearby attractions right now.");
  }
}

document.addEventListener("DOMContentLoaded", initMap);
document.getElementById("togglePOI").addEventListener("click", fetchNearbyPOI);
