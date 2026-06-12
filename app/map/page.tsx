"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const EmergencyMap = dynamic(
  () => import("@/components/EmergencyMap"),
  { ssr: false }
);

type RequestItem = {
  id: string;
  category: string;
  description: string;
  latitude?: number;
  longitude?: number;
  urgency?: string;
  status?: string;
  is_sos?: boolean;
  address?: string;
};

type OfferItem = {
  id: string;
  category: string;
  description: string;
  latitude?: number;
  longitude?: number;
  address?: string;
};

export default function MapPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Fetch requests and offers from Supabase
  const fetchRequests = async () => {
    try {
      const { data: reqData, error: reqError } = await supabase
        .from("requests")
        .select("*");

      if (reqError) {
        console.error("Requests Error:", reqError);
      }

      const { data: offerData, error: offerError } = await supabase
        .from("offers")
        .select("*");

      if (offerError) {
        console.error("Offers Error:", offerError);
      }

      setRequests(reqData || []);
      setOffers(offerData || []);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Search filter (only requests for sidebar and map)
  const filteredRequests = requests.filter((req) => {
    const searchText = search.toLowerCase();

    return (
      req.category?.toLowerCase().includes(searchText) ||
      req.description?.toLowerCase().includes(searchText) ||
      req.address?.toLowerCase().includes(searchText)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading Map...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold">
          Emergency Resource Map
        </h1>

        <p className="text-gray-600 mt-2">
          View live emergency requests across locations.
        </p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-gray-500">Total Requests</h3>

          <p className="text-3xl font-bold">
            {requests.length}
          </p>
        </div>

        <div className="bg-red-50 rounded-xl shadow p-4">
          <h3 className="text-red-600">
            SOS Requests
          </h3>

          <p className="text-3xl font-bold">
            {
              requests.filter(
                (r) => r.is_sos
              ).length
            }
          </p>
        </div>

        <div className="bg-green-50 rounded-xl shadow p-4">
          <h3 className="text-green-600">Offers</h3>

          <p className="text-3xl font-bold">
            {offers.length}
          </p>
        </div>

        <div className="bg-blue-50 rounded-xl shadow p-4">
          <h3 className="text-blue-600">
            Active Requests
          </h3>

          <p className="text-3xl font-bold">
            {
              requests.filter(
                (r) => r.status === "open"
              ).length
            }
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-5 rounded-xl shadow mb-8">
        <input
          type="text"
          placeholder="Search requests..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-xl p-3 w-full"
        />
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-8 px-1">
        <div className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 rounded-full bg-red-500"></span>
          <span className="text-sm text-gray-600">Request</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 rounded-full bg-green-500"></span>
          <span className="text-sm text-gray-600">Offer</span>
        </div>
      </div>

      {/* Map and Sidebar */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* MAP */}
        <div className="lg:col-span-2">
          <EmergencyMap
            requests={filteredRequests}
            offers={offers}
          />
        </div>

        {/* SIDEBAR */}
        <div className="bg-white rounded-xl shadow p-5 max-h-[600px] overflow-y-auto">
          <h2 className="font-bold text-xl mb-4">
            Live Requests
          </h2>

          {filteredRequests.length === 0 ? (
            <p>No requests found.</p>
          ) : (
            filteredRequests.map((req) => (
              <div
                key={req.id}
                className="border-b py-4"
              >
                <div className="flex justify-between">
                  <strong className="capitalize">
                    {req.category}
                  </strong>

                  {req.is_sos && (
                    <span className="text-red-600 font-bold">
                      SOS
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-500">
                  {req.address ||
                    "Address not available"}
                </p>

                <p className="text-sm mt-2">
                  {req.description}
                </p>

                <div className="flex gap-2 mt-2 flex-wrap">
                  {req.status && (
                    <span className="inline-block px-2 py-1 rounded bg-gray-100 text-xs capitalize">
                      {req.status}
                    </span>
                  )}

                  {req.urgency && (
                    <span className="inline-block px-2 py-1 rounded bg-yellow-100 text-xs capitalize">
                      {req.urgency}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}