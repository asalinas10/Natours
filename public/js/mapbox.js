// This is for the map that diplays on each tour's web card
/* eslint-disable */

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiYXNhbGluYXMxOTk2IiwiYSI6ImNsdXcxODRjdTA1YmMycW84OGFhNTl1bWwifQ.EuMmzIdi7IlcodqfQa93eA';

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/asalinas1996/cluw4futx001701pph6j4a24q',
    scrollZoom: false,
    //   center: [-118.130894, 34.122858],
    //   zoom: 9,
    //   interactive: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p> ${loc.day}: ${loc.description} </p>`)
      .addTo(map);

    // Extend map bound to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
