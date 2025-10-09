import { SignedIn, SignedOut } from '@clerk/nextjs';
import TspModeler from '@/app/components/tools/TspModeler';
import Header from '@/app/components/Header';

export default function Page() {
  return (
    <>
      <Header />
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">TSP Allocation Modeler</h1>
        <p className="text-gray-600">See how allocation impacts long-term growth.</p>

        <SignedOut>
          <div className="rounded border bg-white p-6 shadow-sm">
            <p className="mb-4">Please sign in to use this tool.</p>
          </div>
        </SignedOut>

        <SignedIn>
          <TspModeler />
        </SignedIn>
      </div>
    </>
  );
}
