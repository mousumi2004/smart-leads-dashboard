export function MeshBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden mesh-background" aria-hidden="true" data-testid="mesh-background">
      <div className="absolute inset-0 mesh-background-soften" />
    </div>
  );
}
