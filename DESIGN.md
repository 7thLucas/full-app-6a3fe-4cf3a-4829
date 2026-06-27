# PostPilot — Design Guidelines

## Design Philosophy
Clean, calm, and functional. Store owners should feel like the app is doing the hard work for them. Every screen should feel effortless to use — no clutter, no confusion.

## Color Palette
- Primary: Indigo (#4F46E5) — trust, automation, reliability
- Primary light: #EEF2FF — soft background tints
- Accent: Emerald (#10B981) — connected, active, success states
- Danger: Rose (#F43F5E) — errors, disconnected, failed posts
- Neutral background: #F9FAFB (gray-50)
- Card background: #FFFFFF
- Text primary: #111827 (gray-900)
- Text secondary: #6B7280 (gray-500)
- Border: #E5E7EB (gray-200)

## Typography
- Font family: Inter (Google Fonts)
- Headings: font-weight 700, tight tracking
- Body: font-weight 400, comfortable line-height (1.6)
- Labels/captions: font-weight 500, uppercase small caps for section labels

## Elevation & Shadows
- Cards: subtle shadow — shadow-sm (box-shadow: 0 1px 3px rgba(0,0,0,0.08))
- Modals/dropdowns: shadow-lg
- No harsh outlines — rely on shadow + background contrast

## Components

### Navigation
- Left sidebar (desktop) or bottom tab bar (mobile)
- Sections: Dashboard, Products, Platforms, Schedule, History
- Active state: indigo background pill, white text

### Buttons
- Primary: indigo filled, white text, rounded-lg, px-4 py-2
- Secondary: white with gray border
- Destructive: rose filled or rose-outlined
- Icon buttons: ghost style with hover tint

### Cards
- White background, rounded-xl, shadow-sm, p-5 or p-6
- Platform connection cards: show platform icon/logo, name, connected badge or "Connect" CTA

### Forms
- Inputs: rounded-lg border, focus ring in indigo, clean labels above
- Image upload: drag-and-drop zone with dashed border

### Status Badges
- Connected / Success: emerald background, white text
- Disconnected / Failed: rose background, white text
- Pending / Scheduled: amber background, white text

### Post Preview Card
- Mimics a social media post card
- Product image top, caption below
- Rounded corners, shadow, indigo accent border on left side

## Spacing
- Base unit: 4px
- Section padding: 24px–32px
- Card gap: 16px
- Form field gap: 12px–16px

## Responsive Behavior
- Desktop-first layout with sidebar nav
- Gracefully adapts to tablet and mobile (collapse sidebar, bottom nav)
