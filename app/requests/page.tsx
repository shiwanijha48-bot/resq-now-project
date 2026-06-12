"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type RequestItem = {
  id: string;
  name: string;
  phone: string;
  category: string;
  city?: string;
  state?: string;
  location?: string;
  address?: string;
  urgency: string;
  description: string;
  status: string;
  assigned_to: string | null;
  created_at: string;
  is_sos?: boolean;
  requester_email?: string;
  volunteer_name?: string;
  volunteer_phone?: string;
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [sortByTime, setSortByTime] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchRequests();
    fetchOffers();

    const requestsChannel = supabase
      .channel("requests-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "requests" }, () => {
        fetchRequests();
      })
      .subscribe();

    const offersChannel = supabase
      .channel("offers-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "resource_offers" }, () => {
        fetchOffers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(requestsChannel);
      supabase.removeChannel(offersChannel);
    };
  }, []);

  const fetchOffers = async () => {
    const { data } = await supabase.from("resource_offers").select("*");
    setOffers(data || []);
  };

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("requests")
      .select("*")
      .order("is_sos", { ascending: false })
      .order("created_at", { ascending: false });

    if (!error) setRequests(data || []);
    setLoading(false);
  };

  const handleHelp = async (req: RequestItem) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.email) {
      alert("Please login first.");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const volunteerName = profile?.full_name || "Volunteer";
    const volunteerPhone = profile?.phone || "";

    const { error } = await supabase
      .from("requests")
      .update({
        status: "accepted",
        assigned_to: user.email,
        volunteer_id: user.id,
        volunteer_name: volunteerName,
        volunteer_phone: volunteerPhone,
        accepted_at: new Date().toISOString(),
        user_confirmation: "pending",
      })
      .eq("id", req.id);

    if (error) { alert(error.message); return; }

    try {
      await fetch("/api/send-volunteer-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requester_email: req.requester_email,
          volunteerName,
          volunteerPhone,
          requestId: req.id,
        }),
      });
    } catch (err) {
      console.error(err);
    }

    alert("Request accepted and approval email sent.");
    fetchRequests();
  };

  const cities = [...new Set(requests.map((r: any) => r.city).filter(Boolean))];

  const filteredRequests = requests
    .filter((request: any) => {
      const categoryMatch = filter === "all" || request.category === filter;
      const cityMatch = cityFilter === "all" || request.city === cityFilter;
      const urgencyMatch = urgencyFilter === "all" || request.urgency === urgencyFilter;
      const search = searchTerm.toLowerCase();
      const searchMatch =
        search === "" ||
        request.description?.toLowerCase().includes(search) ||
        request.category?.toLowerCase().includes(search) ||
        request.name?.toLowerCase().includes(search) ||
        request.city?.toLowerCase().includes(search);

      return categoryMatch && cityMatch && urgencyMatch && searchMatch;
    })
    .sort((a, b) =>
      sortByTime === "newest"
        ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <h1 className="text-2xl font-bold">Loading Requests...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold"> Emergency Requests</h1>
          <p className="text-gray-600 mt-2">Help people in need by accepting requests.</p>
        </div>

        {/* CATEGORY FILTERS */}
        <div className="flex flex-wrap gap-3 mb-6">
          {["all", "blood", "food", "medicine", "transport", "shelter"].map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`px-4 py-2 rounded-xl capitalize font-medium transition ${
                filter === item
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-700 hover:border-gray-400"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* SECONDARY FILTERS */}
        <div className="flex flex-wrap gap-3 items-center mb-8">
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-300"
          >
            <option value="all">All Cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>

          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-300"
          >
            <option value="all">All Urgency</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={sortByTime}
            onChange={(e) => setSortByTime(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-300"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>

          <input
            type="text"
            placeholder="Search by name, category, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2 bg-white text-gray-700 flex-1 min-w-[220px] focus:outline-none focus:ring-2 focus:ring-red-300"
          />
        </div>

        {/* REQUESTS GRID */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl text-center shadow text-gray-500">
            No requests found.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredRequests.map((req) => {
              const matchingOffers = offers.filter(
                (offer) =>
                  offer.category === req.category &&
                  offer.city === req.city &&
                  offer.availability === "available"
              );

              //  FIX: support both `address` (blood form) and `location` (other forms)
              const displayAddress = req.address || req.location || null;

              return (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition flex flex-col"
                >
                  {/* SOS Badge */}
                  {req.is_sos && (
                    <div className="mb-3">
                      <span className="inline-block bg-red-600 text-white px-3 py-1 rounded-full animate-pulse text-xs font-semibold tracking-wide uppercase">
                         SOS Emergency
                      </span>
                    </div>
                  )}

                  {/* Card Header */}
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-lg uppercase tracking-wide text-gray-800">
                      {req.category}
                    </h2>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        req.urgency === "high"
                          ? "bg-red-100 text-red-700"
                          : req.urgency === "medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {req.urgency}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 text-sm text-gray-700 mb-4">
                    <p><span className="font-semibold text-gray-900">Name:</span> {req.name}</p>
                    <p><span className="font-semibold text-gray-900">Phone:</span> {req.phone}</p>

                    {/*  FIX: shows address + city + state properly */}
                    <div>
                      <span className="font-semibold text-gray-900">Location:</span>{" "}
                      {displayAddress ? (
                        <span className="text-gray-700">{displayAddress}</span>
                      ) : (
                        <span className="text-gray-400 italic">Not provided</span>
                      )}
                      {req.city && (
                        <span className="block text-gray-500 text-xs mt-0.5">
                          {req.city}{req.state ? `, ${req.state}` : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-1">
                    {req.description}
                  </p>

                  {/* Status row */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        req.status === "open"
                          ? "bg-red-100 text-red-700"
                          : req.status === "accepted"
                          ? "bg-blue-100 text-blue-700"
                          : req.status === "in_progress"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {req.status}
                    </span>
                    {req.assigned_to && (
                      <span className="text-xs text-gray-400 truncate max-w-[180px]">
                        Assigned: {req.assigned_to}
                      </span>
                    )}
                  </div>

                  {/* Matching Offers */}
                  {matchingOffers.length > 0 && (
                    <div className="border-t border-gray-100 pt-4 mb-4">
                      <h3 className="text-sm font-semibold text-green-700 mb-2">
                         Matching Resources
                      </h3>
                      <div className="space-y-2">
                        {matchingOffers.slice(0, 3).map((offer) => (
                          <div key={offer.id} className="bg-green-50 rounded-lg px-3 py-2">
                            <p className="text-sm font-medium text-gray-800">{offer.name}</p>
                            <p className="text-xs text-gray-500">{offer.phone} · {offer.city}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA Button */}
                  <button
                    onClick={() => handleHelp(req)}
                    disabled={req.status !== "open"}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition ${
                      req.status === "open"
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {req.status === "open" ? " I Can Help" : "Already Assigned"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}