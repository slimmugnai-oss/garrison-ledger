'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-surface-hover">
          <div className="max-w-md w-full space-y-8 text-center">
            <div>
              <h2 className="mt-6 text-3xl font-extrabold text-primary">
                Something went wrong!
              </h2>
              <p className="mt-2 text-sm text-body">
                An unexpected error occurred. Please try again.
              </p>
            </div>
            <div>
              <button
                onClick={reset}
                className="bg-info hover:bg-info text-white px-4 py-2 rounded-md font-medium transition-colors"
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
