export function NeonCard({ children, className = "", style = {} }) {
  return (
    <div className={`neon-card ${className}`.trim()} style={style}>
      <div className="neon-card__content">{children}</div>
      <div className="neon-card__ring" aria-hidden="true">
        <svg className="neon-card__svg">
          <rect className="neon-card__path" pathLength="100" />
        </svg>
      </div>
    </div>
  );
}
