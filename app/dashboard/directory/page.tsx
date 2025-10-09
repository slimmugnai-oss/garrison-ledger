import { SignedIn, SignedOut, SignIn } from "@clerk/nextjs";
import PremiumGate from "@/app/components/premium/PremiumGate";
import Header from "@/app/components/Header";

export default function DirectoryPage(){
  return (
    <>
      <Header />
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Vetted Pros Directory</h1>
        <p className="text-gray-600">Agents, lenders, and property managers familiar with military families.</p>

        <SignedOut>
          <div className="rounded border bg-white p-6 shadow-sm">
            <p className="mb-4">Please sign in to view the directory.</p>
            <SignIn />
          </div>
        </SignedOut>

        <SignedIn>
          <PremiumGate
            placeholder={<div><div className="font-semibold mb-1">Premium directory</div><p className="text-sm text-gray-600">Unlock access to vetted providers and search by location.</p></div>}
          >
            <div className="rounded border bg-white shadow-sm">
              {/* Replace src with your Softr/Airtable published page */}
              <iframe src="https://your-softr-or-airtable-embed-url" className="w-full h-[70vh] rounded" title="Directory" />
            </div>
          </PremiumGate>
        </SignedIn>
      </div>
    </>
  );
}

