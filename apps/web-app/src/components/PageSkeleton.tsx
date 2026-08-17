/**
 * Shimmer skeleton for dashboard page loading states.
 * Used as the Suspense fallback in the dashboard layout.
 */
export function PageSkeleton() {
  return (
    <div
      style={{
        maxWidth: 900,
        margin: '0 auto',
        animation: 'pageEnter 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
      }}
    >
      {/* Page header skeleton */}
      <div style={{ marginBottom: 32 }}>
        <div
          className="skeleton"
          style={{ height: 30, width: '40%', marginBottom: 10 }}
        />
        <div
          className="skeleton"
          style={{ height: 16, width: '60%' }}
        />
      </div>

      {/* Stats row skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="skeleton"
            style={{
              height: 96,
              borderRadius: 14,
              animationDelay: `${i * 0.07}s`,
            }}
          />
        ))}
      </div>

      {/* Content cards skeleton */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="skeleton"
            style={{
              height: 80,
              borderRadius: 14,
              animationDelay: `${0.28 + i * 0.08}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
