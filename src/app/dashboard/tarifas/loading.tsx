export default function Loading() {
  return (
    <div className="flex-1 p-6 lg:p-8 space-y-5 animate-pulse">
      {/* Alert cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="icon-box" style={{ background: "var(--border)" }} />
              <div className="h-3 w-24 rounded" style={{ background: "var(--border)" }} />
            </div>
            <div className="h-7 w-20 rounded" style={{ background: "var(--border)" }} />
            <div className="h-3 w-32 rounded" style={{ background: "var(--border)" }} />
          </div>
        ))}
      </div>

      {/* MDR table */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="h-4 w-40 rounded" style={{ background: "var(--border)" }} />
          <div className="h-8 w-28 rounded-lg" style={{ background: "var(--border)" }} />
        </div>

        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="h-3.5 w-32 rounded" style={{ background: "var(--border)" }} />
            <div className="h-3.5 w-20 rounded" style={{ background: "var(--border)" }} />
            <div className="h-3.5 w-20 rounded" style={{ background: "var(--border)" }} />
            <div className="h-3.5 w-16 rounded ml-auto" style={{ background: "var(--border)" }} />
            <div className="h-5 w-14 rounded-full" style={{ background: "var(--border)" }} />
          </div>
        ))}
      </div>

      {/* History */}
      <div className="card p-4 space-y-3">
        <div className="h-4 w-36 rounded" style={{ background: "var(--border)" }} />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg" style={{ background: "var(--border)" }} />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 rounded" style={{ background: "var(--border)", width: `${55 + i * 12}%` }} />
              <div className="h-2.5 w-20 rounded" style={{ background: "var(--border)" }} />
            </div>
            <div className="h-3 w-14 rounded" style={{ background: "var(--border)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
