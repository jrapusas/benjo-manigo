# Visual Image System — ACME Consulting

**Last updated:** 2026-09-19  
**Status:** active  
**Master reference:** `docs/images/references/master-hero-home.jpg`

## Visual Direction

- **Concept:** Calm authority inside growing professional services firms — strategy and operations made tangible in real rooms.
- **Medium:** photographic
- **Realism level:** photoreal editorial
- **Sophistication:** premium B2B consultancy
- **Emotional tone:** approachable expertise, clarity, partnership

## Project anchors

- **Visual Anchor:** photoreal editorial, 35mm lens, shallow depth of field, natural grain, eye-level or slight three-quarter camera
- **Brand Anchor:** cool daylight, navy + cream + soft teal accents, walnut and light oak surfaces, glass and plants, Sydney CBD hints through windows when exterior visible
- **Reality Anchor:** advisory workshops, partner meetings, legal/accounting/advisory firm contexts; laptops and paper with structure but no readable client names, logos, or statistics

## Recurring Visual Motifs

- Glass-walled meeting rooms with city daylight
- Sticky-note walls and whiteboards with illegible structure (color blocks only)
- Navy folders, cream paper, matte ceramic mugs
- Same office family across heroes and gallery — not identical room every shot

## Image Output

- **Aspect ratios:** generate **4:3** for almost all photo slots; **1:1** for team and testimonial avatars
- **Crop strategy:** center-weight subjects inside ~60% of frame; edges are soft environment
- **Art-directed mobile variants:** not needed by default; mark a slot `Required` only when a meaningful center crop cannot work
- **Resolution:** native generated; Astro emits WebP at build
- **Source:** JPEG ~92 in `src/content/media/<slug>/file.jpg`

## Consistency Rules (MUST stay constant)

- Cool window daylight, soft shadows, no orange sunset grade
- No baked vignettes, gradients, or scrims in pixels — CSS handles overlays
- No readable text, logos, watermarks, or invented company names on documents/screens
- People are distinct individuals; team cast IDs recur consistently
- Straight photographs only

## Element Kit

| Kind | Items |
|------|--------|
| Surfaces | walnut desk, light oak table, off-white walls |
| Light | tall windows, Sydney CBD bokeh optional |
| Props | navy folders, sticky notes, laptops (screens blurred or abstract UI) |
| Wardrobe | muted navy, cream, soft teal; no logos |

## Information Surfaces

| Surface | ACME policy |
|---------|-------------|
| Paper/forms | Cream or white paper, dense monochrome illegible structure; no readable client names, statistics, or claims |
| Screens | Abstract UI panels and chart silhouettes; no readable names, URLs, or metrics |
| Whiteboards/easels | Framework structure, arrows, and grouped shapes in navy, teal, and neutral marker colors; no readable generated text |
| Sticky notes/priority cards | Purposeful cream, pale teal, or muted blue clusters; blank or illegible marks only |
| Signage/packaging | No invented branding or readable text; supplied authorized material only |

Paper's monochrome rule does not apply to whiteboards, sticky notes, or priority cards.

## Cast

| ID | Name (content) | Look | Recurs |
|----|----------------|------|--------|
| T1 | Catherine Reed | Woman, late 40s, short dark brown hair, navy blazer, warm but direct | team-1, workshops |
| T2 | Daniel Cho | Man, early 40s, black hair, glasses optional, cream shirt, navy jacket | team-2, workshops |
| T3 | Amara Osei | Woman, mid 30s, natural hair pulled back, teal accent blouse, navy | team-3, workshops |
| C1 | Testimonial client | Woman, 50s, silver-streak hair, professional | testimonial-1 |
| C2 | Testimonial client | Man, 45, beard, grey suit | testimonial-2 |
| C3 | Testimonial client | Woman, 40s, East Asian, burgundy top | testimonial-3 |

## People Families

- Portrait slots may show one person.
- Workshops may use standing groups, circles, or board presentations.
- Walking scenes are allowed when named in the slot registry.
- Seated meeting layouts use normal conversational distance, but ACME has no mandatory S1–S8 seating matrix.

## Prompt Anchor

> Photoreal editorial photograph in a contemporary Australian professional services office, cool soft daylight from tall windows, navy cream and soft teal palette, walnut desk or light oak table, shallow depth of field, 35mm lens look, natural skin tones, no visible logos or readable text on documents or screens, straight photograph without vignette or color overlay.

## Slot Registry (photo slugs)

| Slug | Role | Scene one-liner | Ratio |
|------|------|-----------------|-------|
| hero-home | Hero | Advisors standing at tall counter, laptops open, engaged discussion | 4:3 |
| about-hero | Hero | Wide office floor with glass walls and city daylight, subtle human presence | 4:3 |
| services-hero | Hero | Strategy workshop wall with sticky-note clusters, facilitator gesturing | 4:3 |
| contact-hero | Hero | Welcoming meeting room set for conversation, two chairs angled | 4:3 |
| case-studies-hero | Hero | Partners reviewing materials together, partnership tone | 4:3 |
| careers-hero | Hero | Energetic team stand-up near whiteboard, inclusive group | 4:3 |
| team-collaboration | Section | Three cast standing around mobile whiteboard easel | 4:3 |
| planning-workshop | Section | Facilitators at whiteboard easel with sticky notes, no table | 4:3 |
| principles | Section | Team in circle holding colored priority cards (values alignment) | 4:3 |
| client-journey | Section | Consultant walking with client through bright corridor, listening | 4:3 |
| client-hero | Editorial | Client welcome lounge, calm seating, plants | 4:3 |
| client-experience | Blog | Client meeting, eye contact, notebook on table | 4:3 |
| operations | Blog | Operations mapping on glass wall, markers, focused work | 4:3 |
| partner-alignment | Blog | Two partners at small table, candid alignment talk | 4:3 |
| strategic-planning | Blog | Wall of frameworks, team standing back reviewing | 4:3 |
| quarterly-planning | Blog | Quarter columns on whiteboard, consultant pointing, colleague on stool | 4:3 |
| pricing-strategy | Blog | Pricing discussion, chart on laptop screen blurred | 4:3 |
| team-1 | Card | Catherine Reed headshot | 1:1 |
| team-2 | Card | Daniel Cho headshot | 1:1 |
| team-3 | Card | Amara Osei headshot | 1:1 |
| testimonial-1 | Card | C1 headshot | 1:1 |
| testimonial-2 | Card | C2 headshot | 1:1 |
| testimonial-3 | Card | C3 headshot | 1:1 |
| gallery-1 | Card | Partner workshop Sydney office | 4:3 |
| gallery-2 | Card | Operations mapping on wall whiteboard with legal firm leaders | 4:3 |
| gallery-3 | Card | Semicircle lounge review of roadmap (not table seating) | 4:3 |
| case-study-1 | Card | Simple alignment workshop moment, tight crop | 1:1 |
| case-study-2 | Card | Delivery timeline whiteboard gesture | 1:1 |
| case-study-3 | Card | Client onboarding document handoff at reception | 1:1 |

**Out of scope for photo regeneration:** `logo-client-*`, `icon-*` (SVG).

## Lessons

| Class | Lesson |
|-------|--------|
| PROJECT_RULE | ACME = professional services advisory, not generic corporate stock |
| UNIVERSAL_RULE | Center-weight for multi-ratio crops |
| GENERATION_LESSON | Differentiate similar slots by posture (stand vs lounge vs whiteboard) not only room |
| GENERATION_LESSON | For board scenes, show structured colored clusters without generated readable labels |
| PROJECT_RULE | UI icons use **Icon library** catalog ids (`strategy`, `package`, …) — not Media Library SVGs |
