import { hero } from "@/content/home";

/** "First lesson free / Always 1:1 / Taught in English", as on the homepage hero. */
export function TrustLine() {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 text-small text-mist">
      {hero.trust.map((item) => (
        <li key={item} className="flex items-center gap-2">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-lagoon-deep" />
          {item}
        </li>
      ))}
    </ul>
  );
}
