"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ApproveVolunteer() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Save the approve URL so we redirect back after login
      const returnUrl = `/approve/${id}`;
      router.replace(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }

    setAuthed(true);
    setAuthChecking(false);
  };

  async function approveVolunteer() {
    setLoading(true);

    const { error } = await supabase
      .from("requests")
      .update({
        user_confirmation: "approved",
        status: "in_progress",
      })
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    const { data: request } = await supabase
      .from("requests")
      .select("requester_email, volunteer_name, volunteer_phone")
      .eq("id", id)
      .single();

    if (request?.requester_email) {
      const confirmUrl = `${window.location.origin}/confirm/${id}`;
      try {
        await fetch("/api/send-confirm-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requester_email: request.requester_email,
            volunteerName: request.volunteer_name,
            volunteerPhone: request.volunteer_phone,
            confirmUrl,
          }),
        });
      } catch (err) {
        console.error("Confirm email failed:", err);
      }
    }

    setMessage("approved");
    setLoading(false);
  }

  async function rejectVolunteer() {
    setLoading(true);

    const { error } = await supabase
      .from("requests")
      .update({
        status: "open",
        assigned_to: null,
        volunteer_name: null,
        volunteer_phone: null,
        volunteer_id: null,
        user_confirmation: "rejected",
        accepted_at: null,
        started_at: null,
        resolved_at: null,
      })
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("rejected");
    setLoading(false);
  }

  if (authChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-lg">Checking authentication...</p>
      </div>
    );
  }

  if (!authed) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md p-10 max-w-lg w-full">

        <h1 className="text-3xl font-bold mb-3">Volunteer Approval</h1>
        <p className="text-gray-600 mb-8">
          A volunteer has offered to help with your request. Would you like to accept?
        </p>

        {!message && (
          <div className="flex gap-4">
            <button
              onClick={approveVolunteer}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50 transition"
            >
              {loading ? "Processing..." : " Approve"}
            </button>
            <button
              onClick={rejectVolunteer}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50 transition"
            >
              {loading ? "Processing..." : " Reject"}
            </button>
          </div>
        )}

        {message === "approved" && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 text-green-800 font-medium">
             Volunteer approved! They will be in touch shortly.
          </div>
        )}

        {message === "rejected" && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-800 font-medium">
             Volunteer rejected. Your request is open again for other volunteers.
          </div>
        )}

        {message !== "approved" && message !== "rejected" && message && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-4 text-yellow-800 font-medium">
            {message}
          </div>
        )}

      </div>
    </div>
  );
}