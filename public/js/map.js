window.addEventListener("load", () => {
    console.log("Map JS Loaded");

    if (typeof L === "undefined") {
        console.error("Leaflet not loaded");
        return;
    }

    if (typeof listings === "undefined") {
        console.error("Listings not available");
        return;
    }

    // Default center (India)
    const defaultCenter = [28.6139, 77.2090];

    const map = L.map('map').setView(defaultCenter, 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: "© OpenStreetMap contributors"
    }).addTo(map);

    const markers = L.markerClusterGroup();

    const validCoords = [];

    listings.forEach(listing => {

        if (
            !listing.geometry ||
            !listing.geometry.coordinates ||
            listing.geometry.coordinates.length < 2
        ) {
            return;
        }

        const coords = listing.geometry.coordinates;
        const lat = coords[1];
        const lng = coords[0];

        validCoords.push([lat, lng]);

        const marker = L.marker([lat, lng])
            .bindPopup(`
                <div style="width:200px">
                    <h6 style="margin:0;">${listing.title}</h6>
                    <p style="margin:0; font-size:12px;">
                        ₹ ${listing.price ? listing.price.toLocaleString("en-IN") : "N/A"} / night
                    </p>
                    <a href="/listings/${listing._id}" style="font-size:12px;">
                        View Details
                    </a>
                </div>
            `);

        markers.addLayer(marker);
    });

    map.addLayer(markers);

    // Handle zoom + center properly
    if (validCoords.length > 0) {
        const bounds = L.latLngBounds(validCoords);
        map.fitBounds(bounds, { padding: [50, 50] });
    } else {
        // fallback if no listings
        map.setView(defaultCenter, 5);
    }
});