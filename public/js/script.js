const socket = io();

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            socket.emit('send-location', { latitude, longitude });
        },
        (error) => {
            console.error(error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
}

let map;
const markers = {};

document.addEventListener("DOMContentLoaded", function() {
    map = L.map("map").setView([0, 0], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: 'Tejasvi'
    }).addTo(map);
});

socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;

    // Center the map on the new location
    map.setView([latitude, longitude], 16);

    // Update or create a marker for each user
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
