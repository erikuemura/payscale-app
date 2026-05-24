export default function Loading() {
  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 animate-pulse">
      {/* KPI cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 rounded" style={{ background: "var(--border)" }} />
              <div className="icon-box" style={{ background: "var(--border)" }} />
            </div>
            <div className="h-6 w-28 rounded" style={{ background: "var(--border)" }} />
            <div className="h-3 w-16 rounded" style={{ background: "var(--border)" }} />
          </div>
        ))}
      </div>

      {/* Two column row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="card p-4 space-y-4">
            <div className="h-4 w-32 rounded" style={{ background: "var(--border)" }} />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg shrink-0" style={{ background: "var(--border)" }} />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 rounded" style={{ background: "var(--border)", width: `${60 + j * 10}%` }} />
                    <div className="h-2.5 w-16 rounded" style={{ background: "var(--border)" }} />
                  </div>
                  <div className="h-3 w-12 rounded" style={{ background: "var(--border)" }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Wide card */}
      <div className="card p-4 space-y-4">
        <div className="h-4 w-40 rounded" style={{ background: "var(--border)" }} />
        <div className="space-y-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-3 flex-1 rounded" style={{ background: "var(--border)" }} />
              <div className="h-3 w-20 rounded" style={{ background: "var(--border)" }} />
              <div className="h-3 w-16 rounded" style={{ background: "var(--border)" }} />
              <div className="h-5 w-14 rounded-full" style={{ background: "var(--border)" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
