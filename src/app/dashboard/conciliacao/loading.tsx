export default function Loading() {
  return (
    <div className="flex-1 p-6 lg:p-8 space-y-5 animate-pulse">
      {/* Header + filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="h-9 w-56 rounded-lg" style={{ background: "var(--border)" }} />
        <div className="h-9 w-36 rounded-lg" style={{ background: "var(--border)" }} />
        <div className="ml-auto h-9 w-28 rounded-lg" style={{ background: "var(--border)" }} />
      </div>

      {/* Table skeleton */}
      <div className="card overflow-hidden">
        {/* Table header */}
        <div className="flex items-center gap-4 px-4 py-3" style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
          {[120, 80, 100, 80, 90, 70].map((w, i) => (
            <div key={i} className="h-3 rounded" style={{ background: "var(--border)", width: w }} />
          ))}
        </div>

        {/* Table rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="h-3.5 w-28 rounded" style={{ background: "var(--border)" }} />
            <div className="h-3.5 w-20 rounded" style={{ background: "var(--border)" }} />
            <div className="h-3.5 w-24 rounded" style={{ background: "var(--border)" }} />
            <div className="h-3.5 w-20 rounded" style={{ background: "var(--border)" }} />
            <div className="h-5 w-22 rounded-full" style={{ background: "var(--border)" }} />
            <div className="h-3.5 w-16 rounded ml-auto" style={{ background: "var(--border)" }} />
          </div>
        ))}

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="h-3 w-32 rounded" style={{ background: "var(--border)" }} />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 w-8 rounded-lg" style={{ background: "var(--border)" }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
