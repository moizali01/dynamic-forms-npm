/**
 * Declarative field schemas for the two research forms.
 *
 * Each form is a list of fields. A field is either an ordinary input or a
 * "reveal" field that only becomes visible once a trigger condition is met.
 * The renderer turns this into DOM; the reveal engine wires the disclosure
 * logic from the `reveal` descriptors. The whole point is that an installer
 * can pass a subset of field `key`s and everything (rendering + reveal graph)
 * adapts to what survived the filter.
 *
 * Field shape:
 *   key        unique string, what installers pick by
 *   name       form control `name` attribute (payload key)
 *   label      visible label (HTML allowed)
 *   type       'text'|'email'|'tel'|'number'|'date'|'textarea'|
 *              'select'|'radio'|'checkbox'|'note'
 *   required   boolean (enforced only when the field is visible)
 *   optionalTag show the muted "(optional)" style hint
 *   placeholder / autocomplete / help / rows / min  (per type)
 *   options    [{value,label}]  for select/radio/checkbox groups
 *   panel      optional {tone} to wrap the field in a colored callout box
 *   always     true  => visible from the start (not a reveal field)
 *   reveal     {on, when}  => how this field is disclosed (see below)
 *
 * reveal.on is a list of trigger sources:
 *   { field, event, test }
 *     field  key of the field whose input drives this reveal
 *     event  'input' | 'change' | 'focus'
 *     test   optional predicate on the trigger's current value/element
 *   When ANY trigger fires and its test passes, this field is shown.
 *   A field may also declare `hideSiblings` (list of keys) that get hidden
 *   whenever this field's trigger group re-evaluates (radio/select switching).
 */

export const SCHEMAS = {
  pledge: {
    id: 'pledge-form',
    formType: 'pledge-form',
    title: 'Panda Support Pledge',
    intro:
      "Pledge your support for giant panda conservation. Fill in your details and we'll tailor the form to your chosen way of helping.",
    accent: 'green',
    fields: [
      {
        key: 'full_name',
        name: 'full_name',
        label: 'Full Name',
        type: 'text',
        required: true,
        autocomplete: 'name',
        placeholder: 'Jane Doe',
        always: true,
      },
      {
        key: 'email',
        name: 'email',
        label: 'Email Address',
        type: 'email',
        required: true,
        autocomplete: 'email',
        placeholder: 'jane@example.com',
        reveal: { on: [{ field: 'full_name', event: 'input', test: 'minLen2' }] },
      },
      {
        key: 'phone',
        name: 'phone',
        label: 'Phone Number',
        type: 'tel',
        optionalTag: true,
        autocomplete: 'tel',
        placeholder: '+1 (555) 000-0000',
        help: "We only call if there's an urgent update about your pledge.",
        reveal: { on: [{ field: 'email', event: 'input', test: 'minLen4' }] },
      },
      {
        key: 'support_type',
        name: 'support_type',
        label: 'How would you like to support panda conservation?',
        type: 'radio',
        required: true,
        options: [
          { value: 'donate', label: 'Make a Donation' },
          { value: 'adopt', label: 'Virtual Adoption' },
          { value: 'awareness', label: 'Spread Awareness' },
          { value: 'research', label: 'Fund Research' },
        ],
        reveal: {
          on: [
            { field: 'phone', event: 'input' },
            { field: 'phone', event: 'focus' },
          ],
        },
      },
      {
        key: 'donation_amount',
        name: 'donation_amount',
        label: 'Choose a donation amount',
        type: 'radio',
        panel: { tone: 'green' },
        options: [
          { value: '10', label: '$10' },
          { value: '25', label: '$25' },
          { value: '50', label: '$50' },
          { value: 'custom', label: 'Custom' },
        ],
        reveal: {
          hideSiblings: ['adopt_panda', 'awareness_platforms', 'research_area'],
          on: [{ field: 'support_type', event: 'change', test: "eq:donate" }],
        },
      },
      {
        key: 'custom_amount',
        name: 'custom_amount',
        label: 'Enter your amount (USD)',
        type: 'number',
        min: 1,
        placeholder: 'e.g. 75',
        reveal: { on: [{ field: 'donation_amount', event: 'change', test: 'eq:custom' }] },
      },
      {
        key: 'adopt_panda',
        name: 'panda',
        label: 'Choose a panda to virtually adopt',
        type: 'radio',
        panel: { tone: 'amber' },
        options: [
          { value: 'bao_bao', label: 'Bao Bao — 11 yrs, female' },
          { value: 'bei_bei', label: 'Bei Bei — 9 yrs, male' },
          { value: 'xiao_qi_ji', label: 'Xiao Qi Ji — 5 yrs, male' },
          { value: 'mei_xiang', label: 'Mei Xiang — 26 yrs, female' },
        ],
        reveal: {
          hideSiblings: ['donation_amount', 'awareness_platforms', 'research_area'],
          on: [{ field: 'support_type', event: 'change', test: 'eq:adopt' }],
        },
      },
      {
        key: 'awareness_platforms',
        name: 'platform',
        label: 'Which platforms will you share on?',
        type: 'checkbox',
        panel: { tone: 'blue' },
        options: [
          { value: 'instagram', label: 'Instagram' },
          { value: 'twitter', label: 'X / Twitter' },
          { value: 'tiktok', label: 'TikTok' },
          { value: 'facebook', label: 'Facebook' },
          { value: 'youtube', label: 'YouTube' },
          { value: 'linkedin', label: 'LinkedIn' },
        ],
        extra: {
          key: 'social_handle',
          name: 'social_handle',
          label: 'Your primary handle or profile link',
          type: 'text',
          placeholder: '@pandafan or https://...',
        },
        reveal: {
          hideSiblings: ['donation_amount', 'adopt_panda', 'research_area'],
          on: [{ field: 'support_type', event: 'change', test: 'eq:awareness' }],
        },
      },
      {
        key: 'research_area',
        name: 'research_area',
        label: 'Which research area do you want to fund?',
        type: 'radio',
        panel: { tone: 'purple' },
        options: [
          { value: 'habitat', label: 'Habitat Restoration' },
          { value: 'breeding', label: 'Breeding Programs' },
          { value: 'health', label: 'Veterinary Health' },
          { value: 'climate', label: 'Climate Impact Studies' },
        ],
        reveal: {
          hideSiblings: ['donation_amount', 'adopt_panda', 'awareness_platforms'],
          on: [{ field: 'support_type', event: 'change', test: 'eq:research' }],
        },
      },
      {
        key: 'frequency',
        name: 'frequency',
        label: 'How often would you like to contribute?',
        type: 'radio',
        required: true,
        options: [
          { value: 'once', label: 'One-time' },
          { value: 'monthly', label: 'Monthly' },
          { value: 'quarterly', label: 'Quarterly' },
          { value: 'annually', label: 'Annually' },
        ],
        // Revealed once the user interacts with any support-detail panel.
        reveal: {
          on: [
            { field: 'donation_amount', event: 'change' },
            { field: 'custom_amount', event: 'input' },
            { field: 'adopt_panda', event: 'change' },
            { field: 'awareness_platforms', event: 'change' },
            { field: 'social_handle', event: 'input' },
            { field: 'research_area', event: 'change' },
          ],
        },
      },
      {
        key: 'recurring_note',
        name: 'billing_address',
        label: 'Billing Address',
        type: 'text',
        autocomplete: 'street-address',
        placeholder: '123 Main St, City, State, ZIP',
        note: {
          tone: 'yellow',
          html:
            "<strong>Recurring pledge selected.</strong> We'll send a reminder before each charge and you can cancel at any time. Please verify your billing address below.",
        },
        reveal: { on: [{ field: 'frequency', event: 'change', test: 'neq:once' }] },
      },
      {
        key: 'motivation',
        name: 'motivation',
        label: 'What inspires you to support panda conservation?',
        type: 'textarea',
        rows: 3,
        placeholder: 'Share your story or reason…',
        reveal: { on: [{ field: 'frequency', event: 'change' }] },
      },
      {
        key: 'referral',
        name: 'referral',
        label: 'How did you hear about us?',
        type: 'radio',
        options: [
          { value: 'friend', label: 'Friend or Family' },
          { value: 'social', label: 'Social Media' },
          { value: 'search', label: 'Search Engine' },
          { value: 'event', label: 'Event / Conference' },
          { value: 'news', label: 'News Article' },
        ],
        reveal: { on: [{ field: 'frequency', event: 'change' }] },
      },
      {
        key: 'friend_name',
        name: 'friend_name',
        label: "Friend's Name",
        optionalTag: true,
        optionalHint: '(optional, for referral credit)',
        type: 'text',
        placeholder: 'e.g. Alex Smith',
        reveal: {
          hideSiblings: ['ref_handle'],
          on: [{ field: 'referral', event: 'change', test: 'eq:friend' }],
        },
      },
      {
        key: 'ref_handle',
        name: 'ref_handle',
        label: 'Which account or post led you here?',
        type: 'text',
        placeholder: '@username or post link',
        reveal: {
          hideSiblings: ['friend_name'],
          on: [{ field: 'referral', event: 'change', test: 'eq:social' }],
        },
      },
      {
        key: 'newsletter',
        name: 'newsletter',
        label:
          'Sign me up for the <strong>Panda Dispatch</strong> newsletter — monthly updates on conservation wins, new pandas born, and how your pledge is making a difference.',
        type: 'checkbox',
        single: true,
        value: 'yes',
        reveal: { on: [{ field: 'referral', event: 'change' }] },
      },
      {
        key: 'newsletter_topics',
        name: 'topic',
        label: 'Which topics interest you most?',
        type: 'checkbox',
        options: [
          { value: 'research', label: 'Research Updates' },
          { value: 'cubs', label: 'New Cub Announcements' },
          { value: 'events', label: 'Upcoming Events' },
          { value: 'impact', label: 'Impact Reports' },
        ],
        reveal: { on: [{ field: 'newsletter', event: 'change', test: 'checked' }] },
      },
      {
        key: 'additional_comments',
        name: 'additional_comments',
        label: 'Additional Comments',
        type: 'textarea',
        required: true,
        rows: 3,
        placeholder: 'Any final thoughts...',
        reveal: { on: [{ field: 'referral', event: 'change' }] },
      },
    ],
  },

  dynamic: {
    id: 'dynamic-form',
    formType: 'dynamic-form',
    title: 'Panda Conservation Registration',
    intro:
      'Fill out the form below to register as a panda conservation volunteer. Fields will appear as you make selections.',
    accent: 'blue',
    fields: [
      {
        key: 'full_name',
        name: 'full_name',
        label: 'Full Name',
        type: 'text',
        required: true,
        placeholder: 'Jane Doe',
        always: true,
      },
      {
        key: 'email',
        name: 'email',
        label: 'Email Address',
        type: 'email',
        required: true,
        autocomplete: 'email',
        placeholder: 'jane@example.com',
        reveal: { on: [{ field: 'full_name', event: 'input', test: 'minLen2' }] },
      },
      {
        key: 'country',
        name: 'country',
        label: 'Country of Residence',
        type: 'select',
        required: true,
        placeholder: '— Select a country —',
        options: [
          { value: 'US', label: 'United States' },
          { value: 'CA', label: 'Canada' },
          { value: 'GB', label: 'United Kingdom' },
          { value: 'AU', label: 'Australia' },
          { value: 'CN', label: 'China' },
          { value: 'IN', label: 'India' },
          { value: 'DE', label: 'Germany' },
          { value: 'FR', label: 'France' },
          { value: 'other', label: 'Other' },
        ],
        reveal: { on: [{ field: 'email', event: 'input', test: 'minLen4' }] },
      },
      {
        key: 'us_state',
        name: 'us_state',
        label: 'State',
        required: true,
        type: 'select',
        placeholder: '— Select a state —',
        options: usStates(),
        reveal: {
          hideSiblings: ['us_city', 'ca_province', 'other_country'],
          on: [{ field: 'country', event: 'change', test: 'eq:US' }],
        },
      },
      {
        key: 'us_city',
        name: 'us_city',
        label: 'City',
        type: 'text',
        placeholder: 'Enter your city',
        reveal: { on: [{ field: 'us_state', event: 'change', test: 'nonEmpty' }] },
      },
      {
        key: 'ca_province',
        name: 'ca_province',
        label: 'Province / Territory',
        required: true,
        type: 'select',
        placeholder: '— Select a province —',
        options: caProvinces(),
        reveal: {
          hideSiblings: ['us_state', 'us_city', 'other_country'],
          on: [{ field: 'country', event: 'change', test: 'eq:CA' }],
        },
      },
      {
        key: 'other_country',
        name: 'other_country',
        label: 'Please specify your country',
        type: 'text',
        placeholder: 'Your country',
        reveal: {
          hideSiblings: ['us_state', 'us_city', 'ca_province'],
          on: [{ field: 'country', event: 'change', test: 'eq:other' }],
        },
      },
      {
        key: 'role',
        name: 'role',
        label: 'Volunteer Role',
        required: true,
        type: 'select',
        placeholder: '— What would you like to do? —',
        options: [
          { value: 'field', label: 'Field Research' },
          { value: 'education', label: 'Public Education' },
          { value: 'fundraising', label: 'Fundraising' },
          { value: 'remote', label: 'Remote / Online Support' },
        ],
        reveal: { on: [{ field: 'country', event: 'change', test: 'nonEmpty' }] },
      },
      {
        key: 'field_research',
        type: 'group',
        panel: { tone: 'amber' },
        label: 'Field Research requires travel to China. Please provide travel details.',
        children: [
          { key: 'passport', name: 'passport', label: 'Passport Number', type: 'text', placeholder: 'e.g. A12345678' },
          { key: 'travel_date', name: 'travel_date', label: 'Earliest Available Travel Date', type: 'date' },
        ],
        reveal: {
          hideSiblings: ['education', 'fundraising', 'remote'],
          on: [{ field: 'role', event: 'change', test: 'eq:field' }],
        },
      },
      {
        key: 'education',
        type: 'group',
        panel: { tone: 'blue' },
        label: 'Tell us about your education background.',
        children: [
          {
            key: 'edu_level',
            name: 'edu_level',
            label: 'Highest Education Level',
            type: 'select',
            placeholder: '— Select —',
            options: [
              { value: 'hs', label: 'High School / GED' },
              { value: 'assoc', label: 'Associate Degree' },
              { value: 'bachelor', label: "Bachelor's Degree" },
              { value: 'master', label: "Master's Degree" },
              { value: 'doctorate', label: 'Doctorate' },
            ],
          },
          {
            key: 'languages',
            name: 'languages',
            label: 'Languages Spoken (comma-separated)',
            type: 'text',
            placeholder: 'e.g. English, Mandarin, Spanish',
          },
        ],
        reveal: {
          hideSiblings: ['field_research', 'fundraising', 'remote'],
          on: [{ field: 'role', event: 'change', test: 'eq:education' }],
        },
      },
      {
        key: 'fundraising',
        name: 'channel',
        type: 'checkbox',
        panel: { tone: 'green' },
        label: 'Preferred fundraising channel',
        options: [
          { value: 'social_media', label: 'Social Media' },
          { value: 'events', label: 'In-Person Events' },
          { value: 'email', label: 'Email Campaigns' },
          { value: 'corporate', label: 'Corporate Sponsorships' },
        ],
        reveal: {
          hideSiblings: ['field_research', 'education', 'remote'],
          on: [{ field: 'role', event: 'change', test: 'eq:fundraising' }],
        },
      },
      {
        key: 'remote',
        name: 'remote_skill',
        type: 'select',
        panel: { tone: 'purple' },
        label: 'Primary Skill',
        placeholder: '— Select a skill —',
        options: [
          { value: 'web', label: 'Web Development' },
          { value: 'design', label: 'Graphic Design' },
          { value: 'writing', label: 'Content Writing' },
          { value: 'data', label: 'Data Analysis' },
          { value: 'social', label: 'Social Media Management' },
        ],
        reveal: {
          hideSiblings: ['field_research', 'education', 'fundraising'],
          on: [{ field: 'role', event: 'change', test: 'eq:remote' }],
        },
      },
      {
        key: 'availability',
        name: 'availability',
        label: 'Weekly Availability',
        type: 'radio',
        required: true,
        inline: true,
        options: [
          { value: 'lt5', label: 'Less than 5 hrs' },
          { value: '5to10', label: '5–10 hrs' },
          { value: '10to20', label: '10–20 hrs' },
          { value: 'fulltime', label: 'Full-time' },
        ],
        reveal: { on: [{ field: 'role', event: 'change', test: 'nonEmpty' }] },
      },
      {
        key: 'fulltime_note',
        name: 'phone',
        label: 'Phone Number',
        type: 'tel',
        placeholder: '+1 (555) 000-0000',
        note: {
          tone: 'yellow',
          html:
            '<strong>Full-time commitment detected.</strong> A coordinator will reach out within 3 business days to discuss contract terms. Please provide a phone number for faster communication.',
        },
        reveal: { on: [{ field: 'availability', event: 'change', test: 'eq:fulltime' }] },
      },
      {
        key: 'referral',
        name: 'referral',
        label: 'How did you hear about us?',
        type: 'select',
        placeholder: '— Select —',
        options: [
          { value: 'social', label: 'Social Media' },
          { value: 'friend', label: 'A Friend' },
          { value: 'search', label: 'Search Engine' },
          { value: 'news', label: 'News Article' },
          { value: 'event', label: 'Event / Conference' },
        ],
        reveal: { on: [{ field: 'role', event: 'change', test: 'nonEmpty' }] },
      },
      {
        key: 'social_platform',
        name: 'social_platform',
        label: 'Which platform?',
        type: 'select',
        placeholder: '— Select —',
        options: [
          { value: 'instagram', label: 'Instagram' },
          { value: 'twitter', label: 'X (Twitter)' },
          { value: 'facebook', label: 'Facebook' },
          { value: 'tiktok', label: 'TikTok' },
          { value: 'youtube', label: 'YouTube' },
          { value: 'linkedin', label: 'LinkedIn' },
        ],
        reveal: {
          hideSiblings: ['friend_name'],
          on: [{ field: 'referral', event: 'change', test: 'eq:social' }],
        },
      },
      {
        key: 'friend_name',
        name: 'friend_name',
        label: "Friend's Name",
        optionalTag: true,
        optionalHint: '(optional, for referral credit)',
        type: 'text',
        placeholder: 'e.g. Alex Smith',
        reveal: {
          hideSiblings: ['social_platform'],
          on: [{ field: 'referral', event: 'change', test: 'eq:friend' }],
        },
      },
      {
        key: 'newsletter',
        name: 'newsletter',
        label:
          'Subscribe me to the monthly <strong>Panda Dispatch</strong> newsletter with conservation updates and volunteer stories.',
        type: 'checkbox',
        single: true,
        value: 'yes',
        reveal: { on: [{ field: 'availability', event: 'change' }] },
      },
      {
        key: 'newsletter_freq',
        name: 'newsletter_freq',
        label: 'How often would you like to hear from us?',
        type: 'select',
        placeholder: '— Select frequency —',
        options: [
          { value: 'weekly', label: 'Weekly' },
          { value: 'biweekly', label: 'Bi-weekly' },
          { value: 'monthly', label: 'Monthly' },
        ],
        reveal: { on: [{ field: 'newsletter', event: 'change', test: 'checked' }] },
      },
      {
        key: 'comments',
        name: 'comments',
        label: 'Any additional comments or questions?',
        type: 'textarea',
        required: true,
        rows: 3,
        placeholder: "Tell us anything else you'd like us to know.",
        reveal: { on: [{ field: 'availability', event: 'change' }] },
      },
    ],
  },
};

function usStates() {
  return [
    'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming',
  ].map((s) => ({ value: s, label: s }));
}

function caProvinces() {
  return [
    'Alberta','British Columbia','Manitoba','New Brunswick','Newfoundland and Labrador','Northwest Territories','Nova Scotia','Nunavut','Ontario','Prince Edward Island','Quebec','Saskatchewan','Yukon',
  ].map((p) => ({ value: p, label: p }));
}

/** List selectable field keys for a form — used by config UIs / docs. */
export function listFields(formName) {
  const schema = SCHEMAS[formName];
  if (!schema) return [];
  return schema.fields.map((f) => ({
    key: f.key,
    label: stripTags(typeof f.label === 'string' ? f.label : f.key),
    type: f.type,
    required: !!f.required,
    always: !!f.always,
  }));
}

function stripTags(s) {
  return String(s).replace(/<[^>]*>/g, '').trim();
}
