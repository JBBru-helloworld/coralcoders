import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Course, whatsappLink, whatsappMessageFor } from "@/lib/site";
import { ctaVariants, type CtaVariantProps } from "./cta-variants";

type WhatsAppButtonProps = CtaVariantProps & {
  course?: Course;
  label?: string;
  className?: string;
};

export function WhatsAppButton({
  variant = "primary",
  size,
  course,
  label = "Book a free lesson",
  className,
}: WhatsAppButtonProps) {
  return (
    <a
      href={whatsappLink(whatsappMessageFor(course))}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(ctaVariants({ variant, size }), className)}
    >
      <MessageCircle aria-hidden="true" />
      {label}
      <span className="sr-only"> on WhatsApp (opens in a new tab)</span>
    </a>
  );
}
