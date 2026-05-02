import Link from "next/link";

export default function Home() {
  return <main className="p-8"><h1 className="text-2xl font-bold">VRF Campaign Orchestrator</h1><Link href="/dashboard" className="underline">Go to dashboard</Link></main>;
}
