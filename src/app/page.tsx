import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative isolate">
      <div className="mx-auto max-w-4xl py-12 sm:py-16 lg:py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-6xl">
            Discover and Share Natural Colors
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Join our community of natural color enthusiasts. Document and explore
            colors from nature, share your discoveries, and learn about traditional
            pigment-making processes.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/colors"
              className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Explore Colors
            </Link>
            <Link
              href="/about"
              className="text-sm font-semibold leading-6 text-primary"
            >
              Learn More <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 text-center lg:grid-cols-3">
            <div className="flex flex-col items-center">
              <div className="rounded-lg bg-primary/5 p-4">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                  />
                </svg>
              </div>
              <h3 className="mt-6 text-base font-semibold leading-7 text-primary">
                Location-Based
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Discover colors from specific locations and track their geographic
                origins.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="rounded-lg bg-primary/5 p-4">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
                  />
                </svg>
              </div>
              <h3 className="mt-6 text-base font-semibold leading-7 text-primary">
                Natural Sources
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Learn about natural materials and traditional processes for creating
                colors.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="rounded-lg bg-primary/5 p-4">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                  />
                </svg>
              </div>
              <h3 className="mt-6 text-base font-semibold leading-7 text-primary">
                Community-Driven
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Share your discoveries and learn from other color enthusiasts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
