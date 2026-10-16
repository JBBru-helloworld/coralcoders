import { cn } from "@/lib/utils";

type SectionShellProps = {
  id: string;
  title: string;
  /** Placeholder note shown until the section's copy lands. */
  note?: string;
  tone?: "sand" | "ink";
  className?: string;
  children?: React.ReactNode;
};

/** Labelled homepage section. Placeholder content until Phases 3 to 5. */
export function SectionShell({
  id,
  title,
  note,
  tone = "sand",
  className,
  children,
}: SectionShellProps) {
  const headingId = `${id}-heading`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn(
        "scroll-mt-(--nav-height)",
        tone === "ink" && "dark bg-background text-foreground",
        className,
      )}
    >
      <div className="mx-auto flex min-h-[70vh] w-full max-w-6xl flex-col gap-6 px-5 py-24 sm:px-8 md:py-32">
        <h2 id={headingId} className="text-h2">
          {title}
        </h2>
        {note && <p className="max-w-[60ch] text-muted-foreground">{note}</p>}
        {children}
      </div>
    </section>
  );
}
