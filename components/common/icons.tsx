import type { NavIcon } from "@/lib/navigation";

type IconProps = {
  className?: string;
};

const stroke = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function NavIconGlyph({
  name,
  className,
}: {
  name: NavIcon;
  className?: string;
}) {
  switch (name) {
    case "mission-control":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke}>
          <path d="M4 13h6v7H4zM14 4h6v16h-6zM4 4h6v5H4z" />
        </svg>
      );
    case "intelligence":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke}>
          <path d="M12 3a7 7 0 0 0-4 12.74V19a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-3.26A7 7 0 0 0 12 3z" />
          <path d="M9 22h6" />
        </svg>
      );
    case "tasks":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke}>
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      );
    case "calendar":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke}>
          <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
        </svg>
      );
    case "messages":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    case "hotels":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke}>
          <path d="M3 21V7l9-4 9 4v14" />
          <path d="M9 21v-6h6v6M9 9h.01M15 9h.01M9 13h.01M15 13h.01" />
        </svg>
      );
    case "commerce":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke}>
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
        </svg>
      );
    case "marketing":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke}>
          <path d="m3 11 18-5v12L3 14v-3z" />
          <path d="M11 13v8" />
        </svg>
      );
    case "crm":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "finance":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke}>
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    case "knowledge":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
    case "integrations":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke}>
          <path d="M12 22v-5M12 7V2M5 12H2M22 12h-3M7 7l-3-3M20 4l-3 3M7 17l-3 3M20 20l-3-3" />
        </svg>
      );
    case "settings":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      );
  }
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function BellIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export function SparkIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z" />
    </svg>
  );
}
