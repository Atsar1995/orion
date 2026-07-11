type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  className?: string;
  as?: "header" | "div";
};

export function SectionHeader({
  title,
  subtitle,
  className,
  as: Tag = "header",
}: SectionHeaderProps) {
  return (
    <Tag className={className}>
      <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-1 text-sm font-light text-white/45">{subtitle}</p>
      ) : null}
    </Tag>
  );
}
