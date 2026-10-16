/*
 * Privacy notice copy. Final wording from the Phase 7 brief, pending the
 * owner's review: change it here, never inside the page. The email comes from
 * site.ts and is linked in the page.
 */
export const privacy = {
  title: "Privacy notice",
  metaDescription:
    "How Coral Coders handles your information: no forms, cookies or trackers, and only the details you choose to share when you contact us.",
  sections: [
    {
      heading: "What this website collects",
      body: "This website does not use forms, cookies or advertising trackers. It does not collect personal information when you browse it.",
    },
    {
      heading: "When you contact us",
      body: "If you message us on WhatsApp or email, we receive the details you choose to share, such as your name, phone number, email address and information about the learner. We use these details only to reply to you, arrange lessons and send progress updates.",
    },
    {
      heading: "Children's information",
      body: "We only collect what we need to teach well, such as a learner's first name, age and level. We never share it with third parties for marketing.",
    },
    {
      heading: "Lessons",
      body: "Lessons take place over Zoom or Google Meet, and those services handle call data under their own privacy policies. Lessons are not recorded unless a parent or adult learner asks for it and agrees.",
    },
    {
      heading: "Your rights",
      // The page appends " Email <address>." with the address linked.
      body: "You can ask us to see, correct or delete the information we hold about you or your child at any time.",
      withEmail: true,
    },
    {
      heading: "Changes",
      body: "If this notice changes, the updated version will appear on this page.",
    },
  ],
} as const;
