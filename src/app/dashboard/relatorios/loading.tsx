export default function Loading() {
  return (
    <div className="flex-1 p-6 lg:p-8 space-y-5 animate-pulse">
      {/* Report cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="icon-box shrink-0" style={{ background: "var(--border)" }} />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 rounded" style={{ background: "var(--border)" }} />
                <div className="h-3 w-56 rounded" style={{ background: "var(--border)" }} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-28 rounded-lg" style={{ background: "var(--border)" }} />
              <div className="h-8 w-24 rounded-lg" style={{ background: "var(--border)" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Auto-email section */}
      <div className="card p-4 space-y-4">
        <div className="h-4 w-40 rounded" style={{ background: "var(--border)" }} />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-2" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="h-3.5 flex-1 rounded" style={{ background: "var(--border)" }} />
            <div className="h-3.5 w-20 rounded" style={{ background: "var(--border)" }} />
            <div className="h-6 w-10 rounded-full" style={{ background: "var(--border)" }} />
          </div>
        ))}
      </div>

      {/* History */}
      <div className="card p-4 space-y-3">
        <div className="h-4 w-28 rounded" style={{ background: "var(--border)" }} />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="icon-box shrink-0" style={{ background: "var(--border)" }} />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 rounded" style={{ background: "var(--border)", width: `${50 + i * 10}%` }} />
              <div className="h-2.5 w-16 rounded" style={{ background: "var(--border)" }} />
            </div>
            <div className="h-7 w-16 rounded-lg" style={{ background: "var(--border)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
