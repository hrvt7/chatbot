// /api/air - Fetches real-time air quality data for Hungary from WAQI
// Bounding box: Hungary approx 45.7-48.6 lat, 16.1-22.9 lng

export async function GET() {
  const token = process.env.WAQI_TOKEN;

  if (!token) {
    return Response.json({ error: "WAQI_TOKEN not configured" }, { status: 500 });
  }

  try {
    // WAQI map bounds API - returns all stations in Hungary's bounding box
    const url = `https://api.waqi.info/v2/map/bounds?latlng=45.7,16.1,48.6,22.9&networks=all&token=${token}`;
    const res = await fetch(url, { next: { revalidate: 300 } }); // cache 5 min
    const data = await res.json();

    if (data.status !== "ok") {
      return Response.json({ error: "WAQI API error", details: data }, { status: 502 });
    }

    // Transform to clean format
    const stations = data.data.map((s) => ({
      name: s.station.name,
      lat: s.lat,
      lng: s.lon,
      aqi: parseInt(s.aqi) || null,
    })).filter(s => s.aqi !== null && s.aqi > 0);

    return Response.json({
      stations,
      count: stations.length,
      timestamp: new Date().toISOString(),
      avgAqi: Math.round(stations.reduce((sum, s) => sum + s.aqi, 0) / stations.length),
    });
  } catch (err) {
    return Response.json({ error: "Failed to fetch air quality data", message: err.message }, { status: 500 });
  }
}
