import { SignedIn, SignedOut } from '@clerk/nextjs';
import HouseHack from '@/app/components/tools/HouseHack';
import Header from '@/app/components/Header';

export default function Page() {
  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">House Hacking Calculator</h1>
        <p className="text-gray-600">VA loan screen to estimate cash flow potential.</p>
        
        <SignedOut>
          <div className="rounded border bg-white p-6 shadow-sm">
            <p className="mb-4">Please sign in to use this tool.</p>
          </div>
        </SignedOut>
        
        <SignedIn>
          <HouseHack />
        </SignedIn>
      </div>
    </>
  );
}
