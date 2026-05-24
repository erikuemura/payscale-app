export default function Loading() {
  return (
    <div className="flex-1 p-6 lg:p-8 space-y-5 animate-pulse">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-4 space-y-2.5">
            <div className="h-3 w-24 rounded" style={{ background: "var(--border)" }} />
            <div className="h-6 w-16 rounded" style={{ background: "var(--border)" }} />
          </div>
        ))}
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-wrap gap-3">
        <div className="h-9 w-60 rounded-lg" style={{ background: "var(--border)" }} />
        <div className="h-9 w-32 rounded-lg" style={{ background: "var(--border)" }} />
      </div>

      {/* Cards list */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-4 flex items-start gap-4">
            <div className="icon-box shrink-0" style={{ background: "var(--border)" }} />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-3.5 w-24 rounded" style={{ background: "var(--border)" }} />
                <div className="h-5 w-16 rounded-full" style={{ background: "var(--border)" }} />
              </div>
              <div className="h-3 w-64 rounded" style={{ background: "var(--border)" }} />
              <div className="flex gap-4">
                <div className="h-3 w-20 rounded" style={{ background: "var(--border)" }} />
                <div className="h-3 w-28 rounded" style={{ background: "var(--border)" }} />
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <div className="h-8 w-20 rounded-lg" style={{ background: "var(--border)" }} />
              <div className="h-8 w-20 rounded-lg" style={{ background: "var(--border)" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
