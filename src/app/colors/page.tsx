import Link from 'next/link';

export default function ColorsPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Color Collection</h1>
        <Link
          href="/colors/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
        >
          Add New Color
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* This will be replaced with actual data from Supabase */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-card rounded-lg shadow-sm overflow-hidden border"
          >
            <div className="h-48 bg-gradient-to-r from-primary to-secondary" />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-primary">Sample Color</h3>
              <p className="text-sm text-muted-foreground mt-1">
                A beautiful natural color extracted from...
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Spring 2024
                </span>
                <Link
                  href={`/colors/${i}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View Details →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <nav className="flex items-center gap-2">
          <button className="p-2 rounded-md hover:bg-accent disabled:opacity-50">
            ←
          </button>
          <span className="text-sm text-muted-foreground">Page 1 of 1</span>
          <button className="p-2 rounded-md hover:bg-accent disabled:opacity-50">
            →
          </button>
        </nav>
      </div>
    </div>
  );
} 