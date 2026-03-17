// /api/chargers - Fetches EV charging stations in Hungary from OpenChargeMap

export async function GET() {
  const apiKey = process.env.OCM_API_KEY;

  if (!apiKey) {
    return Response.json({ error: "OCM_API_KEY not configured" }, { status: 500 });
  }

  try {
    // OpenChargeMap POI API - Hungary, operational stations
    const url = `https://api.openchargemap.io/v3/poi/?output=json&countrycode=HU&maxresults=1000&statusTypeID=50&compact=true&key=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 3600 } }); // cache 1 hour
    const data = await res.json();

    // Transform to clean format
    const chargers = data.map((c) => ({
      id: c.ID,
      name: c.AddressInfo?.Title || "Unknown",
      lat: c.AddressInfo?.Latitude,
      lng: c.AddressInfo?.Longitude,
      town: c.AddressInfo?.Town,
      operator: c.OperatorInfo?.Title || null,
      numPoints: c.NumberOfPoints || 1,
      powerKW: c.Connections?.[0]?.PowerKW || null,
    })).filter(c => c.lat && c.lng);

    // Aggregate by county/region for the map
    const counties = {};
    chargers.forEach(c => {
      const key = c.town || "Unknown";
      if (!counties[key]) counties[key] = { town: key, count: 0, totalPower: 0 };
      counties[key].count += c.numPoints;
      counties[key].totalPower += (c.powerKW || 0) * (c.numPoints || 1);
    });

    return Response.json({
      chargers,
      totalStations: chargers.length,
      totalPoints: chargers.reduce((sum, c) => sum + (c.numPoints || 1), 0),
      byTown: Object.values(counties).sort((a, b) => b.count - a.count).slice(0, 30),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return Response.json({ error: "Failed to fetch charger data", message: err.message }, { status: 500 });
  }
}
