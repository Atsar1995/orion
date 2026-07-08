type OrionLogoProps = {
  className?: string;
  size?: "sm" | "md";
};

export function OrionLogo({ className, size = "md" }: OrionLogoProps) {
  const dimension = size === "sm" ? 32 : 40;

  return (
    <svg
      className={className}
      width={dimension}
      height={dimension}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden
    >
      <rect
        width="40"
        height="40"
        rx="10"
        className="fill-orion-gold/10 stroke-orion-gold/30"
        strokeWidth="1"
      />
      <circle cx="20" cy="20" r="6" className="stroke-orion-gold" strokeWidth="1.5" />
      <path
        d="M20 6v4M20 30v4M6 20h4M30 20h4M10.1 10.1l2.8 2.8M27.1 27.1l2.8 2.8M10.1 29.9l2.8-2.8M27.1 12.9l2.8-2.8"
        className="stroke-orion-gold/70"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
