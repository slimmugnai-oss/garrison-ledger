import Header from "@/app/components/Header";

export const metadata = {
  title: "Portable Careers for Military Spouses | Garrison Ledger",
  description: "The ultimate guide to portable careers for military spouses. Find remote jobs, portable career paths, and expert guidance.",
};

export default function CareerHub() {
  return (
    <>
      <Header />
      <div className="w-full h-screen">
        <iframe 
          src="/career-hub.html"
          className="w-full h-full border-0"
          title="Career Hub - Portable Careers for Military Spouses"
        />
      </div>
    </>
  );
}

