export default function Loading() {
  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 animate-pulse">
      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-24 rounded-lg" style={{ background: "var(--border)" }} />
        ))}
      </div>

      {/* Profile form card */}
      <div className="card p-6 space-y-5 max-w-2xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl" style={{ background: "var(--border)" }} />
          <div className="space-y-2">
            <div className="h-4 w-32 rounded" style={{ background: "var(--border)" }} />
            <div className="h-3 w-48 rounded" style={{ background: "var(--border)" }} />
          </div>
        </div>
        <div className="h-px" style={{ background: "var(--border)" }} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-20 rounded" style={{ background: "var(--border)" }} />
              <div className="h-10 w-full rounded-lg" style={{ background: "var(--border)" }} />
            </div>
          ))}
        </div>
        <div className="h-10 w-32 rounded-lg" style={{ background: "var(--border)" }} />
      </div>
    </div>
  );
}
