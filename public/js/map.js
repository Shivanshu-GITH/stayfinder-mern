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

    const map = L.map('map').setView([28.6139, 77.2090], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: "© OpenStreetMap contributors"
    }).addTo(map);

    const markers = L.markerClusterGroup();

    listings.forEach(listing => {

        if (
            !listing.geometry ||
            !listing.geometry.coordinates ||
            listing.geometry.coordinates.length < 2
        ) {
            return;
        }

        const coords = listing.geometry.coordinates;

        const marker = L.marker([coords[1], coords[0]])
            .bindPopup(`
                <div style="width:200px">
                    <h6 style="margin:0;">${listing.title}</h6>
                    <p style="margin:0; font-size:12px;">
                        ₹ ${listing.price ? listing.price.toLocaleString("en-IN") : "N/A"} / night
                    </p>
                    <a href="/listings/${listing._id}">View Details</a>
                </div>
            `);

        markers.addLayer(marker);
    });

    map.addLayer(markers);

    // Auto zoom
    if (markers.getLayers().length > 0) {
        const bounds = markers.getBounds();
        map.fitBounds(bounds, { padding: [50, 50] });
    }
});