"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ConfirmPage({
  params,
}: {
  params: { id: string };
}) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

 async function confirmHelp() {
  setSubmitting(true);

  const { error } = await supabase
    .from("requests")
    .update({
      requester_confirmed: true,
      resolved_by_user: true,
      status: "closed",
    })
    .eq("id", params.id);

  if (error) {
    setMessage(error.message);
    setSubmitting(false);
    return;
  }

  setMessage(
    " Request successfully closed. Thank you for confirming that assistance was received."
  );

  setSubmitting(false);
}

async function reportIssue() {
  const { error } = await supabase
    .from("requests")
    .update({
      status: "open",
      assigned_to: null,
      user_confirmation: "rejected",
    })
    .eq("id", params.id);

  if (error) {
    setMessage(error.message);
    return;
  }

  setMessage(
    "Request reopened. Another volunteer can assist you."
  );
}

  return (
    <div className="max-w-xl mx-auto p-10">

      <h1 className="text-3xl font-bold mb-6">
        Confirm Assistance
      </h1>

      <p className="mb-6">
        Did the volunteer successfully help you?
      </p>

      <button
  onClick={confirmHelp}
  disabled={submitting}
  className="bg-green-600 text-white px-6 py-3 rounded-xl disabled:opacity-50"
>
  {submitting
    ? "Confirming..."
    : "Confirm Help Received"}
</button>

<button
  onClick={reportIssue}
  className="ml-3 bg-red-600 text-white px-6 py-3 rounded-xl"
>
  Help Not Received
</button>

      {message && (
        <p className="mt-5">
          {message}
        </p>
      )}

    </div>
  );
}