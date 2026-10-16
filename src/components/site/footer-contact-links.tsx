"use client";

import { usePathname } from "next/navigation";
import {
  contact,
  courseForPath,
  emailSubjectFor,
  mailtoLink,
  whatsappLink,
  whatsappMessageFor,
} from "@/lib/site";

/** Footer WhatsApp and email links; on a course page they use that course's message. */
export function FooterContactLinks({ linkClass }: { linkClass: string }) {
  const course = courseForPath(usePathname());
  return (
    <>
      <li>
        <a
          href={whatsappLink(whatsappMessageFor(course))}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          <span className="sr-only">WhatsApp </span>
          {contact.whatsappDisplay}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </li>
      <li>
        <a href={mailtoLink(emailSubjectFor(course))} className={`${linkClass} [overflow-wrap:anywhere]`}>
          {contact.email}
        </a>
      </li>
    </>
  );
}
