
mapboxgl.accessToken = mapToken;

    const map = new mapboxgl.Map({
    container: "map", // container ID
    style:"mapbox://styles/mapbox/streets-v12", //style URL
    center: listing.geometry.coordinates, // starting position [lng, lat]
    zoom: 9 // starting zoom
});

const marker1 = new mapboxgl.Marker({ color: "red"})
.setLngLat(listing.geometry.coordinates) //Listing.geometry.cordinates 
.setPopup(new mapboxgl.Popup({offset: 25})
.setHTML(
    `<h4>${listing.title}</h4><p>Exact location will be provided after booking</p>`))
.addTo(map);
