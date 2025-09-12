'use client';

export function GridOverlay() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Grid pattern */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="rgba(59, 130, 246, 0.05)"
              strokeWidth="1"
            />
          </pattern>

          {/* Gradient mask for fade effect */}
          <radialGradient id="fade">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="50%" stopColor="white" stopOpacity="0.5" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-32 h-32">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <path
            d="M 0 30 L 0 0 L 30 0"
            stroke="rgba(59, 130, 246, 0.3)"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M 0 20 L 0 0 L 20 0"
            stroke="rgba(59, 130, 246, 0.5)"
            strokeWidth="1"
            fill="none"
          />
        </svg>
      </div>

      <div className="absolute top-0 right-0 w-32 h-32">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <path
            d="M 70 0 L 100 0 L 100 30"
            stroke="rgba(59, 130, 246, 0.3)"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M 80 0 L 100 0 L 100 20"
            stroke="rgba(59, 130, 246, 0.5)"
            strokeWidth="1"
            fill="none"
          />
        </svg>
      </div>

      <div className="absolute bottom-0 left-0 w-32 h-32">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <path
            d="M 0 70 L 0 100 L 30 100"
            stroke="rgba(59, 130, 246, 0.3)"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M 0 80 L 0 100 L 20 100"
            stroke="rgba(59, 130, 246, 0.5)"
            strokeWidth="1"
            fill="none"
          />
        </svg>
      </div>

      <div className="absolute bottom-0 right-0 w-32 h-32">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <path
            d="M 70 100 L 100 100 L 100 70"
            stroke="rgba(59, 130, 246, 0.3)"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M 80 100 L 100 100 L 100 80"
            stroke="rgba(59, 130, 246, 0.5)"
            strokeWidth="1"
            fill="none"
          />
        </svg>
      </div>
    </div>
  );
}
