"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Request = {
  id: string;
  category: string;

  description?: string;

  status?: string;
  urgency?: string;
  is_sos?: boolean;
  created_at?: string;

  address?: string;
  location?: string;
  city?: string;
  state?: string;

  blood_group?: string;
  units_required?: string;
  hospital_name?: string;

  food_type?: string;
  quantity?: string;

  medicine_type?: string;
  medicine_name?: string;

  people_count?: string;
  women_count?: string;
  children_count?: string;

  pickup_location?: string;
  destination?: string;
  vehicle_needed?: string;
};

export default function MyRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) { setLoading(false); return; }

      const { data, error } = await supabase
        .from("requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error(error);
      alert("Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this request?")) return;

    try {
      setDeletingId(id);
      const { error } = await supabase.from("requests").delete().eq("id", id);
      if (error) throw error;
      setRequests((prev) => prev.filter((req) => req.id !== id));
      alert("Request deleted successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to delete request.");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "open":       return "bg-green-100 text-green-700";
      case "accepted":   return "bg-blue-100 text-blue-700";
      case "in_progress":return "bg-yellow-100 text-yellow-700";
      case "closed":     return "bg-gray-200 text-gray-700";
      default:           return "bg-gray-100 text-gray-700";
    }
  };

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case "high":   return "bg-red-100 text-red-700";
      case "medium": return "bg-yellow-100 text-yellow-700";
      case "low":    return "bg-blue-100 text-blue-700";
      default:       return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        Loading your requests...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold">My Requests</h1>
        <p className="text-gray-600 mt-2">
          Track and manage the emergency requests you have created.
        </p>
      </div>

      {/* Empty State */}
      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-10 text-center">
          <div className="text-5xl mb-4"></div>
          <h2 className="text-2xl font-semibold">No Requests Found</h2>
          <p className="text-gray-500 mt-2">
            You haven't created any emergency requests yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-5">
          {requests.map((req) => {
            //  FIX: support both `address` (blood form) and `location` (other forms)
            const displayAddress = req.address || req.location || null;

            return (
              <div
                key={req.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-6"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">

                  {/* Left: info */}
                  <div className="flex-1 min-w-0">
                    {/* Category + SOS */}
                    <div className="flex flex-wrap gap-2 items-center mb-2">
                      <h2 className="text-2xl font-bold capitalize">{req.category}</h2>
                      {req.is_sos && (
                        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                           SOS
                        </span>
                      )}
                    </div>

                    {/*  Location */}
                    {(displayAddress || req.city) && (
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-semibold text-gray-800"> Location: </span>
                        {displayAddress && <span>{displayAddress}</span>}
                        {req.city && (
                          <span className="text-gray-500">
                            {displayAddress ? " — " : ""}{req.city}
                            {req.state ? `, ${req.state}` : ""}
                          </span>
                        )}
                      </div>
                    )}

{req.category === "medicine" && (
  <div className="text-sm text-gray-600 mt-2 space-y-1">
    {req.medicine_type && (
      <p>Medicine Type: {req.medicine_type}</p>
    )}

    {req.medicine_name && (
      <p>Medicine Name:{req.medicine_name}</p>
    )}
  </div>
)}

{req.category === "shelter" && (
  <div className="text-sm text-gray-600 mt-2 space-y-1">
    {req.people_count && (
      <p>Total People: {req.people_count}</p>
    )}

    {req.women_count && (
      <p>Women: {req.women_count}</p>
    )}

    {req.children_count && (
      <p>Children:{req.children_count}</p>
    )}
  </div>
)}

{req.category === "transport" && (
  <div className="text-sm text-gray-600 mt-2 space-y-1">
    {req.pickup_location && (
      <p>Pickup: {req.pickup_location}</p>
    )}

    {req.destination && (
      <p>Destination: {req.destination}</p>
    )}

    {req.vehicle_needed && (
      <p>Vehicle: {req.vehicle_needed}</p>
    )}
  </div>
)}

                    {/* Description */}
                    <p className="text-gray-600 mt-1 whitespace-pre-line text-sm leading-relaxed">
                      {req.description}
                    </p>

                    {req.created_at && (
                      <p className="text-xs text-gray-400 mt-3">
                        Created: {new Date(req.created_at).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* Right: badges + delete */}
                  <div className="flex flex-col gap-3 items-start md:items-end shrink-0">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(req.status)}`}
                    >
                      {req.status || "unknown"}
                    </span>

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getUrgencyColor(req.urgency)}`}
                    >
                      {req.urgency || "normal"}
                    </span>

                    <button
                      onClick={() => handleDelete(req.id)}
                      disabled={deletingId === req.id}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm disabled:opacity-50 transition"
                    >
                      {deletingId === req.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}