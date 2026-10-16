import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { siteName, whatsappLink } from "@/lib/site";

// Temporary Phase 1 shell: proves fonts, tokens and the primary CTA.
const swatches = [
  { token: "--sand", hex: "#F7F2EC", className: "bg-sand" },
  { token: "--ink", hex: "#0B1426", className: "bg-ink" },
  { token: "--coral", hex: "#FF6B57", className: "bg-coral" },
  { token: "--coral-deep", hex: "#C2412F", className: "bg-coral-deep" },
  { token: "--lagoon", hex: "#1FB5A8", className: "bg-lagoon" },
  { token: "--mist", hex: "#60697B", className: "bg-mist" },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-16 px-6 py-24 sm:px-10">
      <section className="flex max-w-2xl flex-col gap-6">
        <h1 className="text-display">{siteName}</h1>
        <p className="max-w-[60ch] text-lead text-mist">
          Online one-to-one coding lessons for children and adults in Mauritius
          and South Africa. Scratch, Python, SQL and AI, taught at your pace.
          Your first lesson is free.
        </p>
        <div>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-12 rounded-full px-6 text-base transition-[background-color,transform] duration-(--duration-fast) ease-out hover:bg-coral/85 active:scale-[0.97]",
            )}
          >
            Book a free lesson
          </a>
        </div>
      </section>

      <ul
        aria-label="Palette tokens"
        className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-6"
      >
        {swatches.map((swatch) => (
          <li key={swatch.token} className="flex flex-col gap-2">
            <div
              className={cn(
                "aspect-[4/3] rounded-lg ring-1 ring-ink/10 ring-inset",
                swatch.className,
              )}
            />
            <div className="flex flex-col font-mono text-label normal-case tracking-normal">
              <span>{swatch.token}</span>
              <span className="text-mist">{swatch.hex}</span>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
