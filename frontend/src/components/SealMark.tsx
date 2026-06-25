export function SealMark({ size = 40 }: { size?: number }) {
  return (
    <div
      className="seal-ring flex items-center justify-center shrink-0"
      style={{ width: size, height: size, padding: 3 }}
    >
      <div
        className="w-full h-full rounded-full flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-sidebar)' }}
      >
        <span
          className="font-serif leading-none select-none"
          style={{ fontSize: size * 0.42, color: 'var(--color-accent)' }}
        >
          A
        </span>
      </div>
    </div>
  );
}
