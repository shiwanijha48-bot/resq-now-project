// function to convert lat/lng into structured address

export async function getAddressFromCoordinates(
  latitude: number,
  longitude: number
): Promise<{ address: string; city: string; state: string }> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
      {
        headers: {
          "User-Agent": "Emergency-Resource-Platform",
        },
      }
    );

    const data = await response.json();

    if (!data || !data.address) {
      return { address: "", city: "", state: "" };
    }

    const a = data.address;

    // city: try multiple fields Nominatim may use
    const city =
      a.city ||
      a.town ||
      a.village ||
      a.suburb ||
      a.county ||
      "";

    // state
    const state = a.state || "";

    // full human-readable address
    const address = data.display_name || "";

    return { address, city, state };
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return { address: "", city: "", state: "" };
  }
}