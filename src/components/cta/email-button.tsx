import { Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Course, emailSubjectFor, mailtoLink } from "@/lib/site";
import { ctaVariants, type CtaVariantProps } from "./cta-variants";

type EmailButtonProps = CtaVariantProps & {
  course?: Course;
  label?: string;
  className?: string;
};

export function EmailButton({
  variant = "quiet",
  size,
  course,
  label = "Email us",
  className,
}: EmailButtonProps) {
  return (
    <a
      href={mailtoLink(emailSubjectFor(course))}
      className={cn(ctaVariants({ variant, size }), className)}
    >
      <Mail aria-hidden="true" />
      {label}
    </a>
  );
}
