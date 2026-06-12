"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function VolunteerPage() {
  const [user, setUser] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVolunteerDashboard();
  }, []);

  async function loadVolunteerDashboard() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
  .from("requests")
  .select("*")
  .eq("assigned_to", user.email)
  .eq("user_confirmation", "approved")
  .order("created_at", { ascending: false });

    if (!error) {
      setRequests(data || []);
    }

    setLoading(false);
  }

  async function startHelp(id: string) {
  const { error } = await supabase
    .from("requests")
    .update({
      status: "in_progress",
      started_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  loadVolunteerDashboard();
}

async function resolveRequest(id: string) {
  const { error } = await supabase
    .from("requests")
    .update({
      status: "resolved",
      resolved_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  alert("Request marked completed.");
  loadVolunteerDashboard();
}

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        Please login first.
      </div>
    );
  }

  const resolvedCount = requests.filter(
  (r) => r.status === "resolved"
).length;

const activeCount = requests.filter(
  (r) =>
    r.status === "accepted" ||
    r.status === "in_progress" ||
    r.status === "resolved"
).length;


  return (
    <div className="max-w-7xl mx-auto px-6 py-10">

      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold">
          Volunteer Dashboard
        </h1>

        <p className="text-gray-600 mt-2">
          {user.email}
        </p>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">

        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-3xl font-bold text-blue-600">
            {activeCount}
          </h2>

          <p className="text-gray-600 mt-2">
            Active Assignments
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-3xl font-bold text-green-600">
            {resolvedCount}
          </h2>

          <p className="text-gray-600 mt-2">
            Resolved Requests
          </p>
        </div>

      </div>

      {/* ASSIGNED REQUESTS */}
      <div className="bg-white rounded-2xl shadow p-6">

        <h2 className="text-2xl font-bold mb-6">
          My Assigned Requests
        </h2>

        {requests.length === 0 ? (
          <p className="text-gray-500">
            No assigned requests yet.
          </p>
        ) : (
          <div className="space-y-4">

            {requests.map((req) => (
              <div
                key={req.id}
                className="border rounded-xl p-5"
              >

                <div className="flex justify-between mb-3">

                  <h3 className="font-bold text-lg capitalize">
                    {req.category}
                  </h3>

                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
  req.status === "accepted"
    ? "bg-blue-100 text-blue-700"
    : req.status === "in_progress"
    ? "bg-yellow-100 text-yellow-700"
    : req.status === "resolved"
    ? "bg-green-100 text-green-700"
    : "bg-red-100 text-red-700"
}`}
                  >
                    {req.status}
                  </span>

                </div>

                <p>
                  <strong>Name:</strong> {req.name}
                </p>

                <p>
                  <strong>Phone:</strong> {req.phone}
                </p>

                <p>
                  <strong>Location:</strong> {req.location}
                </p>

                <p>
                  <strong>Urgency:</strong> {req.urgency}
                </p>

               <div className="mt-3">
  <span
    className={`px-3 py-1 rounded-full text-xs ${
      req.user_confirmation === "approved"
        ? "bg-green-100 text-green-700"
        : req.user_confirmation === "rejected"
        ? "bg-red-100 text-red-700"
        : "bg-yellow-100 text-yellow-700"
    }`}
  >
    User Confirmation: {req.user_confirmation || "pending"}
  </span>
</div>

                <div className="mt-4 border-t pt-3 text-sm text-gray-500">

  <p>
    Created:
    {" "}
    {new Date(req.created_at).toLocaleString()}
  </p>

  {req.accepted_at && (
    <p>
      Accepted:
      {" "}
      {new Date(req.accepted_at).toLocaleString()}
    </p>
  )}

  {req.started_at && (
    <p>
      Started:
      {" "}
      {new Date(req.started_at).toLocaleString()}
    </p>
  )}

  {req.resolved_at && (
    <p>
      Resolved:
      {" "}
      {new Date(req.resolved_at).toLocaleString()}
    </p>
  )}

</div>

               <div className="mt-5 flex gap-3 flex-wrap">

{req.status === "accepted" &&
 req.user_confirmation === "pending" && (
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
    Waiting for requester approval...
  </div>
)}

{req.status === "accepted" &&
 req.user_confirmation === "approved" && (
  <button
    onClick={() => startHelp(req.id)}
    className="bg-yellow-500 text-white px-5 py-2 rounded-xl"
  >
    Start Help
  </button>
)}

  {req.status === "in_progress" && (
  <button
    onClick={() => resolveRequest(req.id)}
    className="bg-green-600 text-white px-5 py-2 rounded-xl"
  >
    Mark Completed
  </button>
)}

{req.user_confirmation === "approved" && (
  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
    User Approved
  </span>
)}

</div>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}