"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="bg-surface-hover flex min-h-screen items-center justify-center">
          <div className="w-full max-w-md space-y-8 text-center">
            <div>
              <h2 className="mt-6 text-3xl font-extrabold text-primary">Something went wrong!</h2>
              <p className="text-body mt-2 text-sm">
                An unexpected error occurred. Please try again.
              </p>
            </div>
            <div>
              <button
                onClick={reset}
                className="bg-info hover:bg-info rounded-md px-4 py-2 font-medium text-white transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
