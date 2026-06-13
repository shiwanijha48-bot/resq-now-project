"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { getAddressFromCoordinates } from "@/lib/geocode";

export default function TransportForm() {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [pickupMode, setPickupMode] = useState<"manual" | "gps" | "">("");
  const [loading, setLoading] = useState(false);
  const [isSOS, setIsSOS] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    pickup_location: "",
    destination: "",
    vehicle_needed: "",
    urgency: "high",
    description: "",
    address: "",
    city: "",
    state: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);

        try {
          const addressData = await getAddressFromCoordinates(lat, lng);
          setForm((prev) => ({
            ...prev,
            pickup_location: addressData.address || prev.pickup_location,
            address: addressData.address || "",
            city: addressData.city || "",
            state: addressData.state || "",
          }));
          alert("Location captured successfully!");
        } catch (err) {
          console.error("Address fetch failed:", err);
          alert("Location captured (address lookup failed).");
        }
      },
      (error) => {
        alert(
          "Location failed. Error code: " + error.code +
          "\n1 = permission denied\n2 = position unavailable\n3 = timeout"
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (pickupMode === "gps" && (latitude === null || longitude === null)) {
        alert("Please capture GPS location first");
        setLoading(false);
        return;
      }

      if (pickupMode === "manual" && !form.pickup_location.trim()) {
        alert("Please enter pickup location");
        setLoading(false);
        return;
      }

      // ── RATE LIMITING: same phone + same category, last 10 minutes ──
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const { data: recentRequests } = await supabase
        .from("requests")
        .select("id")
        .eq("phone", form.phone)
        .eq("category", "transport")
        .gte("created_at", tenMinutesAgo);

      if (recentRequests && recentRequests.length > 0) {
        alert(
          "You have already submitted a transport request in the last 10 minutes. " +
          "Please wait before submitting again, or contact us if this is a new emergency."
        );
        setLoading(false);
        return;
      }

      const { data: userData } = await supabase.auth.getUser();

      const description = `Vehicle Needed: ${form.vehicle_needed}
Pickup: ${form.pickup_location}
Destination: ${form.destination}

${form.description}`;

      const { data: inserted, error } = await supabase
        .from("requests")
        .insert([
          {
            category: "transport",
            name: form.name,
            phone: form.phone,
            pickup_location: form.pickup_location,
            destination: form.destination,
            vehicle_needed: form.vehicle_needed,
            urgency: form.urgency,
            latitude: pickupMode === "gps" ? latitude : null,
            longitude: pickupMode === "gps" ? longitude : null,
            address: pickupMode === "gps" ? form.address : form.pickup_location,
            city: pickupMode === "gps" ? form.city : null,
            state: pickupMode === "gps" ? form.state : null,
            is_sos: isSOS,
            status: "open",
            assigned_to: null,
            user_id: userData.user?.id || null,
            requester_email: userData.user?.email || null,
            description,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // ── SOS BLAST: email all volunteers immediately ──
      if (isSOS && inserted) {
        try {
          await fetch("/api/sos-blast", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              requestId: inserted.id,
              category: "transport",
              location: form.pickup_location || form.city,
              description,
              urgency: form.urgency,
            }),
          });
        } catch (err) {
          console.error("SOS blast failed (non-blocking):", err);
        }
      }

      alert(
        isSOS
          ? " SOS Transport Request submitted! All registered volunteers have been notified by email."
          : " Transport Request submitted successfully!"
      );

      setForm({
        name: "",
        phone: "",
        pickup_location: "",
        destination: "",
        vehicle_needed: "",
        urgency: "high",
        description: "",
        address: "",
        city: "",
        state: "",
      });
      setLatitude(null);
      setLongitude(null);
      setPickupMode("");
      setIsSOS(false);
    } catch (error: any) {
      console.error("FULL ERROR:", error);
      alert(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow space-y-4">
      <h1 className="text-4xl font-bold mb-6"> Transport Request</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Full Name"
          required
          className="w-full border p-3 rounded"
        />

        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone Number"
          required
          className="w-full border p-3 rounded"
        />

        {/* Pickup Method */}
        <div className="space-y-2">
          <select
            value={pickupMode}
            onChange={(e) => {
              const value = e.target.value as "manual" | "gps" | "";
              setPickupMode(value);
              if (value === "gps") {
                setForm((prev) => ({ ...prev, pickup_location: "" }));
              }
            }}
            className="w-full border p-3 rounded-xl"
          >
            <option value="">Select Pickup Method</option>
            <option value="manual">Enter Location Manually</option>
            <option value="gps"> Use GPS Location</option>
          </select>

          {pickupMode === "manual" && (
            <input
              name="pickup_location"
              value={form.pickup_location}
              onChange={handleChange}
              placeholder="Enter pickup location"
              className="w-full border p-3 rounded"
              required
            />
          )}

          {pickupMode === "gps" && (
            <div>
              <button
                type="button"
                onClick={getCurrentLocation}
                className="w-full bg-yellow-500 text-white p-3 rounded-xl"
              >
                 Capture GPS Location
              </button>

              {latitude && longitude && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                  <p className="text-green-700 text-sm font-semibold"> Location captured</p>
                  {form.city && (
                    <p className="text-green-600 text-xs mt-1">{form.address}, {form.city}, {form.state}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <input
          name="destination"
          value={form.destination}
          onChange={handleChange}
          placeholder="Destination"
          required
          className="w-full border p-3 rounded"
        />

        <select
          name="vehicle_needed"
          value={form.vehicle_needed}
          onChange={handleChange}
          required
          className="w-full border p-3 rounded"
        >
          <option value="">Vehicle Needed</option>
          <option value="Bike">Bike</option>
          <option value="Car">Car</option>
          <option value="Ambulance">Ambulance</option>
          <option value="Van">Van</option>
          <option value="Truck">Truck</option>
        </select>

        <select
          name="urgency"
          value={form.urgency}
          onChange={handleChange}
          className="w-full border p-3 rounded-xl"
        >
          <option value="">Urgency Level</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe transport need"
          rows={4}
          className="w-full border p-3 rounded"
        />

        {/* SOS Toggle */}
        <div className={`rounded-xl p-4 border-2 transition ${isSOS ? "border-red-500 bg-red-50" : "border-gray-200 bg-gray-50"}`}>
          <label className="flex gap-3 items-start cursor-pointer">
            <input
              type="checkbox"
              checked={isSOS}
              onChange={(e) => setIsSOS(e.target.checked)}
              className="mt-1 w-4 h-4 accent-red-600"
            />
            <div>
              <span className="font-bold text-gray-900"> Mark as SOS Emergency</span>
              <p className="text-sm text-gray-500 mt-1">
                This will immediately email <strong>all registered volunteers</strong> about your request.
                Only use for life-threatening situations.
              </p>
            </div>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-xl font-bold text-white disabled:opacity-50 transition ${
            isSOS ? "bg-red-600 hover:bg-red-700" : "bg-yellow-500 hover:bg-yellow-600"
          }`}
        >
          {loading
            ? "Submitting..."
            : isSOS
            ? " Send SOS Transport Request"
            : "Submit Transport Request"}
        </button>
      </form>
    </div>
  );
}