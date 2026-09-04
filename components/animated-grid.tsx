export default function AnimatedGrid() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden opacity-60">
      <div className="grid-overlay absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,5,5,0.2)_45%,rgba(5,5,5,0.8)_100%)]" />
    </div>
  );
}
