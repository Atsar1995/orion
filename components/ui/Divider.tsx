import { cn } from "@/lib/utils";

type DividerProps = {
  className?: string;
  orientation?: "horizontal" | "vertical";
};

export function Divider({
  className,
  orientation = "horizontal",
}: DividerProps) {
  return (
    <hr
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "border-0 border-white/[0.06]",
        orientation === "horizontal" ? "w-full border-t" : "h-full border-l",
        className,
      )}
    />
  );
}
