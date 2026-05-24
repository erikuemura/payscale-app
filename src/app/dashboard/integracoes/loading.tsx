export default function Loading() {
  return (
    <div className="flex-1 p-6 lg:p-8 space-y-5 animate-pulse">
      {/* Integration cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl" style={{ background: "var(--border)" }} />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-24 rounded" style={{ background: "var(--border)" }} />
                  <div className="h-2.5 w-16 rounded" style={{ background: "var(--border)" }} />
                </div>
              </div>
              <div className="h-5 w-16 rounded-full" style={{ background: "var(--border)" }} />
            </div>
            <div className="h-px" style={{ background: "var(--border)" }} />
            <div className="space-y-2">
              <div className="h-3 w-full rounded" style={{ background: "var(--border)" }} />
              <div className="h-3 w-3/4 rounded" style={{ background: "var(--border)" }} />
            </div>
            <div className="h-9 w-full rounded-lg" style={{ background: "var(--border)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
