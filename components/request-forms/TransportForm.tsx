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
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };


  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
  console.log("SUCCESS:", position);

  const lat = position.coords.latitude;
  const lng = position.coords.longitude;

  setLatitude(lat);
  setLongitude(lng);

  try {
    const addressData =
      await getAddressFromCoordinates(lat, lng);

    setForm((prev) => ({
      ...prev,
      pickup_location:
        addressData.address || prev.pickup_location,

      address: addressData.address || "",
      city: addressData.city || "",
      state: addressData.state || "",
    }));

    console.log("Address:", addressData);
  } catch (err) {
    console.error("Address fetch failed:", err);
  }

  alert(
    "Location captured!\n" +
    "Lat: " + lat +
    "\nLng: " + lng
  );
},
      (error) => {
        console.log("ERROR:", error);

        alert(
          "Location failed. Error code: " + error.code +
          "\n1 = permission denied\n2 = position unavailable\n3 = timeout"
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      if (
  pickupMode === "gps" &&
  (latitude === null || longitude === null)
) {
  alert("Please capture GPS location first");
  return;
}

if (
  pickupMode === "manual" &&
  !form.pickup_location.trim()
) {
  alert("Please enter pickup location");
  return;
}

      const { data: userData } = await supabase.auth.getUser();

      const { error } = await supabase.from("requests").insert([
        {
  ...form,
  category: "transport",

  latitude:
    pickupMode === "gps"
      ? latitude
      : null,

  longitude:
    pickupMode === "gps"
      ? longitude
      : null,

  address:
    pickupMode === "gps"
      ? form.address
      : form.pickup_location,

  city:
    pickupMode === "gps"
      ? form.city
      : null,

  state:
    pickupMode === "gps"
      ? form.state
      : null,
          is_sos: isSOS,
          status: "open",
          assigned_to: null,
          user_id:
  userData.user?.id ||
  null,

requester_email:
  userData.user?.email ||
  null,
        },
      ]);

      if (error) {
        throw error;
      }

      alert("Transport Request Submitted Successfully");

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

      setIsSOS(false);
    } catch (error: any) {
  console.error("FULL ERROR:", error);

  alert(
    JSON.stringify(error, null, 2)
  );
} finally {
      setLoading(false);
    }
  };




  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-2xl shadow space-y-4"
    >
      <h2 className="text-2xl font-bold">
        Transport Request
      </h2>

      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Full Name"
        required
        className="w-full border p-3 rounded-xl"
      />

      <input
        name="phone"
        value={form.phone}
        onChange={handleChange}
        placeholder="Phone Number"
        required
        className="w-full border p-3 rounded-xl"
      />



      <div className="space-y-2">
        <select
  value={pickupMode}
  onChange={(e) => {
    const value = e.target.value as "manual" | "gps" | "";

    setPickupMode(value);

    if (value === "gps") {
      setForm((prev) => ({
        ...prev,
        pickup_location: "",
      }));
    }
  }}
  className="w-full border p-3 rounded-xl"
>
          <option value="">Select Pickup Method</option>
          <option value="manual">Entry Location</option>
          <option value="gps"> GPS Location</option>
        </select>



        {pickupMode === "manual" && (
          <input
            name="pickup_location"
            value={form.pickup_location}
            onChange={handleChange}
            placeholder="Enter pickup location"
            className="w-full border p-3 rounded-xl"
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
               GPS
            </button>

            {latitude && longitude && (
              <p className="text-green-600 text-sm">
                 Location captured successfully
              </p>
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
        className="w-full border p-3 rounded-xl"
      />

      <select
        name="vehicle_needed"
        value={form.vehicle_needed}
        onChange={handleChange}
        required
        className="w-full border p-3 rounded-xl"
      >
        <option value="">
          Vehicle Needed
        </option>
        <option value="Bike">
          Bike
        </option>
        <option value="Car">
          Car
        </option>
        <option value="Ambulance">
          Ambulance
        </option>
        <option value="Van">
          Van
        </option>
        <option value="Truck">
          Truck
        </option>
      </select>



      <select
        name="urgency"
        onChange={handleChange}
        className="w-full border p-3 rounded-xl"
      >
        <option value="">Urgency</option>
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
        className="w-full border p-3 rounded-xl"
      />

      <label className="flex gap-2 items-center">
        <input
          type="checkbox"
          checked={isSOS}
          onChange={(e) =>
            setIsSOS(e.target.checked)
          }
        />
        SOS Emergency
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-xl disabled:opacity-50"
      >
        {loading
          ? "Submitting..."
          : "Submit Transport Request"}
      </button>
    </form>
  );
}