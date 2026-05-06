import Link from "next/link";
export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center space-y-6">
      <h1 className="text-4xl font-bold text-slate-900">VRF Campaign Orchestrator</h1>
      <div className="flex space-x-4">
        <Link href="/dashboard" className="px-6 py-3 bg-white shadow rounded-lg hover:shadow-md transition text-slate-700 font-medium">
          Go to Dashboard
        </Link>
        <Link href="/mvp" className="px-6 py-3 bg-indigo-600 shadow-lg shadow-indigo-200 rounded-lg text-white hover:bg-indigo-700 transition font-medium">
          View MVP App
        </Link>
      </div>
    </main>
  );
}
