import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

type BriefSectionItem = { id: string; title: string; person_name?: string | null; due_at: string };

function sectionHtml(title: string, items: BriefSectionItem[]) {
  if (!items.length) return `<h3>${title}</h3><p>None</p>`;
  const list = items
    .map((item) => `<li><strong>${item.title}</strong>${item.person_name ? ` — ${item.person_name}` : ""}</li>`)
    .join("");
  return `<h3>${title}</h3><ul>${list}</ul>`;
}

export async function sendMorningBriefEmail(input: {
  to: string;
  firstName: string;
  today: BriefSectionItem[];
  comingUp: BriefSectionItem[];
  overdue: BriefSectionItem[];
}) {
  if (!resend) {
    throw new Error("RESEND_API_KEY missing");
  }

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;">
      <h2>Good morning, ${input.firstName}</h2>
      <p>Here is your morning brief.</p>
      ${sectionHtml("Today", input.today)}
      ${sectionHtml("Coming up", input.comingUp)}
      ${sectionHtml("Overdue", input.overdue)}
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard">Open dashboard</a></p>
    </div>
  `;

  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
    to: input.to,
    subject: "Your morning brief",
    html,
  });
}
