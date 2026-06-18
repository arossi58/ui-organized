/**
 * Contact-form backend (Cloudflare Worker).
 *
 * The marketing site (apps/marketing) is static GitHub Pages, so it can't hold
 * the GitHub token or email API key. The contact form POSTs here instead. This
 * Worker:
 *
 *   1. CORS-gates the request to the site's origin(s).
 *   2. Validates the payload (name, email, message; inquiry type).
 *   3. Re-verifies the Cloudflare Turnstile token server-side (when enabled).
 *   4. Emails the submission to the owner via Resend (both inquiry types).
 *   5. For "suggestion", adds a draft item to the GitHub Project's Ideas column.
 *
 * Config + secrets are set on the Worker (see README.md / wrangler.toml). The
 * payload shape mirrors `ContactPayload` in apps/marketing/src/lib/contact.ts.
 */

export interface Env {
  // ── Secrets (wrangler secret put / .dev.vars) ──────────────────────────────
  /** Resend API key — sends the notification email. */
  RESEND_API_KEY: string;
  /** Fine-grained PAT with read+write access to Projects (suggestion path). */
  GITHUB_TOKEN: string;
  /** Turnstile secret key. When set, captcha tokens are verified server-side. */
  TURNSTILE_SECRET_KEY?: string;

  // ── Vars (wrangler.toml [vars]) ────────────────────────────────────────────
  /** Where submissions are emailed (your inbox). */
  CONTACT_TO: string;
  /** Verified Resend sender, e.g. "UI Organized <contact@uiorganized.com>". */
  CONTACT_FROM: string;
  /** Project owner login (a username for a personal project). */
  PROJECT_OWNER: string;
  /** Project number, e.g. "2". */
  PROJECT_NUMBER: string;
  /** Status single-select option to file suggestions under. Default "Ideas". */
  IDEAS_STATUS_NAME?: string;
  /** Comma-separated allowed origins for CORS. */
  ALLOWED_ORIGINS: string;
}

type InquiryType = "suggestion" | "contribution";

interface ContactPayload {
  inquiryType: InquiryType;
  name: string;
  email: string;
  message: string;
  captchaToken: string | null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin");
    const cors = corsHeaders(origin, env);

    // Preflight.
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, cors);
    }

    let payload: ContactPayload;
    try {
      payload = (await request.json()) as ContactPayload;
    } catch {
      return json({ error: "Invalid JSON body" }, 400, cors);
    }

    const validationError = validate(payload);
    if (validationError) {
      return json({ error: validationError }, 400, cors);
    }

    // Bot gate: re-verify Turnstile when a secret is configured. We feign a
    // generic failure rather than explaining what tripped it.
    if (env.TURNSTILE_SECRET_KEY) {
      const ok = await verifyTurnstile(
        env.TURNSTILE_SECRET_KEY,
        payload.captchaToken,
        request.headers.get("CF-Connecting-IP"),
      );
      if (!ok) {
        return json({ error: "Verification failed. Please try again." }, 403, cors);
      }
    }

    try {
      // Email always — both inquiry types notify the owner. The GitHub item is
      // only for suggestions; do it after the email so a Projects API hiccup
      // doesn't lose the message (the email is the durable record).
      await sendEmail(env, payload);
      if (payload.inquiryType === "suggestion") {
        await createIdeaItem(env, payload);
      }
    } catch (err) {
      console.error("contact submission failed:", err);
      return json({ error: "Failed to process submission." }, 502, cors);
    }

    return json({ ok: true }, 200, cors);
  },
};

// ── Validation ────────────────────────────────────────────────────────────

function validate(p: ContactPayload): string | null {
  if (!p || typeof p !== "object") return "Malformed payload.";
  if (p.inquiryType !== "suggestion" && p.inquiryType !== "contribution") {
    return "Invalid inquiry type.";
  }
  if (typeof p.name !== "string" || !p.name.trim()) return "Name is required.";
  if (typeof p.email !== "string" || !EMAIL_RE.test(p.email.trim())) {
    return "A valid email is required.";
  }
  if (typeof p.message !== "string" || !p.message.trim()) {
    return "Message is required.";
  }
  if (p.name.length > 200 || p.email.length > 320 || p.message.length > 10000) {
    return "Submission is too long.";
  }
  return null;
}

// ── CORS ──────────────────────────────────────────────────────────────────

function corsHeaders(origin: string | null, env: Env): Record<string, string> {
  const allowed = env.ALLOWED_ORIGINS.split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  // Reflect the request origin only if it's allow-listed.
  const allowOrigin = origin && allowed.includes(origin) ? origin : allowed[0] ?? "";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(body: unknown, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...cors },
  });
}

// ── Turnstile ───────────────────────────────────────────────────────────────

async function verifyTurnstile(
  secret: string,
  token: string | null,
  ip: string | null,
): Promise<boolean> {
  if (!token) return false;
  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form,
  });
  if (!res.ok) return false;
  const data = (await res.json()) as { success?: boolean };
  return data.success === true;
}

// ── Email (Resend) ────────────────────────────────────────────────────────

async function sendEmail(env: Env, p: ContactPayload): Promise<void> {
  const label = p.inquiryType === "suggestion" ? "Suggestion" : "Contribution interest";
  const subject = `[UI Organized] ${label} from ${p.name}`;
  const text = [
    `Type: ${label}`,
    `Name: ${p.name}`,
    `Email: ${p.email}`,
    "",
    p.message,
  ].join("\n");
  const html = `
    <h2>${escapeHtml(label)}</h2>
    <p><strong>Name:</strong> ${escapeHtml(p.name)}<br/>
       <strong>Email:</strong> <a href="mailto:${escapeHtml(p.email)}">${escapeHtml(p.email)}</a></p>
    <p style="white-space:pre-wrap">${escapeHtml(p.message)}</p>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM,
      to: [env.CONTACT_TO],
      reply_to: p.email, // replying goes straight to the submitter
      subject,
      text,
      html,
    }),
  });
  if (!res.ok) {
    throw new Error(`Resend HTTP ${res.status}: ${await res.text()}`);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── GitHub Projects v2 (suggestion → Ideas column) ──────────────────────────

async function gh(env: Env, query: string, variables: Record<string, unknown>): Promise<any> {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "ui-organized-contact-worker",
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    throw new Error(`GitHub GraphQL HTTP ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as { data?: any; errors?: unknown };
  if (data.errors) {
    throw new Error(`GitHub GraphQL errors: ${JSON.stringify(data.errors)}`);
  }
  return data.data;
}

async function createIdeaItem(env: Env, p: ContactPayload): Promise<void> {
  const ideasName = (env.IDEAS_STATUS_NAME ?? "Ideas").toLowerCase();

  // 1. Resolve the project node id + the Status field's "Ideas" option.
  const meta = await gh(
    env,
    `query ($login: String!, $number: Int!) {
       user(login: $login) {
         projectV2(number: $number) {
           id
           field(name: "Status") {
             ... on ProjectV2SingleSelectField { id options { id name } }
           }
         }
       }
     }`,
    { login: env.PROJECT_OWNER, number: Number.parseInt(env.PROJECT_NUMBER, 10) },
  );

  const project = meta?.user?.projectV2;
  if (!project) {
    throw new Error(`Project not found: ${env.PROJECT_OWNER} #${env.PROJECT_NUMBER}`);
  }
  const projectId: string = project.id;
  const statusField = project.field;
  const ideasOption =
    statusField?.options?.find((o: { id: string; name: string }) => o.name.toLowerCase() === ideasName) ?? null;

  // 2. Create the draft item. Title = a trimmed first line; body keeps it all.
  const title = `Suggestion: ${oneLine(p.message, 80)}`;
  const body = [
    `**From:** ${p.name} (${p.email})`,
    "",
    p.message,
    "",
    "_Submitted via the contact form._",
  ].join("\n");

  const created = await gh(
    env,
    `mutation ($projectId: ID!, $title: String!, $body: String!) {
       addProjectV2DraftIssue(input: { projectId: $projectId, title: $title, body: $body }) {
         projectItem { id }
       }
     }`,
    { projectId, title, body },
  );
  const itemId: string | undefined = created?.addProjectV2DraftIssue?.projectItem?.id;
  if (!itemId) throw new Error("Draft issue creation returned no item id.");

  // 3. Set Status = Ideas. If the option isn't found, the item still exists
  //    (under "No Status") — surface it rather than silently mis-filing.
  if (!statusField?.id || !ideasOption) {
    console.warn(`"${env.IDEAS_STATUS_NAME ?? "Ideas"}" status option not found; item left with no Status.`);
    return;
  }
  await gh(
    env,
    `mutation ($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
       updateProjectV2ItemFieldValue(input: {
         projectId: $projectId, itemId: $itemId, fieldId: $fieldId,
         value: { singleSelectOptionId: $optionId }
       }) { projectV2Item { id } }
     }`,
    { projectId, itemId, fieldId: statusField.id, optionId: ideasOption.id },
  );
}

function oneLine(s: string, max: number): string {
  const flat = s.trim().replace(/\s+/g, " ");
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
}
