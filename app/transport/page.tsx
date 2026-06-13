import Link from "next/link";

export default function TransportPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      <div className="bg-white rounded-2xl shadow-md p-10 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🚗</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Emergency Transport</h1>
        <p className="text-gray-500 mb-8">
          Need emergency transport — ambulance, wheelchair transport, or evacuation help?
          Submit a request and our volunteers will coordinate with you immediately.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/request">
            <button
              onClick={() => {
                // Pre-select transport on the request page via query param if needed
              }}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-xl transition"
            >
              Request Transport Help
            </button>
          </Link>
          <Link href="/requests?category=transport">
            <button className="w-full bg-white border-2 border-gray-200 hover:border-yellow-300 text-gray-800 font-bold py-3 rounded-xl transition">
              See Open Transport Requests
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}