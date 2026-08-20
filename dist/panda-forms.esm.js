// src/schemas.js
var SCHEMAS = {
  pledge: {
    id: "pledge-form",
    formType: "pledge-form",
    title: "Panda Support Pledge",
    intro: "Pledge your support for giant panda conservation. Fill in your details and we'll tailor the form to your chosen way of helping.",
    accent: "green",
    fields: [
      {
        key: "full_name",
        name: "full_name",
        label: "Full Name",
        type: "text",
        required: true,
        autocomplete: "name",
        placeholder: "Jane Doe",
        always: true
      },
      {
        key: "email",
        name: "email",
        label: "Email Address",
        type: "email",
        required: true,
        autocomplete: "email",
        placeholder: "jane@example.com",
        reveal: { on: [{ field: "full_name", event: "input", test: "minLen2" }] }
      },
      {
        key: "phone",
        name: "phone",
        label: "Phone Number",
        type: "tel",
        optionalTag: true,
        autocomplete: "tel",
        placeholder: "+1 (555) 000-0000",
        help: "We only call if there's an urgent update about your pledge.",
        reveal: { on: [{ field: "email", event: "input", test: "minLen4" }] }
      },
      {
        key: "support_type",
        name: "support_type",
        label: "How would you like to support panda conservation?",
        type: "radio",
        required: true,
        options: [
          { value: "donate", label: "Make a Donation" },
          { value: "adopt", label: "Virtual Adoption" },
          { value: "awareness", label: "Spread Awareness" },
          { value: "research", label: "Fund Research" }
        ],
        reveal: {
          on: [
            { field: "phone", event: "input" },
            { field: "phone", event: "focus" }
          ]
        }
      },
      {
        key: "donation_amount",
        name: "donation_amount",
        label: "Choose a donation amount",
        type: "radio",
        panel: { tone: "green" },
        options: [
          { value: "10", label: "$10" },
          { value: "25", label: "$25" },
          { value: "50", label: "$50" },
          { value: "custom", label: "Custom" }
        ],
        reveal: {
          hideSiblings: ["adopt_panda", "awareness_platforms", "research_area"],
          on: [{ field: "support_type", event: "change", test: "eq:donate" }]
        }
      },
      {
        key: "custom_amount",
        name: "custom_amount",
        label: "Enter your amount (USD)",
        type: "number",
        min: 1,
        placeholder: "e.g. 75",
        reveal: { on: [{ field: "donation_amount", event: "change", test: "eq:custom" }] }
      },
      {
        key: "adopt_panda",
        name: "panda",
        label: "Choose a panda to virtually adopt",
        type: "radio",
        panel: { tone: "amber" },
        options: [
          { value: "bao_bao", label: "Bao Bao \u2014 11 yrs, female" },
          { value: "bei_bei", label: "Bei Bei \u2014 9 yrs, male" },
          { value: "xiao_qi_ji", label: "Xiao Qi Ji \u2014 5 yrs, male" },
          { value: "mei_xiang", label: "Mei Xiang \u2014 26 yrs, female" }
        ],
        reveal: {
          hideSiblings: ["donation_amount", "awareness_platforms", "research_area"],
          on: [{ field: "support_type", event: "change", test: "eq:adopt" }]
        }
      },
      {
        key: "awareness_platforms",
        name: "platform",
        label: "Which platforms will you share on?",
        type: "checkbox",
        panel: { tone: "blue" },
        options: [
          { value: "instagram", label: "Instagram" },
          { value: "twitter", label: "X / Twitter" },
          { value: "tiktok", label: "TikTok" },
          { value: "facebook", label: "Facebook" },
          { value: "youtube", label: "YouTube" },
          { value: "linkedin", label: "LinkedIn" }
        ],
        extra: {
          key: "social_handle",
          name: "social_handle",
          label: "Your primary handle or profile link",
          type: "text",
          placeholder: "@pandafan or https://..."
        },
        reveal: {
          hideSiblings: ["donation_amount", "adopt_panda", "research_area"],
          on: [{ field: "support_type", event: "change", test: "eq:awareness" }]
        }
      },
      {
        key: "research_area",
        name: "research_area",
        label: "Which research area do you want to fund?",
        type: "radio",
        panel: { tone: "purple" },
        options: [
          { value: "habitat", label: "Habitat Restoration" },
          { value: "breeding", label: "Breeding Programs" },
          { value: "health", label: "Veterinary Health" },
          { value: "climate", label: "Climate Impact Studies" }
        ],
        reveal: {
          hideSiblings: ["donation_amount", "adopt_panda", "awareness_platforms"],
          on: [{ field: "support_type", event: "change", test: "eq:research" }]
        }
      },
      {
        key: "frequency",
        name: "frequency",
        label: "How often would you like to contribute?",
        type: "radio",
        required: true,
        options: [
          { value: "once", label: "One-time" },
          { value: "monthly", label: "Monthly" },
          { value: "quarterly", label: "Quarterly" },
          { value: "annually", label: "Annually" }
        ],
        // Revealed once the user interacts with any support-detail panel.
        reveal: {
          on: [
            { field: "donation_amount", event: "change" },
            { field: "custom_amount", event: "input" },
            { field: "adopt_panda", event: "change" },
            { field: "awareness_platforms", event: "change" },
            { field: "social_handle", event: "input" },
            { field: "research_area", event: "change" }
          ]
        }
      },
      {
        key: "recurring_note",
        name: "billing_address",
        label: "Billing Address",
        type: "text",
        autocomplete: "street-address",
        placeholder: "123 Main St, City, State, ZIP",
        note: {
          tone: "yellow",
          html: "<strong>Recurring pledge selected.</strong> We'll send a reminder before each charge and you can cancel at any time. Please verify your billing address below."
        },
        reveal: { on: [{ field: "frequency", event: "change", test: "neq:once" }] }
      },
      {
        key: "motivation",
        name: "motivation",
        label: "What inspires you to support panda conservation?",
        type: "textarea",
        rows: 3,
        placeholder: "Share your story or reason\u2026",
        reveal: { on: [{ field: "frequency", event: "change" }] }
      },
      {
        key: "referral",
        name: "referral",
        label: "How did you hear about us?",
        type: "radio",
        options: [
          { value: "friend", label: "Friend or Family" },
          { value: "social", label: "Social Media" },
          { value: "search", label: "Search Engine" },
          { value: "event", label: "Event / Conference" },
          { value: "news", label: "News Article" }
        ],
        reveal: { on: [{ field: "frequency", event: "change" }] }
      },
      {
        key: "friend_name",
        name: "friend_name",
        label: "Friend's Name",
        optionalTag: true,
        optionalHint: "(optional, for referral credit)",
        type: "text",
        placeholder: "e.g. Alex Smith",
        reveal: {
          hideSiblings: ["ref_handle"],
          on: [{ field: "referral", event: "change", test: "eq:friend" }]
        }
      },
      {
        key: "ref_handle",
        name: "ref_handle",
        label: "Which account or post led you here?",
        type: "text",
        placeholder: "@username or post link",
        reveal: {
          hideSiblings: ["friend_name"],
          on: [{ field: "referral", event: "change", test: "eq:social" }]
        }
      },
      {
        key: "newsletter",
        name: "newsletter",
        label: "Sign me up for the <strong>Panda Dispatch</strong> newsletter \u2014 monthly updates on conservation wins, new pandas born, and how your pledge is making a difference.",
        type: "checkbox",
        single: true,
        value: "yes",
        reveal: { on: [{ field: "referral", event: "change" }] }
      },
      {
        key: "newsletter_topics",
        name: "topic",
        label: "Which topics interest you most?",
        type: "checkbox",
        options: [
          { value: "research", label: "Research Updates" },
          { value: "cubs", label: "New Cub Announcements" },
          { value: "events", label: "Upcoming Events" },
          { value: "impact", label: "Impact Reports" }
        ],
        reveal: { on: [{ field: "newsletter", event: "change", test: "checked" }] }
      },
      {
        key: "additional_comments",
        name: "additional_comments",
        label: "Additional Comments",
        type: "textarea",
        required: true,
        rows: 3,
        placeholder: "Any final thoughts...",
        reveal: { on: [{ field: "referral", event: "change" }] }
      }
    ]
  },
  dynamic: {
    id: "dynamic-form",
    formType: "dynamic-form",
    title: "Panda Conservation Registration",
    intro: "Fill out the form below to register as a panda conservation volunteer. Fields will appear as you make selections.",
    accent: "blue",
    fields: [
      {
        key: "full_name",
        name: "full_name",
        label: "Full Name",
        type: "text",
        required: true,
        placeholder: "Jane Doe",
        always: true
      },
      {
        key: "email",
        name: "email",
        label: "Email Address",
        type: "email",
        required: true,
        autocomplete: "email",
        placeholder: "jane@example.com",
        reveal: { on: [{ field: "full_name", event: "input", test: "minLen2" }] }
      },
      {
        key: "country",
        name: "country",
        label: "Country of Residence",
        type: "select",
        required: true,
        placeholder: "\u2014 Select a country \u2014",
        options: [
          { value: "US", label: "United States" },
          { value: "CA", label: "Canada" },
          { value: "GB", label: "United Kingdom" },
          { value: "AU", label: "Australia" },
          { value: "CN", label: "China" },
          { value: "IN", label: "India" },
          { value: "DE", label: "Germany" },
          { value: "FR", label: "France" },
          { value: "other", label: "Other" }
        ],
        reveal: { on: [{ field: "email", event: "input", test: "minLen4" }] }
      },
      {
        key: "us_state",
        name: "us_state",
        label: "State",
        required: true,
        type: "select",
        placeholder: "\u2014 Select a state \u2014",
        options: usStates(),
        reveal: {
          hideSiblings: ["us_city", "ca_province", "other_country"],
          on: [{ field: "country", event: "change", test: "eq:US" }]
        }
      },
      {
        key: "us_city",
        name: "us_city",
        label: "City",
        type: "text",
        placeholder: "Enter your city",
        reveal: { on: [{ field: "us_state", event: "change", test: "nonEmpty" }] }
      },
      {
        key: "ca_province",
        name: "ca_province",
        label: "Province / Territory",
        required: true,
        type: "select",
        placeholder: "\u2014 Select a province \u2014",
        options: caProvinces(),
        reveal: {
          hideSiblings: ["us_state", "us_city", "other_country"],
          on: [{ field: "country", event: "change", test: "eq:CA" }]
        }
      },
      {
        key: "other_country",
        name: "other_country",
        label: "Please specify your country",
        type: "text",
        placeholder: "Your country",
        reveal: {
          hideSiblings: ["us_state", "us_city", "ca_province"],
          on: [{ field: "country", event: "change", test: "eq:other" }]
        }
      },
      {
        key: "role",
        name: "role",
        label: "Volunteer Role",
        required: true,
        type: "select",
        placeholder: "\u2014 What would you like to do? \u2014",
        options: [
          { value: "field", label: "Field Research" },
          { value: "education", label: "Public Education" },
          { value: "fundraising", label: "Fundraising" },
          { value: "remote", label: "Remote / Online Support" }
        ],
        reveal: { on: [{ field: "country", event: "change", test: "nonEmpty" }] }
      },
      {
        key: "field_research",
        type: "group",
        panel: { tone: "amber" },
        label: "Field Research requires travel to China. Please provide travel details.",
        children: [
          { key: "passport", name: "passport", label: "Passport Number", type: "text", placeholder: "e.g. A12345678" },
          { key: "travel_date", name: "travel_date", label: "Earliest Available Travel Date", type: "date" }
        ],
        reveal: {
          hideSiblings: ["education", "fundraising", "remote"],
          on: [{ field: "role", event: "change", test: "eq:field" }]
        }
      },
      {
        key: "education",
        type: "group",
        panel: { tone: "blue" },
        label: "Tell us about your education background.",
        children: [
          {
            key: "edu_level",
            name: "edu_level",
            label: "Highest Education Level",
            type: "select",
            placeholder: "\u2014 Select \u2014",
            options: [
              { value: "hs", label: "High School / GED" },
              { value: "assoc", label: "Associate Degree" },
              { value: "bachelor", label: "Bachelor's Degree" },
              { value: "master", label: "Master's Degree" },
              { value: "doctorate", label: "Doctorate" }
            ]
          },
          {
            key: "languages",
            name: "languages",
            label: "Languages Spoken (comma-separated)",
            type: "text",
            placeholder: "e.g. English, Mandarin, Spanish"
          }
        ],
        reveal: {
          hideSiblings: ["field_research", "fundraising", "remote"],
          on: [{ field: "role", event: "change", test: "eq:education" }]
        }
      },
      {
        key: "fundraising",
        name: "channel",
        type: "checkbox",
        panel: { tone: "green" },
        label: "Preferred fundraising channel",
        options: [
          { value: "social_media", label: "Social Media" },
          { value: "events", label: "In-Person Events" },
          { value: "email", label: "Email Campaigns" },
          { value: "corporate", label: "Corporate Sponsorships" }
        ],
        reveal: {
          hideSiblings: ["field_research", "education", "remote"],
          on: [{ field: "role", event: "change", test: "eq:fundraising" }]
        }
      },
      {
        key: "remote",
        name: "remote_skill",
        type: "select",
        panel: { tone: "purple" },
        label: "Primary Skill",
        placeholder: "\u2014 Select a skill \u2014",
        options: [
          { value: "web", label: "Web Development" },
          { value: "design", label: "Graphic Design" },
          { value: "writing", label: "Content Writing" },
          { value: "data", label: "Data Analysis" },
          { value: "social", label: "Social Media Management" }
        ],
        reveal: {
          hideSiblings: ["field_research", "education", "fundraising"],
          on: [{ field: "role", event: "change", test: "eq:remote" }]
        }
      },
      {
        key: "availability",
        name: "availability",
        label: "Weekly Availability",
        type: "radio",
        required: true,
        inline: true,
        options: [
          { value: "lt5", label: "Less than 5 hrs" },
          { value: "5to10", label: "5\u201310 hrs" },
          { value: "10to20", label: "10\u201320 hrs" },
          { value: "fulltime", label: "Full-time" }
        ],
        reveal: { on: [{ field: "role", event: "change", test: "nonEmpty" }] }
      },
      {
        key: "fulltime_note",
        name: "phone",
        label: "Phone Number",
        type: "tel",
        placeholder: "+1 (555) 000-0000",
        note: {
          tone: "yellow",
          html: "<strong>Full-time commitment detected.</strong> A coordinator will reach out within 3 business days to discuss contract terms. Please provide a phone number for faster communication."
        },
        reveal: { on: [{ field: "availability", event: "change", test: "eq:fulltime" }] }
      },
      {
        key: "referral",
        name: "referral",
        label: "How did you hear about us?",
        type: "select",
        placeholder: "\u2014 Select \u2014",
        options: [
          { value: "social", label: "Social Media" },
          { value: "friend", label: "A Friend" },
          { value: "search", label: "Search Engine" },
          { value: "news", label: "News Article" },
          { value: "event", label: "Event / Conference" }
        ],
        reveal: { on: [{ field: "role", event: "change", test: "nonEmpty" }] }
      },
      {
        key: "social_platform",
        name: "social_platform",
        label: "Which platform?",
        type: "select",
        placeholder: "\u2014 Select \u2014",
        options: [
          { value: "instagram", label: "Instagram" },
          { value: "twitter", label: "X (Twitter)" },
          { value: "facebook", label: "Facebook" },
          { value: "tiktok", label: "TikTok" },
          { value: "youtube", label: "YouTube" },
          { value: "linkedin", label: "LinkedIn" }
        ],
        reveal: {
          hideSiblings: ["friend_name"],
          on: [{ field: "referral", event: "change", test: "eq:social" }]
        }
      },
      {
        key: "friend_name",
        name: "friend_name",
        label: "Friend's Name",
        optionalTag: true,
        optionalHint: "(optional, for referral credit)",
        type: "text",
        placeholder: "e.g. Alex Smith",
        reveal: {
          hideSiblings: ["social_platform"],
          on: [{ field: "referral", event: "change", test: "eq:friend" }]
        }
      },
      {
        key: "newsletter",
        name: "newsletter",
        label: "Subscribe me to the monthly <strong>Panda Dispatch</strong> newsletter with conservation updates and volunteer stories.",
        type: "checkbox",
        single: true,
        value: "yes",
        reveal: { on: [{ field: "availability", event: "change" }] }
      },
      {
        key: "newsletter_freq",
        name: "newsletter_freq",
        label: "How often would you like to hear from us?",
        type: "select",
        placeholder: "\u2014 Select frequency \u2014",
        options: [
          { value: "weekly", label: "Weekly" },
          { value: "biweekly", label: "Bi-weekly" },
          { value: "monthly", label: "Monthly" }
        ],
        reveal: { on: [{ field: "newsletter", event: "change", test: "checked" }] }
      },
      {
        key: "comments",
        name: "comments",
        label: "Any additional comments or questions?",
        type: "textarea",
        required: true,
        rows: 3,
        placeholder: "Tell us anything else you'd like us to know.",
        reveal: { on: [{ field: "availability", event: "change" }] }
      }
    ]
  }
};
function usStates() {
  return [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming"
  ].map((s) => ({ value: s, label: s }));
}
function caProvinces() {
  return [
    "Alberta",
    "British Columbia",
    "Manitoba",
    "New Brunswick",
    "Newfoundland and Labrador",
    "Northwest Territories",
    "Nova Scotia",
    "Nunavut",
    "Ontario",
    "Prince Edward Island",
    "Quebec",
    "Saskatchewan",
    "Yukon"
  ].map((p) => ({ value: p, label: p }));
}
function listFields(formName) {
  const schema = SCHEMAS[formName];
  if (!schema) return [];
  return schema.fields.map((f) => ({
    key: f.key,
    label: stripTags(typeof f.label === "string" ? f.label : f.key),
    type: f.type,
    required: !!f.required,
    always: !!f.always
  }));
}
function stripTags(s) {
  return String(s).replace(/<[^>]*>/g, "").trim();
}

// src/styles.js
var ACCENTS = {
  green: { ring: "#16a34a", btn: "#16a34a", btnHover: "#15803d", dot: "#16a34a" },
  blue: { ring: "#3b82f6", btn: "#2563eb", btnHover: "#1d4ed8", dot: "#3b82f6" }
};
var PANEL_TONES = {
  green: { bg: "#f0fdf4", border: "#bbf7d0", text: "#166534" },
  amber: { bg: "#fffbeb", border: "#fde68a", text: "#92400e" },
  blue: { bg: "#eff6ff", border: "#bfdbfe", text: "#1e40af" },
  purple: { bg: "#faf5ff", border: "#e9d5ff", text: "#6b21a8" },
  yellow: { bg: "#fefce8", border: "#fde047", text: "#854d0e" }
};
function buildCss(accentName) {
  const accent = ACCENTS[accentName] || ACCENTS.blue;
  return `
.pf-root{max-width:42rem;margin:2rem auto;background:#fff;padding:1.5rem;border-radius:.5rem;
  box-shadow:0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -4px rgba(0,0,0,.1);
  font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  color:#374151;line-height:1.625;box-sizing:border-box;}
.pf-root *,.pf-root *::before,.pf-root *::after{box-sizing:border-box;}
@media(min-width:640px){.pf-root{padding:2rem;}}
.pf-title{font-size:1.875rem;line-height:2.25rem;font-weight:700;color:#111827;margin:0 0 .5rem;}
.pf-intro{color:#6b7280;font-size:.875rem;margin:0 0 1.5rem;}
.pf-progress{display:flex;align-items:center;margin-bottom:2rem;}
.pf-progress-label{font-size:.75rem;color:#9ca3af;margin-right:.5rem;}
.pf-dot{width:10px;height:10px;border-radius:50%;background:#d1d5db;display:inline-block;margin:0 3px;transition:background .3s;}
.pf-dot.pf-active{background:${accent.dot};}
.pf-field{margin-bottom:1.25rem;}
.pf-label{display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:.25rem;}
.pf-req{color:#ef4444;}
.pf-optional{color:#9ca3af;font-weight:400;}
.pf-help{font-size:.75rem;color:#9ca3af;margin-top:.25rem;}
.pf-input,.pf-select,.pf-textarea{display:block;width:100%;padding:.5rem;border:1px solid #d1d5db;
  border-radius:.375rem;box-shadow:0 1px 2px 0 rgba(0,0,0,.05);font-size:.875rem;color:#374151;
  background:#fff;margin-top:.25rem;font-family:inherit;}
.pf-input:focus,.pf-select:focus,.pf-textarea:focus{outline:none;border-color:${accent.ring};
  box-shadow:0 0 0 2px ${hexToRgba(accent.ring, 0.3)};}
.pf-textarea{resize:vertical;}
.pf-choice-group{display:flex;flex-direction:column;gap:.5rem;}
.pf-choice-group.pf-inline{flex-direction:row;flex-wrap:wrap;gap:.75rem;}
.pf-choice{display:flex;align-items:center;gap:.5rem;padding:.25rem 0;cursor:pointer;font-size:.875rem;
  color:#374151;user-select:none;}
.pf-choice input{cursor:pointer;}
.pf-panel{border-radius:.375rem;padding:1rem;margin-top:.25rem;}
.pf-panel-title{font-size:.875rem;font-weight:600;margin:0 0 .75rem;}
.pf-note{border-radius:.375rem;padding:.75rem;font-size:.875rem;margin-bottom:.75rem;}
.pf-subfield{margin-top:.75rem;}
.pf-submit{width:100%;color:#fff;padding:.5rem 1rem;border:none;border-radius:.375rem;font-weight:600;
  font-size:.875rem;cursor:pointer;transition:background .15s;background:${accent.btn};}
.pf-submit:hover{background:${accent.btnHover};}
.pf-submit:disabled{opacity:.4;cursor:not-allowed;}
.pf-success{margin-top:1.5rem;padding:1rem;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:.375rem;
  color:#166534;font-size:.875rem;font-weight:500;}
.pf-hidden{display:none;}

/* Reveal animation \u2014 matches the original research pages exactly so the
   reveal\u2192first-interaction timing signal is preserved. */
.pf-reveal{opacity:0;position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;}
.pf-reveal.pf-visible{position:relative;width:auto;height:auto;overflow:visible;pointer-events:auto;
  animation:pfFadeSlideIn .35s ease forwards;}
@keyframes pfFadeSlideIn{from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:translateY(0);}}
`;
}
function hexToRgba(hex, alpha) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// src/renderer.js
function renderForm(schema, selected) {
  const keep = selected == null ? null : new Set(selected);
  const fields = schema.fields.filter((f) => keep == null || keep.has(f.key));
  const formEl = el("form", { id: schema.id, class: "pf-form" });
  const fieldEls = {};
  for (const field of fields) {
    const node = buildField(field);
    if (!node) continue;
    fieldEls[field.key] = node;
    formEl.appendChild(node);
  }
  const submit = el("button", {
    type: "submit",
    class: "pf-submit",
    "data-pf": "submit"
  });
  submit.textContent = schema.accent === "green" ? "Submit Pledge" : "Submit Registration";
  formEl.appendChild(submit);
  const dotsEl = buildProgress(fields);
  return { formEl, dotsEl, fieldEls };
}
function buildProgress(fields) {
  const wrap = el("div", { class: "pf-progress", "data-pf": "progress" });
  wrap.appendChild(el("span", { class: "pf-progress-label" }, "Progress:"));
  const revealCount = fields.filter((f) => !f.always).length;
  const dots = Math.min(8, Math.max(1, revealCount || 1));
  for (let i = 0; i < dots; i++) {
    wrap.appendChild(el("span", { class: "pf-dot" + (i === 0 ? " pf-active" : "") }));
  }
  return wrap;
}
function buildField(field) {
  const wrapper = el("div", {
    class: "pf-field" + (field.always ? "" : " pf-reveal"),
    "data-pf-field": field.key
  });
  if (field.note) wrapper.appendChild(buildNote(field.note));
  const inner = field.type === "group" ? buildGroup(field) : field.panel ? buildPanel(field) : buildControl(field);
  wrapper.appendChild(inner);
  return wrapper;
}
function buildNote(note) {
  const tone = PANEL_TONES[note.tone] || PANEL_TONES.yellow;
  const box = el("div", {
    class: "pf-note",
    style: `background:${tone.bg};border:1px solid ${tone.border};color:${tone.text};`
  });
  box.innerHTML = note.html;
  return box;
}
function buildPanel(field) {
  const tone = PANEL_TONES[field.panel.tone] || PANEL_TONES.blue;
  const panel = el("div", {
    class: "pf-panel",
    style: `background:${tone.bg};border:1px solid ${tone.border};`
  });
  const title = el("p", { class: "pf-panel-title", style: `color:${tone.text};` });
  title.innerHTML = labelText(field);
  panel.appendChild(title);
  panel.appendChild(buildControlBody(field));
  if (field.extra) panel.appendChild(buildSubField(field.extra));
  return panel;
}
function buildGroup(field) {
  const tone = PANEL_TONES[field.panel.tone] || PANEL_TONES.blue;
  const panel = el("div", {
    class: "pf-panel",
    style: `background:${tone.bg};border:1px solid ${tone.border};`
  });
  const title = el("p", { class: "pf-panel-title", style: `color:${tone.text};` });
  title.innerHTML = labelText(field);
  panel.appendChild(title);
  for (const child of field.children) panel.appendChild(buildSubField(child));
  return panel;
}
function buildSubField(child) {
  const wrap = el("div", { class: "pf-subfield" });
  const label = el("label", { class: "pf-label", for: idFor(child) });
  label.innerHTML = labelText(child);
  wrap.appendChild(label);
  wrap.appendChild(buildControlBody(child));
  return wrap;
}
function buildControl(field) {
  const frag = document.createDocumentFragment();
  if (field.single) {
    const choice = el("label", { class: "pf-choice", for: idFor(field) });
    choice.appendChild(control(field));
    const span = el("span");
    span.innerHTML = labelText(field);
    choice.appendChild(span);
    frag.appendChild(choice);
    return wrapFragment(frag);
  }
  const isGroup = field.type === "radio" || field.type === "checkbox";
  const label = el(isGroup ? "p" : "label", {
    class: "pf-label",
    ...isGroup ? {} : { for: idFor(field) }
  });
  label.innerHTML = labelText(field);
  frag.appendChild(label);
  frag.appendChild(buildControlBody(field));
  if (field.help) frag.appendChild(el("p", { class: "pf-help" }, field.help));
  return wrapFragment(frag);
}
function buildControlBody(field) {
  if (field.type === "radio" || field.type === "checkbox") {
    if (field.single) {
      const choice = el("label", { class: "pf-choice", for: idFor(field) });
      choice.appendChild(control(field));
      const span = el("span");
      span.innerHTML = labelText(field);
      choice.appendChild(span);
      return choice;
    }
    const group = el("div", {
      class: "pf-choice-group" + (field.inline ? " pf-inline" : "")
    });
    (field.options || []).forEach((opt, i) => {
      const cid = `${idFor(field)}-${i}`;
      const choice = el("label", { class: "pf-choice", for: cid });
      choice.appendChild(
        control(field, { id: cid, value: opt.value, single: true })
      );
      const span = el("span");
      span.textContent = opt.label;
      choice.appendChild(span);
      group.appendChild(choice);
    });
    return group;
  }
  return control(field);
}
function control(field, override = {}) {
  const name = field.name || field.key;
  const id = override.id || idFor(field);
  if (field.type === "select") {
    const sel = el("select", { id, name, class: "pf-select" });
    if (field.placeholder) sel.appendChild(el("option", { value: "" }, field.placeholder));
    (field.options || []).forEach((opt) => {
      sel.appendChild(el("option", { value: opt.value }, opt.label));
    });
    return sel;
  }
  if (field.type === "textarea") {
    const ta = el("textarea", {
      id,
      name,
      class: "pf-textarea",
      rows: String(field.rows || 3),
      ...field.placeholder ? { placeholder: field.placeholder } : {}
    });
    return ta;
  }
  if (field.type === "radio" || field.type === "checkbox") {
    return el("input", {
      type: field.type,
      id,
      name,
      value: override.value != null ? override.value : field.value || "yes"
    });
  }
  const attrs = { type: field.type, id, name, class: "pf-input" };
  if (field.placeholder) attrs.placeholder = field.placeholder;
  if (field.autocomplete) attrs.autocomplete = field.autocomplete;
  if (field.min != null) attrs.min = String(field.min);
  return el("input", attrs);
}
function labelText(field) {
  let html = field.label || "";
  if (field.required) html += ' <span class="pf-req">*</span>';
  else if (field.optionalTag) {
    html += ` <span class="pf-optional">${field.optionalHint || "(optional)"}</span>`;
  }
  return html;
}
function idFor(field) {
  return "pf-" + (field.key || field.name);
}
function el(tag, attrs = {}, text) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null) continue;
    node.setAttribute(k, v);
  }
  if (text != null) node.textContent = text;
  return node;
}
function wrapFragment(frag) {
  const div = document.createElement("div");
  div.appendChild(frag);
  return div;
}

// src/reveal.js
var TESTS = {
  minLen2: (v) => v.trim().length >= 2,
  minLen4: (v) => v.trim().length >= 4,
  nonEmpty: (v) => v.trim().length > 0,
  checked: (_v, elm) => !!(elm && elm.checked)
};
function makeTest(spec) {
  if (!spec) return () => true;
  if (TESTS[spec]) return TESTS[spec];
  if (spec.startsWith("eq:")) {
    const want = spec.slice(3);
    return (v) => v === want;
  }
  if (spec.startsWith("neq:")) {
    const want = spec.slice(4);
    return (v) => v !== "" && v !== want;
  }
  return () => true;
}
function initReveal(schema, fieldEls, { onReveal, onHide, onProgress }) {
  const present = new Set(Object.keys(fieldEls));
  const visible = /* @__PURE__ */ new Set();
  function isRevealWrapper(key) {
    const node = fieldEls[key];
    return node && node.classList.contains("pf-reveal");
  }
  function show(key) {
    const node = fieldEls[key];
    if (!node || !node.classList.contains("pf-reveal")) return;
    if (node.classList.contains("pf-visible")) return;
    node.classList.add("pf-visible");
    visible.add(key);
    onReveal && onReveal(key, node);
    onProgress && onProgress();
  }
  function hide(key) {
    const node = fieldEls[key];
    if (!node || !node.classList.contains("pf-reveal")) return;
    node.classList.remove("pf-visible");
    visible.delete(key);
    onHide && onHide(key, node);
    onProgress && onProgress();
  }
  const byKey = {};
  for (const f of schema.fields) byKey[f.key] = f;
  function resolveTriggerNodes(sourceKey) {
    const wrapper = fieldEls[sourceKey];
    if (wrapper) return wrapper;
    return null;
  }
  for (const field of schema.fields) {
    if (!present.has(field.key)) continue;
    if (!field.reveal) continue;
    if (!isRevealWrapper(field.key)) continue;
    const triggers = (field.reveal.on || []).filter((t) => present.has(t.field));
    const hideSiblings = (field.reveal.hideSiblings || []).filter((k) => present.has(k));
    if (triggers.length === 0) {
      show(field.key);
      continue;
    }
    for (const trig of triggers) {
      const sourceNode = resolveTriggerNodes(trig.field);
      if (!sourceNode) continue;
      const test = makeTest(trig.test);
      const handler = (e) => {
        const target = e.target;
        if (!isFormControl(target)) return;
        const value = controlValue(target);
        if (!test(value, target)) {
          if (isExclusiveTest(trig.test)) hide(field.key);
          return;
        }
        for (const sib of hideSiblings) hide(sib);
        show(field.key);
      };
      sourceNode.addEventListener(trig.event, handler, true);
    }
  }
  return { show, hide, visibleCount: () => visible.size };
}
function isFormControl(elm) {
  return elm && ["INPUT", "SELECT", "TEXTAREA"].includes(elm.tagName);
}
function controlValue(elm) {
  if (elm.type === "checkbox" || elm.type === "radio") return elm.value;
  return elm.value || "";
}
function isExclusiveTest(spec) {
  return typeof spec === "string" && (spec.startsWith("eq:") || spec.startsWith("neq:"));
}

// src/telemetry.js
function createTelemetry(opts) {
  const {
    endpoint,
    formType,
    reactionTiming = true,
    tracker = true,
    trackerBatchMs = 2e3,
    mouseThrottleMs = 40,
    root,
    // scope tracker DOM listeners to the mounted form
    onEvent
  } = opts;
  const base = String(endpoint || "").replace(/\/+$/, "");
  const sessionId = "sess_" + Math.random().toString(36).slice(2, 11);
  const reactionSessionId = Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  const revealTimes = {};
  const reactionLog = [];
  const reactedFields = /* @__PURE__ */ new Set();
  let logSent = false;
  function onFieldRevealed(fieldKey, node) {
    if (!reactionTiming) return;
    revealTimes[fieldKey] = Date.now();
    attachReactionListeners(fieldKey, node);
  }
  function onFieldHidden(fieldKey) {
    delete revealTimes[fieldKey];
    reactedFields.delete(fieldKey);
  }
  function attachReactionListeners(fieldKey, node) {
    const targets = node.querySelectorAll("input, select, textarea, button");
    const EVENTS = ["focus", "mousedown", "touchstart", "change", "input"];
    function onFirst(e) {
      if (reactedFields.has(fieldKey)) return;
      reactedFields.add(fieldKey);
      const now = Date.now();
      const revealedAt = revealTimes[fieldKey];
      const entry = {
        sessionId: reactionSessionId,
        fieldId: node.getAttribute("data-pf-field") || fieldKey,
        revealedAt,
        firstInteractAt: now,
        reactionMs: revealedAt != null ? now - revealedAt : null,
        eventType: e.type,
        triggerElement: e.target.tagName + (e.target.id ? "#" + e.target.id : ""),
        isTrusted: e.isTrusted
      };
      reactionLog.push(entry);
      onEvent && onEvent("reaction", entry);
      targets.forEach((t) => EVENTS.forEach((ev) => t.removeEventListener(ev, onFirst)));
    }
    targets.forEach(
      (t) => EVENTS.forEach((ev) => t.addEventListener(ev, onFirst, { passive: true }))
    );
  }
  function buildReactionPayload() {
    const delays = reactionLog.map((r) => r.reactionMs).filter((n) => n != null);
    const summary = delays.length ? {
      count: delays.length,
      minMs: Math.min(...delays),
      maxMs: Math.max(...delays),
      meanMs: Math.round(delays.reduce((a, b) => a + b, 0) / delays.length),
      medianMs: delays.slice().sort((a, b) => a - b)[Math.floor(delays.length / 2)]
    } : null;
    return {
      sessionId: reactionSessionId,
      submittedAt: Date.now(),
      userAgent: navigator.userAgent,
      formType,
      summary,
      reactions: reactionLog
    };
  }
  function sendReactionLog(useBeacon) {
    if (!reactionTiming || logSent || reactionLog.length === 0) return;
    logSent = true;
    post(base + "/log-interaction", buildReactionPayload(), useBeacon);
  }
  let queue = [];
  let batchTimer = null;
  let lastMouseMove = 0;
  const activeKeys = {};
  const scope = root || document;
  function enqueue(evt) {
    if (!tracker) return;
    queue.push(evt);
  }
  function flushTracker() {
    if (queue.length === 0) return;
    const batch = queue.splice(0, 50);
    post(
      base + "/tracker_endpoint",
      {
        session_id: sessionId,
        formType,
        url: typeof location !== "undefined" ? location.pathname : "",
        events: batch
      },
      false,
      true
      // keepalive
    );
  }
  function trackReveal(fieldKey, node) {
    enqueue({
      type: "field_revealed",
      field_id: node.getAttribute("data-pf-field") || fieldKey,
      timestamp: Date.now()
    });
  }
  function onChange(e) {
    const t = e.target;
    if (!["INPUT", "SELECT", "TEXTAREA"].includes(t.tagName)) return;
    enqueue({
      type: "field_completed",
      field_name: t.name || t.id,
      input_type: t.type,
      timestamp: Date.now()
    });
  }
  function onMouseMove(e) {
    const now = Date.now();
    if (now - lastMouseMove <= mouseThrottleMs) return;
    lastMouseMove = now;
    enqueue({ type: "mouse_move", x: Math.round(e.pageX), y: Math.round(e.pageY), timestamp: now });
  }
  function onMouseDown(e) {
    let btn = "left";
    if (e.button === 1) btn = "middle";
    if (e.button === 2) btn = "right";
    enqueue({
      type: "mouse_click",
      button: btn,
      x: Math.round(e.pageX),
      y: Math.round(e.pageY),
      target_element: e.target.tagName,
      target_id: e.target.id || "",
      is_trusted: e.isTrusted,
      timestamp: Date.now()
    });
  }
  function onInput(e) {
    const t = e.target;
    if (t.tagName !== "INPUT" && t.tagName !== "TEXTAREA") return;
    if (t.type === "password") return;
    enqueue({
      type: "input_capture",
      field_name: t.name || t.id || "unnamed_field",
      value: t.value,
      is_trusted: e.isTrusted,
      timestamp: Date.now()
    });
  }
  function onKeyDown(e) {
    if (e.repeat) return;
    activeKeys[e.code] = Date.now();
  }
  function onKeyUp(e) {
    const start2 = activeKeys[e.code];
    if (!start2) return;
    delete activeKeys[e.code];
    enqueue({
      type: "keypress_dwell_time",
      key: e.code,
      duration_ms: Date.now() - start2,
      is_trusted: e.isTrusted,
      timestamp: Date.now()
    });
  }
  function start() {
    if (tracker) {
      scope.addEventListener("change", onChange, true);
      scope.addEventListener("input", onInput, true);
      scope.addEventListener("keydown", onKeyDown, true);
      scope.addEventListener("keyup", onKeyUp, true);
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mousedown", onMouseDown);
      batchTimer = setInterval(flushTracker, trackerBatchMs);
    }
    window.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
  }
  function onVisibility() {
    if (document.visibilityState === "hidden") {
      sendReactionLog(true);
      flushTracker();
    }
  }
  function onPageHide() {
    sendReactionLog(true);
    flushTracker();
  }
  function onSubmit() {
    sendReactionLog(false);
    flushTracker();
  }
  function destroy() {
    if (batchTimer) clearInterval(batchTimer);
    scope.removeEventListener("change", onChange, true);
    scope.removeEventListener("input", onInput, true);
    scope.removeEventListener("keydown", onKeyDown, true);
    scope.removeEventListener("keyup", onKeyUp, true);
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mousedown", onMouseDown);
    window.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pagehide", onPageHide);
  }
  return {
    start,
    destroy,
    onSubmit,
    // hooks consumed by the reveal engine:
    onReveal: (key, node) => {
      onFieldRevealed(key, node);
      trackReveal(key, node);
    },
    onHide: onFieldHidden,
    sessionId,
    reactionSessionId
  };
}
function post(url, payload, useBeacon, keepalive) {
  const body = JSON.stringify(payload);
  if (useBeacon && navigator.sendBeacon) {
    navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
    return;
  }
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: !!keepalive
  }).catch((err) => console.warn("[panda-forms] telemetry post failed:", err));
}

// src/index.js
var injectedAccent = null;
function injectStyles(accent) {
  const id = "panda-forms-styles-" + accent;
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = buildCss(accent);
  document.head.appendChild(style);
}
function resolveTarget(target) {
  if (typeof target === "string") return document.querySelector(target);
  if (target instanceof Element) return target;
  return null;
}
function mount(target, options = {}) {
  const {
    form = "dynamic",
    fields = null,
    endpoint = "",
    title,
    intro,
    showProgress = true,
    reactionTiming = true,
    tracker = true,
    onSubmit,
    onEvent
  } = options;
  const schema = SCHEMAS[form];
  if (!schema) {
    throw new Error(
      `[panda-forms] unknown form "${form}". Use "pledge" or "dynamic".`
    );
  }
  const host = resolveTarget(target);
  if (!host) {
    throw new Error(`[panda-forms] mount target not found: ${target}`);
  }
  if (!endpoint) {
    console.warn("[panda-forms] no `endpoint` set \u2014 telemetry will POST to the current origin.");
  }
  injectStyles(schema.accent);
  injectedAccent = schema.accent;
  const root = document.createElement("div");
  root.className = "pf-root";
  const h1 = document.createElement("h1");
  h1.className = "pf-title";
  h1.textContent = title || schema.title;
  root.appendChild(h1);
  const p = document.createElement("p");
  p.className = "pf-intro";
  p.textContent = intro || schema.intro;
  root.appendChild(p);
  const { formEl, dotsEl, fieldEls } = renderForm(schema, fields);
  if (showProgress) root.appendChild(dotsEl);
  root.appendChild(formEl);
  const success = document.createElement("div");
  success.className = "pf-success pf-hidden";
  success.textContent = schema.accent === "green" ? "\u2713 Thank you for your pledge! You're helping protect giant pandas. We'll be in touch soon." : "\u2713 Thank you for registering! We will be in touch soon.";
  root.appendChild(success);
  host.appendChild(root);
  const telemetry = createTelemetry({
    endpoint,
    formType: schema.formType,
    reactionTiming,
    tracker,
    root,
    onEvent
  });
  const progress = createProgress(root, dotsEl);
  initReveal(schema, fieldEls, {
    onReveal: telemetry.onReveal,
    onHide: telemetry.onHide,
    onProgress: showProgress ? progress : () => {
    }
  });
  telemetry.start();
  formEl.addEventListener("submit", (e) => {
    e.preventDefault();
    telemetry.onSubmit();
    const values = collectValues(formEl);
    if (typeof onSubmit === "function") {
      try {
        onSubmit(values, { sessionId: telemetry.sessionId });
      } catch (err) {
        console.error("[panda-forms] onSubmit handler threw:", err);
      }
    }
    formEl.style.display = "none";
    if (dotsEl) dotsEl.style.display = "none";
    success.classList.remove("pf-hidden");
  });
  return {
    root,
    formEl,
    destroy() {
      telemetry.destroy();
      root.remove();
    },
    getValues: () => collectValues(formEl)
  };
}
function createProgress(root, dotsEl) {
  if (!dotsEl) return () => {
  };
  return function update() {
    const total = root.querySelectorAll(".pf-reveal").length || 1;
    const visible = root.querySelectorAll(".pf-reveal.pf-visible").length;
    const dots = dotsEl.querySelectorAll(".pf-dot");
    dots.forEach((dot, i) => {
      const threshold = Math.round((i + 1) * total / dots.length);
      dot.classList.toggle("pf-active", visible >= threshold);
    });
  };
}
function collectValues(formEl) {
  const data = new FormData(formEl);
  const out = {};
  for (const [k, v] of data.entries()) {
    if (k in out) {
      out[k] = Array.isArray(out[k]) ? [...out[k], v] : [out[k], v];
    } else {
      out[k] = v;
    }
  }
  return out;
}
var PandaForm = { mount, listFields, forms: Object.keys(SCHEMAS), SCHEMAS };
var index_default = PandaForm;
export {
  PandaForm,
  SCHEMAS,
  index_default as default,
  listFields,
  mount
};
//# sourceMappingURL=panda-forms.esm.js.map
