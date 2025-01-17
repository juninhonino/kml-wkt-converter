document.getElementById('kmlForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById('kmlFile');
    if (fileInput.files.length === 0) {
        alert('Please select a KML file.');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
        const kmlText = e.target.result;

        // Parse the KML to extract geometries
        const parser = new DOMParser();
        const kmlDoc = parser.parseFromString(kmlText, 'application/xml');

        const placemarks = kmlDoc.getElementsByTagName('Placemark');
        const wktArray = [];

        for (let placemark of placemarks) {
            const coords = placemark.getElementsByTagName('coordinates')[0]?.textContent.trim();
            if (coords) {
                const points = coords.split(/\s+/).map(coord => {
                    const [lon, lat, alt = 0] = coord.split(',');
                    return `${lon} ${lat} ${alt}`;
                });

                const wkt = points.length === 1 
                    ? `POINT Z (${points[0]})`
                    : `LINESTRING Z (${points.join(', ')})`;
                wktArray.push(wkt);
            }
        }

        // Generate and download the WKT file
        const blob = new Blob([wktArray.join('\n')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'converted.wkt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    reader.readAsText(file);
});
