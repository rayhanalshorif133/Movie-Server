export default function LoadingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <span className="dot-bounce dot-1">.</span>
      <span className="dot-bounce dot-2">.</span>
      <span className="dot-bounce">.</span>
    </div>
  );
}