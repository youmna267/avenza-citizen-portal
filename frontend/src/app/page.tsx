import Link from 'next/link';
import { SealMark } from '@/components/SealMark';

export default function Home() {
  return (
    <main className="min-h-screen bg-gov-950 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <SealMark size={64} />
        </div>
        <h1 className="font-serif text-3xl text-white mb-2">
          Avenza
        </h1>
        <p className="text-[11px] uppercase tracking-[0.2em] text-gov-300 mb-3">
          e-Governance Platform
        </p>
        <p className="text-gov-600/80 text-sm mb-10">
          File complaints, request official documents, and track every
          submission in one place.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="bg-gov-600 hover:bg-gov-500 text-white font-medium py-3 rounded-md transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="border border-white/30 hover:border-white/60 text-white py-3 rounded-md transition-colors"
          >
            Create an account
          </Link>
        </div>
      </div>
    </main>
  );
}
