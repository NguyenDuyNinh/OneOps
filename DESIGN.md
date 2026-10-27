# OneOps Design System

**Version:** 1.0 · **Updated:** 2026-10-27 · **Scope:** `apps/web` (admin, employee, auth) · **Stack:** Next.js App Router, React 19, Tailwind CSS v4 (CSS-first)

> This is the **visual contract** for OneOps. `AGENTS.md` decides *where code lives*; `CLEANCODE.md` decides *how code is written*; [`skill.md`](./skill.md) decides *how to run a design task*. This file decides **what the interface looks like and how it behaves**.
>
> Grounded in the current code (`globals.css`, `_template/ui`, `admin/users`, `app-shell`) and the four design skills summarized in `skill.md` §17. Where the code and this file disagree, §1.4 applies.

### Read by task

| Your task | Read |
|---|---|
| Choose colors, type, spacing, radius, elevation | §3–§6 |
| Build or change the app shell / navigation | §7 |
| Build or copy a component | §8 |
| Build a page (list, form, detail, auth, employee) | §9 |
| Handle loading / empty / error / permission | §10 |
| Write UI copy or format data | §11 |
| Check accessibility / responsive | §12–§13 |
| Write the code / hand off to an AI | §14–§15 |
| Fix a known template issue | §16 |
| Ship | §17 |
| Change the system itself | §18 |

Do not read the whole file for a one-line change. Use this table.

### At a glance

| Topic | Standard |
|---|---|
| Accent | `brand-500`; one per screen |
| Type | Be Vietnam Pro; `text-theme-sm` 14/20 body; `text-xl` / `text-theme-xl` 20 page title |
| Space | 4/8 grid; page padding 12/16; section gap 24; field gap 16 |
| Shape | 8 control, 12 nested, 16 panel, 24 modal, full pill |
| Surface | `bg-gray-50` / `bg-white`; `dark:bg-gray-900` / `dark:bg-white/[0.03]` |
| Depth | borders by default; shadows only for floating layers |
| States | default, hover, focus-visible, active, disabled, loading, error, empty |
| Focus | border/background change + ring; two-ring for solid buttons |

---

## 1. Purpose and authority

### 1.1 What this file is for

Any human or AI implementing UI must be able to read this file and produce a screen that is **visually indistinguishable in system terms** from the rest of OneOps: same tokens, same density, same component shapes, same states, same copy voice.

It is normative. "Looks fine to me" is not a reason to deviate. If a rule is wrong, change the rule (§18), then change the code.

### 1.2 Precedence

1. Explicit user brief.
2. `AGENTS.md` (boundaries, ownership) and `CLEANCODE.md` (code rules).
3. **This file** (visual/UX contract).
4. `skill.md` (process, critique, commands).
5. Framework/library defaults.

A hard accessibility or architecture violation may override a brief, but you must say why.

### 1.3 Non-negotiable invariants

1. Tokens only. **No raw hex/rgb in TSX.**
2. No `tailwind.config.*`. Tailwind v4 tokens live in `apps/web/src/app/globals.css`.
3. One font family: Be Vietnam Pro.
4. One visual language across admin, employee and auth — different density, never a different system.
5. Every interactive element has default, hover, focus-visible, active, disabled, loading (where async) and error (where input) states.
6. Every data view has loading, empty, error and permission states.
7. No cross-module UI imports. Copy `_template/ui` into `<module>/ui/`.
8. `ThemeProvider` is mounted once, in `app/layout.tsx`.
9. Never hand-edit `features/<surface>/navigation/generated.ts`.
10. Accessibility is a merge gate, not a polish step.

### 1.4 Source of truth

| Concern | File |
|---|---|
| Color, type, shadow, z-index tokens; global base rules | `apps/web/src/app/globals.css` |
| Font loading, single `ThemeProvider` | `apps/web/src/app/layout.tsx` |
| Canonical component copies | `apps/web/src/features/_template/ui/` |
| App shell | `apps/web/src/features/admin/app-shell/` |
| Best current list-screen example | `apps/web/src/features/admin/users/` |
| Auth pattern | `apps/web/src/features/auth/SignInForm.tsx`, `features/auth/ui/` |
| HTTP client | `apps/web/src/features/auth/lib/api-client.ts` |

When this document and the code disagree, **the code is the current state and this document is the target**. Fix the drift deliberately; do not silently follow either.

---

## 2. Design principles

1. **Operate, not perform.** The user is at work. Optimize for scan speed, certainty and completion.
2. **Density is respect.** Show more real information per viewport; spend space on content, not decoration.
3. **Structure with borders, not shadows.** Shadows are for things that float.
4. **One accent, one primary action.** Brand color marks action, selection and current state — nothing else.
5. **Quiet surfaces, loud data.** Neutrals carry the layout; color carries meaning.
6. **Predictable beats novel.** A familiar pattern used consistently is better than a clever pattern used once.
7. **Every state is designed.** Empty, loading, error and permission are part of the screen, not edge cases.
8. **Copy is interface.** Labels, errors and empty states do real work.
9. **Motion explains change.** If it explains nothing, remove it.
10. **Delete test.** If removing an element does not make the screen worse, remove it.

### 2.1 The 3-second test

On any screen, a user must answer within three seconds:

- **Where am I?** → page title + active navigation.
- **What can I do?** → one clear primary action.
- **What just happened?** → persistent feedback near the action.

### 2.2 The "product slop" test

Someone who has used a similar admin product must be able to use the screen immediately. If they pause because a button is over-decorated, a control does not match its label, motion is distracting, or a display font appears in a form — that is strangeness without purpose, not personality.

---

## 3. Color

### 3.1 Palette (reference values; always use classes)

| Role | Token | Value | Use for | Do not use for |
|---|---|---|---|---|
| Brand | `brand-500` | `#465fff` | Primary CTA, active nav, selection, focus border | Large backgrounds, long text |
| Brand hover | `brand-600` | `#3641f5` | Hover/pressed primary | Resting surfaces |
| Brand disabled | `brand-300` | `#9cb9ff` | Disabled primary | Text on light |
| Brand tint | `brand-50` / `brand-100` | `#ecf3ff` / `#dde9ff` | Active nav bg, selected row, subtle highlight | Body text |
| Brand dark text | `brand-400` | `#7592ff` | Brand-colored text in dark mode | Light-mode text |
| Neutral | `white`, `gray-25…950` | — | Surfaces, text, borders, dividers | Mixing warm/cool grays |
| Success | `success-500` / `600` | `#12b76a` / `#039855` | Completed, approved, on time | Decorative accents |
| Warning | `warning-500` / `600` | `#f79009` / `#dc6803` | Pending, due soon, caution | Destructive errors |
| Error | `error-500` / `600` | `#f04438` / `#d92d20` | Failure, destructive, overdue | Emphasis, decoration |
| Info | `blue-light-500` | `#0ba5ec` | Informational alert, info badge | Primary action |
| Data/category | `blue-light`, `orange`, `theme-pink`, `theme-purple` | — | Chart series, category chips | Primary/secondary actions |

### 3.2 Semantic class map

| Meaning | Light | Dark |
|---|---|---|
| Page canvas | `bg-gray-50` | `dark:bg-gray-900` |
| Panel / card surface | `bg-white` | `dark:bg-white/[0.03]` |
| Shell chrome (header, rail, panel, modal) | `bg-white` | `dark:bg-gray-900` |
| Panel border | `border-gray-200` | `dark:border-gray-800` |
| Inner divider | `border-gray-100` | `dark:border-white/[0.05]` |
| Hover surface | `hover:bg-gray-50` | `dark:hover:bg-white/[0.02]` |
| Hover surface (control) | `hover:bg-gray-100` | `dark:hover:bg-white/5` |
| Primary text | `text-gray-800` | `dark:text-white/90` |
| Secondary text | `text-gray-500` | `dark:text-gray-400` |
| Tertiary / meta | `text-gray-500` | `dark:text-gray-400` |
| Disabled / decorative | `text-gray-400` | `dark:text-white/30` |
| Placeholder | `placeholder:text-gray-500` | `dark:placeholder:text-gray-400` |
| Control border | `border-gray-300` | `dark:border-gray-700` |
| Selected nav | `bg-brand-50 text-brand-500` | `dark:bg-brand-500/[0.12] dark:text-brand-400` |
| Selected row | `bg-brand-50` | `dark:bg-brand-500/10` |
| Error text | `text-error-600` | `dark:text-error-400` |
| Error surface | `bg-error-50` | `dark:bg-error-500/15` |

### 3.3 Rules

- **One accent per screen.** Brand is for action/selection/state, never page decoration.
- **Never color alone.** Pair state color with text, icon or shape.
- **No invented tints.** Use `brand-*`, `success-*`, etc. Do not blend arbitrary rgba colors in TSX.
- **Alpha surfaces are allowed only in dark mode** (`white/[0.02]`, `white/[0.03]`, `white/5`, `brand-500/15`).
- **Charts** use semantic/category colors only, never rainbow.
- On a tinted surface, secondary text follows the hue or foreground; do not drop neutral gray into it.

---

## 4. Typography

### 4.1 Family

**Be Vietnam Pro** only, loaded in `app/layout.tsx`:

```tsx
const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-be-vietnam",
});
```

No second family. No display font. No monospace except code, IDs and measurements.

### 4.2 Scale

| Class | Size / line-height | Use for |
|---|---|---|
| `text-theme-xs` | 12 / 18 | Table headers, metadata, badges, helper text, uppercase labels |
| `text-theme-sm` | 14 / 20 | **Default body**, labels, buttons, table cells, nav |
| `text-base` | 16 / 24 | Card/section titles, short prose, mobile body |
| `text-lg` | 18 / 28 | Modal titles, prominent section titles |
| `text-xl` | 20 / 28 | Page title via `PageBreadCrumb` |
| `text-theme-xl` | 20 / 30 | Page/modal title when not using `text-xl` |
| `text-2xl` | 24 / 32 | KPI numbers, auth subheads |
| `text-title-sm` | 30 / 38 | Auth `h1` on mobile |
| `text-title-md` | 36 / 44 | Auth `h1` on desktop; **maximum in product** |
| `text-title-lg`+ | 48+ | **Not used** in product UI |

Do not use fluid `clamp()` typography in app UI. Tables, sidebars and forms must keep stable text sizes.

### 4.3 Weight

| Weight | Use |
|---|---|
| 400 | Body, table values, prose |
| 500 | Labels, buttons, nav, table headers, emphasized values |
| 600 | Headings, KPI values, modal titles |
| 700 | Rare emphasis only |

Never use 300 for UI text. Never fake bold with shadows.

### 4.4 Rules

- **One `h1` per screen.** Usually the page title.
- Heading order is sequential; never skip levels.
- No eyebrow/kicker text above headings.
- Space above a heading > space below it.
- Numbers in tables: right-aligned, `tabular-nums`, consistent decimals.
- Truncation must have a way to reveal the full value (tooltip, expand, detail page). Never truncate IDs, amounts or names that the user needs to act on.
- Prose measure 65–75ch; tables may run full width.
- Use `text-wrap: balance` for short headings and `text-wrap: pretty` for body where supported.

---

## 5. Space, radius, border, elevation

### 5.1 Spacing scale

Use a **4 px base**, practical steps: `1` 4, `1.5` 6, `2` 8, `2.5` 10, `3` 12, `4` 16, `5` 20, `6` 24, `8` 32, `10` 40, `12` 48.

| Context | Value |
|---|---|
| App shell content padding | `p-3` mobile (12), `md:p-4` desktop (16) |
| Card/panel padding | `p-5` (20) or `p-6` (24) |
| Section gap | `space-y-6` (24) |
| Field gap | `gap-4` (16) |
| Inline control gap | `gap-2` / `gap-3` (8 / 12) |
| Label → input | `mb-1.5` (6) |
| Input → hint/error | `mt-1.5` (6) |
| Table cell | `px-5 py-4` (20 / 16) |
| Table header | `px-5 py-3` (20 / 12) |
| Modal | `p-6 lg:p-8` (24 / 32) |

**Rhythm rule:** more space above a heading than below it; group related fields tighter than unrelated groups.

### 5.2 Density presets

| Preset | Row / control height | Padding | Used for |
|---|---|---|---|
| Compact | 36–40 px | 8–12 | Header controls, rail tiles, chips |
| Standard | 44 px controls; 52+ px rows | 12–16 | Inputs, buttons, table rows |
| Comfortable | 48–56 px | 20–24 | Cards, modals, auth |

Touch targets: **44×44 px minimum on touch**; 24×24 CSS px absolute minimum for pointer (WCAG 2.2 AA).

### 5.3 Radius grammar

| Role | Class | Value |
|---|---|---|
| Control (button, input, select, tile) | `rounded-lg` | 8 px |
| Nested surface (alert, dropdown, small panel) | `rounded-xl` | 12 px |
| Card / table container / KPI | `rounded-2xl` | 16 px |
| Modal | `rounded-3xl` | 24 px |
| Badge, avatar, chip, pill | `rounded-full` | full |

Do not mix pill and sharp shapes at the same hierarchy level. A square button next to a pill button is drift.

### 5.4 Borders

- Default border color is `gray-200`; dark is `gray-800`.
- Inner dividers use `gray-100` / `white/[0.05]`.
- Control borders use `gray-300` / `gray-700`.
- **Never** use colored left/right borders thicker than 1 px on cards or alerts.
- **Never** use `ring-*` for borders or focus. Global CSS disables ring shadows (§12.2).

### 5.5 Elevation

| Level | Token | Use |
|---|---|---|
| 0 | border | Default cards, tables, panels |
| 1 | `shadow-theme-xs` | Inputs, buttons, pagination controls |
| 2 | `shadow-theme-sm` | Rare hover lift, small floating panel |
| 3 | `shadow-theme-lg` | Dropdown, popover, menu |
| 4 | `shadow-theme-xl` | Command palette / large overlay (rare) |

Do not put shadows on every card. Do not use hard offset shadows (`4px 4px 0`). Do not use zero-offset color glows. Modals get depth from the scrim, not a large shadow.

### 5.6 Z-index layers

| Layer | Class | Use |
|---|---|---|
| Base | `z-1` | Page content |
| Sticky table header | `z-9` | Within a scroll container |
| Header | `z-30` | App header |
| Dropdown / menu | `z-40` | Floating menu |
| Mobile drawer | `z-50` | Sidebar drawer |
| Rail tooltip | `z-[100]` | Fixed tooltip (existing exception) |
| Modal controls | `z-999` | Close button inside modal |
| Modal / drawer overlay | `z-9999` | Canonical |
| Toast | `z-99999` | Above modal |
| Tooltip | `z-999999` | Top-most transient |

The current template modal uses `z-99999`; when copying, normalize it to `z-9999` so toasts can sit above it. Never raise z-index to "cover something" without assigning a layer.

---

## 6. Motion, icons, imagery

### 6.1 Motion

| Token | Duration | Use |
|---|---|---|
| Micro | 150 ms | Color, border, opacity, hover |
| Standard | 200 ms | Transform, dropdown, tooltip |
| Panel | 300 ms | Sidebar panel, drawer |

- Enter with `ease-out`; exit at ~60–70% of enter duration.
- Animate `transform` and `opacity` only. Never animate `width`, `height`, `top` or `left` except the existing sidebar panel width (a deliberate exception).
- Feedback must appear within 100 ms.
- No page-load choreography. The user came to work.
- No parallax, marquee, ambient loops or decorative scroll effects.
- Stagger 30–50 ms only when order carries meaning.
- Honors `prefers-reduced-motion`: disable transforms, parallax and smooth scroll; keep opacity or make it instant.

### 6.2 Icons

- One set: inline SVG, outline style, `stroke-width` 1.5–2.
- Sizes: 16, 18, 20, 24. Do not scale a 24 px icon down with CSS.
- Color via `currentColor` / `fill-current` / `stroke-current`.
- Decorative icons: `aria-hidden="true"`. Meaningful icons: accessible name.
- Icon-only buttons: `aria-label` plus a visible tooltip where the meaning is not universal.
- Icon-only target: `h-9 w-9` minimum in dense chrome, `h-10 w-10` preferred, `h-11 w-11` on touch.
- No emoji as system icons.
- Icon contrast ≥ 3:1 against its background.

### 6.3 Imagery

- Real assets over simulations. Never draw a fake logo or product shot with CSS.
- Missing asset → labeled placeholder (`[logo]`, `16:9 image`, initial avatar).
- `next/image` with declared dimensions or aspect ratio.
- Decorative images `alt=""`; informative images describe the content, not keywords.
- No hotlinking user-local files. Put assets in `public/` or a stable source.
- Images must retain detail in dark mode; avoid pure-black backdrops.

---

## 7. Shell and layout

### 7.1 Shell anatomy

```text
┌──────────────────────────────────────────────────────────┐
│ AppHeader — full width, z-30, border-b on lg             │
├──────┬──────────────┬────────────────────────────────────┤
│ Rail │ Submenu panel│ main (min-w-0 flex-1 overflow-y-auto)│
│ w-16 │ 0–420 px     │ p-3 md:p-4                         │
└──────┴──────────────┴────────────────────────────────────┘
```

Implementation in `app/admin/layout.tsx`:

```tsx
<div className="flex h-screen flex-col">
  <AppHeader />
  <div className="flex flex-1 items-stretch overflow-hidden">
    <AppSidebar sections={navSections} />
    <main className="min-w-0 flex-1 overflow-y-auto">
      <div className="p-3 md:p-4">{children}</div>
    </main>
  </div>
</div>
```

### 7.2 Header

- Full width, `shrink-0`, `bg-white dark:bg-gray-900`, `border-b` on `lg`.
- Height is content-driven: `py-2` + 36–40 px controls ≈ 52–56 px. Do not add a fixed height.
- Left: mobile hamburger (`md:hidden`, 36×36, `aria-label`), logo (`132×34`), desktop search (`h-9`, `max-w` 360).
- Right: theme toggle, notifications, user menu.
- Search shortcut: `Ctrl/Cmd + K` focuses the input. Announce the shortcut visually.
- Mobile: secondary actions collapse into a second row toggled by the "more" button; never overflow horizontally.

### 7.3 Rail sidebar and submenu panel

- Rail: `w-16` (64 px), `border-r`, `bg-white dark:bg-gray-900`.
- Icon tile: `h-10 w-10 rounded-lg`; active `bg-brand-500 text-white shadow-sm`; inactive `text-gray-500 hover:bg-gray-100 hover:text-gray-700` / `dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white`.
- Rail is scrollable but hides its scrollbar (`no-scrollbar`).
- Submenu panel: default 240 px, min 180, max 420; stored under `h2base_panelWidth`; opens beside the rail and **pushes** content; animate width 300 ms.
- Mobile: rail becomes a 64 px drawer (`z-50`, translate-x), with a scrim.
- Active submenu item: `bg-brand-50 text-brand-500` / `dark:bg-brand-500/[0.12] dark:text-brand-400`, weight 500.
- Every rail link has `aria-label` and a tooltip on hover/focus.

### 7.4 Content width

| Content | Width |
|---|---|
| Tables, dashboards, boards | Full width of `main` |
| Forms | `max-w-2xl` (672) or `max-w-3xl` (768) |
| Prose / detail narrative | `max-w-3xl` |
| Auth form | `max-w-md` (448) |
| Modal | `max-w-md` / `max-w-lg` / `max-w-2xl`; never full-bleed except fullscreen mobile |

### 7.5 Page header

Use the copied `PageBreadCrumb`:

```tsx
<PageBreadcrumb pageTitle="Quản lý tài khoản" />
```

Rules:

- Title `text-xl font-semibold text-gray-800 dark:text-white/90`.
- Breadcrumb only when depth ≥ 2 (e.g. `/admin/users`). Dashboard-level pages show the title alone.
- Remove the template's stray `x-text` attribute and localize `Home` → `Trang chủ`; derive the link from the current surface, not a hardcoded `/admin`.
- One primary action, placed at the end of the title row or in the panel header. Never duplicate it in both places.

### 7.6 Navigation rules

- Navigation position never changes between pages.
- No mixed sidebar + bottom nav + tabs at the same hierarchy level.
- Every primary screen has a URL.
- Destructive/account actions live in the user menu, not in main navigation.
- Add screens only through `features/<surface>/<module>/nav.tsx` + `pnpm nav:gen`. Never edit `generated.ts`.

---

## 8. Components

All components are **copied** from `apps/web/src/features/_template/ui/` into the owning module's `ui/` folder. Import only from your own module (`../ui/Button`). Never import `_template` or another module's UI.

Shared class recipes below are the contract. Implement them inside the copied component; do not create a cross-module "kit".

### 8.1 Button

**Anatomy:** optional start icon, label, optional end icon.

```tsx
const FOCUS =
  "focus-visible:shadow-[0_0_0_2px_var(--color-white),0_0_0_4px_var(--color-brand-500)] " +
  "dark:focus-visible:shadow-[0_0_0_2px_var(--color-gray-900),0_0_0_4px_var(--color-brand-400)]";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition " +
  "disabled:cursor-not-allowed disabled:opacity-50 " +
  FOCUS;

const SIZE = {
  sm: "px-4 py-3 text-sm",   // 44px tall
  md: "px-5 py-3.5 text-sm", // 48px tall
};

const VARIANT = {
  primary:
    "bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300",
  outline:
    "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 " +
    "dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 " +
    "dark:hover:bg-white/[0.03] dark:hover:text-gray-300",
  ghost:
    "text-gray-600 hover:bg-gray-100 hover:text-gray-800 " +
    "dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white/90",
  danger:
    "bg-error-500 text-white shadow-theme-xs hover:bg-error-600 disabled:bg-error-300",
};
```

**Why the two-ring focus:** the `shadow-focus-ring` token is only 12% alpha and nearly disappears on `brand-500`. The inner ring separates the control from the outer brand ring; the outer ring provides a ≥ 3:1 indicator. Do not stack `shadow-focus-ring` and the two-ring recipe on the same element — both write `--tw-shadow` and one wins unpredictably.

| State | Behavior |
|---|---|
| Hover | Primary darkens to `brand-600`; outline gains `gray-50` / `white/[0.03]` |
| Focus-visible | `shadow-focus-ring` **plus** border/background change; ring utilities do not work |
| Active | Same as hover; no layout movement |
| Disabled | `opacity-50 cursor-not-allowed`; primary also `bg-brand-300` |
| Loading | Keep width; replace label with `Đang lưu...` or spinner + label; disable |
| Danger | Only for destructive confirmation; never for ordinary cancel |

**Rules**

- One primary button per view. Secondary = outline. Tertiary = ghost/text.
- Label = verb + object ("Lưu thay đổi", not "OK").
- `type="button"` unless it submits a form. Extend the copied props with `type`, `aria-*` and native button attributes; the template only exposes `onClick`.
- Icon-only buttons are not `Button`; use §8.2.
- Minimum width for async buttons so the label swap does not jump.

> **Template gap:** the copied outline variant uses `ring-1 ring-inset ring-gray-300`, which is invisible because global CSS zeroes ring shadows. Replace it with `border border-gray-300 dark:border-gray-700` as shown above.

### 8.2 Icon button

```tsx
<button
  type="button"
  aria-label="Đóng thông báo"
  className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:shadow-focus-ring dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white/90"
>
  <CloseIcon className="h-5 w-5" aria-hidden="true" />
</button>
```

- Always `aria-label`; tooltip when the icon is ambiguous.
- 36×36 dense chrome, 40×40 standard, 44×44 touch.
- Never rely on hover alone.

### 8.3 Label, hint and error

```tsx
<Label htmlFor="user-name">
  Họ tên <span className="text-error-500">*</span>
</Label>
<Input id="user-name" name="name" hint={error} error={Boolean(error)} />
```

- Label: `mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400`.
- Required marker: `text-error-500`, `aria-hidden` on the asterisk if the input also has `required`.
- Hint/error: `mt-1.5 text-xs` (Input) or `mt-2 text-sm` (Textarea).
- Error text `text-error-500`; success `text-success-500`; neutral `text-gray-500 dark:text-gray-400`.
- Error must be linked with `aria-describedby`; add `aria-invalid="true"` to the control.
- Never use placeholder as the label.

### 8.4 Text input

```tsx
const BASE =
  "h-11 w-full appearance-none rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs " +
  "transition-colors placeholder:text-gray-500 focus-visible:border-brand-500 " +
  "focus-visible:shadow-focus-ring disabled:cursor-not-allowed " +
  "dark:placeholder:text-gray-400";

const STATE = {
  normal:
    "border-gray-300 bg-transparent text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90",
  error:
    "border-error-500 text-error-800 dark:border-error-500 dark:text-error-400",
  success:
    "border-success-400 text-success-500 dark:border-success-500 dark:text-success-400",
  disabled:
    "border-gray-300 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400",
};
```

- Height 44 px. Full width by default.
- `type`, `inputMode`, `autoComplete`, `required`, `min`, `max`, `step` must be correct.
- Password fields have a visibility toggle with `aria-label` and `aria-pressed`.
- Read-only and disabled must differ visually **and** semantically.
- No `outline-none` additions.

### 8.5 Textarea

```tsx
className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-500 focus-visible:border-brand-500 focus-visible:shadow-focus-ring dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-400"
```

- Default `rows={3}`; grow for long-form where appropriate.
- Show remaining characters only when there is a real limit.
- Resize vertically, never horizontally.

> **Template gap:** the copied Textarea uses `text-gray-400` for the value in its normal state. Fix to `text-gray-800 dark:text-white/90`.

### 8.6 Select

```tsx
<div className="relative">
  <select
    className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs focus-visible:border-brand-500 focus-visible:shadow-focus-ring dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
  >
    …
  </select>
  <ChevronDownIcon
    className="pointer-events-none absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 text-gray-500 dark:text-gray-400"
    aria-hidden="true"
  />
</div>
```

- Native `<select>` unless search/multi-select is required.
- Placeholder option is disabled and selected only when empty.
- Every select has a visible label or `sr-only` label.
- Group options when there are more than ~10.

> **Template gap:** the copied Select has `appearance-none` and `pr-11` but no chevron. Add one.

### 8.7 Search field

```tsx
<label htmlFor="user-search" className="sr-only">Tìm kiếm tài khoản</label>
<div className="relative">
  {/* Inline 20px magnifier: copy the path from AppHeader.tsx — @/icons has no SearchIcon export. */}
  <svg
    className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-500 dark:text-gray-400"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="…" />
  </svg>
  <input
    id="user-search"
    type="search"
    placeholder="Tìm theo tên hoặc email..."
    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent pl-10 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-500 focus-visible:border-brand-500 focus-visible:shadow-focus-ring dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-400"
  />
</div>
```

- Debounce 250–350 ms; never call the API on each keystroke.
- Keep the query in the URL when the result is shareable.
- Provide a clear button when there is text.
- `type="search"` for native clear behavior.

### 8.8 Checkbox, radio, switch

**Checkbox** — 20×20, `rounded-md`, brand when checked, check icon white.

```tsx
className="h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 checked:border-transparent checked:bg-brand-500 focus-visible:shadow-focus-ring disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700"
```

Label gap `gap-3` (12). The whole label is clickable. Header checkbox in tables supports indeterminate.

**Radio** — 20×20 circle, `border-brand-500 bg-brand-500` when checked, white 6 px dot inside. Use a real `<input type="radio">` with `sr-only` + styled span; ensure focus-visible styles on the styled element.

**Switch** — track 44×24 (`h-6 w-11`), knob 20 (`h-5 w-5`), checked `bg-brand-500`, unchecked `bg-gray-200 dark:bg-white/10`, 150 ms linear.

> **Template gap:** the copied Switch is a `div` with a click handler and no role, keyboard support or `aria-checked`. For new UI, implement a real `<button role="switch" aria-checked={checked}>` (or a checkbox input) with focus-visible styling. Keep the same visuals.

### 8.9 Table

**Container**

```tsx
<section className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
  <header className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">…</header>
  <div className="border-t border-gray-100 px-5 py-4 dark:border-gray-800">toolbar</div>
  <div className="overflow-x-auto">
    <div className="min-w-[980px]">…</div>
  </div>
  <footer className="border-t border-gray-100 px-5 py-4 dark:border-gray-800">pagination</footer>
</section>
```

**Header cell**

```tsx
"text-theme-xs px-5 py-3 text-start font-medium whitespace-nowrap text-gray-500 dark:text-gray-400"
```

**Body cell**

```tsx
"px-5 py-4 text-start align-middle"
```

**Header/body separators**

```tsx
<TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
<TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
```

**Row hover**

```tsx
"transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02]"
```

| Aspect | Standard |
|---|---|
| Row height | 52 px minimum for text rows; 64–72 with avatar or two-line content; never below 44 |
| Header | 12 px, weight 500, `gray-500`, sticky when the table scrolls |
| Numeric cells | Right-aligned, `tabular-nums` |
| Long text | `truncate` + tooltip/detail; never hide IDs or amounts |
| Selection | Header checkbox with indeterminate; bulk bar appears when selection > 0 |
| Sorting | Click target on the header, `aria-sort`, visible direction |
| Row actions | Overflow menu; destructive separated and confirmed |
| Loading (first load) | 5 skeleton rows matching real row height |
| Loading (refresh) | Keep rows, `opacity-60`, disable actions |
| Empty | Title + explanation + recovery action, `py-12`, centered |
| Error | Alert + retry, keep filters |
| Mobile | Horizontal scroll with a sensible `min-w` (720 / 980 / 1120) or card list; never squeeze columns |

Skeleton:

```tsx
<div className="h-10 w-10 animate-pulse rounded-full bg-gray-100 dark:bg-white/5" />
<div className="h-3 w-40 animate-pulse rounded bg-gray-100 dark:bg-white/5" />
```

Do not use a table for 2–3 fields; use a definition list or card.

### 8.10 Pagination

```tsx
const navButtonClass =
  "shadow-theme-xs flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]";
```

- Show range: "Hiển thị 1–20 trong 134 tài khoản".
- Window of max 5 page numbers around the current page.
- Current page: `bg-brand-500 text-white`; others `hover:bg-brand-50`.
- `aria-current="page"` on the active page.
- Prev/next labels are text, not bare chevrons, in Vietnamese UI.
- Preserve page and filters in the URL when shareable.

### 8.11 Card, panel and KPI

**Panel**

```tsx
<div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
```

**KPI card**

```tsx
<div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
  <p className="text-theme-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
    Tổng tài khoản
  </p>
  <p className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white/90">1.248</p>
  <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">Toàn bộ người dùng hệ thống</p>
</div>
```

- KPI grid: `grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4`.
- Value uses `toLocaleString("vi-VN")`; show `—` while unknown, never `0` as a placeholder for "not loaded".
- No fake delta, no sparkline without real data.
- Card padding 20–24; do not nest cards.

### 8.12 Badge

```tsx
const BASE =
  "inline-flex items-center justify-center gap-1 rounded-full px-2.5 py-0.5 font-medium";
const SIZE = { sm: "text-theme-xs", md: "text-sm" };
```

| Color | Light | Dark |
|---|---|---|
| primary | `bg-brand-50 text-brand-500` | `dark:bg-brand-500/15 dark:text-brand-400` |
| success | `bg-success-50 text-success-600` | `dark:bg-success-500/15 dark:text-success-500` |
| error | `bg-error-50 text-error-600` | `dark:bg-error-500/15 dark:text-error-500` |
| warning | `bg-warning-50 text-warning-600` | `dark:bg-warning-500/15 dark:text-orange-400` |
| info | `bg-blue-light-50 text-blue-light-500` | `dark:bg-blue-light-500/15 dark:text-blue-light-500` |
| neutral | `bg-gray-100 text-gray-700` | `dark:bg-white/5 dark:text-white/80` |

- Badge = status/category, not a button.
- Sentence case for words; uppercase only for short codes (`ADMIN`, `NEW`).
- Never use color alone: the text must state the status.

### 8.13 Alert

```tsx
<div className="rounded-xl border p-4 …variant…">
  <div className="flex items-start gap-3">
    <span className="…icon color…">icon</span>
    <div>
      <h4 className="mb-1 text-sm font-semibold text-gray-800 dark:text-white/90">Title</h4>
      <p className="text-sm text-gray-500 dark:text-gray-400">Message</p>
    </div>
  </div>
</div>
```

| Variant | Container |
|---|---|
| success | `border-success-500 bg-success-50 dark:border-success-500/30 dark:bg-success-500/15` |
| error | `border-error-500 bg-error-50 dark:border-error-500/30 dark:bg-error-500/15` |
| warning | `border-warning-500 bg-warning-50 dark:border-warning-500/30 dark:bg-warning-500/15` |
| info | `border-blue-light-500 bg-blue-light-50 dark:border-blue-light-500/30 dark:bg-blue-light-500/15` |

- Alerts are inline and persistent. Toasts are transient.
- Errors get `role="alert"`; success/info can be `role="status"`.
- If dismissible, the close button has `aria-label="Đóng thông báo"`.

### 8.14 Modal

**Use only for:** confirmation, destructive protection, short focused tasks, no good inline location.

**Never for:** primary navigation, long forms, multi-step flows, long reading, tasks that can be inline.

```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="user-modal-title"
  className="fixed inset-0 z-9999 flex items-center justify-center overflow-y-auto"
>
  <div className="fixed inset-0 bg-gray-400/50 backdrop-blur-[32px]" onClick={onClose} />
  <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 lg:p-8 dark:bg-gray-900">
    <h3 id="user-modal-title" className="text-lg font-semibold text-gray-800 dark:text-white/90">
      Chỉnh sửa tài khoản
    </h3>
    <button
      type="button"
      aria-label="Đóng"
      className="absolute top-3 right-3 z-999 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 sm:top-6 sm:right-6 sm:h-11 sm:w-11 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
    >
      <CloseIcon />
    </button>
    …
  </div>
</div>
```

**Required behavior**

- `role="dialog"`, `aria-modal="true"`, `aria-labelledby`.
- Focus moves into the dialog on open; trap focus inside; Esc closes.
- Return focus to the trigger on close.
- Click scrim closes **except** destructive/irreversible dialogs.
- Body scroll lock; no nested modals.
- Close button has `aria-label`.
- Size: `max-w-md` confirm, `max-w-lg` short form, `max-w-2xl` standard form.
- Footer: cancel (outline) left of primary, or both right-aligned in dense admin; keep one pattern per module.

> **Template gap:** `_template/ui/modal` has Esc + body lock only. It has no focus trap, `role`, `aria-modal`, `aria-labelledby` or close `aria-label`, and it returns `null` when closed (no exit animation). Add the missing pieces when copying.

**Drawer** follows the same semantics: `role="dialog"`, focus trap, Esc, restore focus, scrim, slide with transform 200–300 ms.

### 8.15 Dropdown / menu

```tsx
<div className="absolute right-0 z-40 mt-2 rounded-xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-900">
  <button className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white/90">
    …
  </button>
</div>
```

- Trigger has `aria-haspopup="menu"`, `aria-expanded`.
- Menu has `role="menu"`; items `role="menuitem"`.
- Arrow keys move; Esc closes; focus returns to trigger.
- Click outside closes.
- Destructive item separated by a divider and styled `text-error-600`.
- No hover-only opening.

> **Template gap:** copied Dropdown closes on outside click but has no keyboard navigation or ARIA menu semantics. Add them.

### 8.16 Tabs and segmented control

- Tabs switch views **within** a page; never use them as primary navigation.
- Use real `role="tablist"`, `role="tab"`, `aria-selected`, and `role="tabpanel"`.
- Active: `border-b-2 border-brand-500 text-brand-600` (underline tabs) or `bg-white text-gray-900 shadow-theme-xs` inside a `bg-gray-100` track (segmented).
- Inactive: `text-gray-500 hover:text-gray-700`.
- Keep tab order stable; do not reorder by state.

### 8.17 Avatar

- Sizes: 24, 32, 40, 48, 56, 64 (`h-6` … `h-16`).
- Image: `rounded-full object-cover`, declared width/height, `alt` = person's name.
- Fallback: initials on a deterministic tint; one consistent palette.
- Status dot: online `success-500`, offline `error-400`, busy `warning-500`, with a border matching the surface.
- Status is not the only indicator in lists; include text where it matters.

> **Template gap:** copied `Avatar` passes `width="0" height="0"` and `sizes="100vw"`. Use real pixel dimensions (e.g. `width={40} height={40}`) with `sizes`.

### 8.18 Empty, loading and error states

| State | Pattern |
|---|---|
| Loading (content) | Skeleton rows/cards with the real dimensions; no centered spinner |
| Loading (action) | Disabled button + `Đang …` label or inline spinner |
| Empty | Icon (optional) + title + explanation + primary recovery action; `py-12 text-center` |
| No search results | "Không tìm thấy …" + "Thử xoá bộ lọc hoặc đổi từ khoá." + clear filters |
| Error | Alert with title/message + `Thử lại`; keep the user's filters and input |
| Permission | Explain the missing role and who to contact; do not show a broken empty table |
| Offline | State it plainly; disable actions that cannot succeed |

Empty copy teaches. It never just says "Không có dữ liệu".

### 8.19 Tooltip

- Use for icon-only controls and truncated values, not for essential instructions.
- Show on hover **and** focus.
- `role="tooltip"`, referenced by `aria-describedby` when it carries information.
- Max width ~240 px, `text-xs`, one or two lines.
- Never trap the pointer; dismiss on Esc.
- Do not put interactive content inside a tooltip.

### 8.20 Toast

Use for transient confirmation of an action that has no inline place. Never for field errors or anything the user must act on.

```tsx
<div
  role="status"
  aria-live="polite"
  className="fixed right-4 bottom-4 z-99999 flex w-full max-w-sm items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900"
>
  <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-success-500" aria-hidden="true" />
  <div className="min-w-0 flex-1">
    <p className="text-sm font-medium text-gray-800 dark:text-white/90">Đã lưu thay đổi</p>
    <p className="text-theme-xs mt-0.5 text-gray-500 dark:text-gray-400">…</p>
  </div>
  <button
    type="button"
    aria-label="Đóng thông báo"
    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/5 dark:hover:text-white/90"
  >
    <CloseIcon className="h-4 w-4" aria-hidden="true" />
  </button>
</div>
```

- 3–5 s; pause on hover/focus; always dismissible.
- Error toasts use `role="alert"` and stay until dismissed if the user must act.
- Stack at most 3; one toast per action.
- Mobile: `left-4 right-4 bottom-4` with `max-w-none`.
- Do not use a toast for validation, permission or anything that belongs inline.

---

## 9. Page patterns

### 9.1 Admin list / table screen (canonical)

```text
PageBreadcrumb (title)
├─ Feedback alert (dismissible, after an action)
├─ KPI grid (optional, 4 max)
└─ Panel
   ├─ Panel header: title + subtitle + primary action
   ├─ Toolbar: search + filters + refresh
   ├─ Table: header / skeleton / empty / error / rows
   └─ Footer: range + pagination
```

Class skeleton:

```tsx
<div className="space-y-6">
  <PageBreadcrumb pageTitle="Quản lý tài khoản" />

  {feedback && <Alert … />}

  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">…KPI…</div>

  <section className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
    <header className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-base font-medium text-gray-800 dark:text-white/90">Danh sách tài khoản</h2>
        <p className="text-theme-xs mt-1 text-gray-500 dark:text-gray-400">…</p>
      </div>
      <Button size="sm" startIcon={<PlusIcon />}>Thêm tài khoản</Button>
    </header>

    <div className="border-t border-gray-100 px-5 py-4 dark:border-gray-800">
      <UsersToolbar … />
    </div>

    <div className="border-t border-gray-100 dark:border-gray-800">
      <UsersTable … />
    </div>

    <footer className="border-t border-gray-100 px-5 py-4 dark:border-gray-800">
      <UsersPagination … />
    </footer>
  </section>
</div>
```

Rules:

- Only **one** primary action on the page. If the panel header has it, the page header does not.
- Filters live in the toolbar, not in the page header.
- Keep filter/search/page state in the URL when it is shareable.
- Refreshing must not clear filters or scroll.
- The table owns its loading/empty/error rendering; the page does not duplicate them.

### 9.2 Admin form

**Short form (< ~8 fields):** modal or inline panel.
**Long/multi-step form:** dedicated page or drawer, never a modal.

```tsx
<form onSubmit={handleSubmit} className="space-y-6">
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <div>
      <Label htmlFor="name">Họ tên <span className="text-error-500">*</span></Label>
      <Input id="name" error={Boolean(errors.name)} hint={errors.name} … />
    </div>
    …
  </div>

  <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
    <Button type="button" variant="outline" size="sm" onClick={onCancel}>Huỷ</Button>
    <Button type="submit" size="sm" disabled={isSubmitting}>
      {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
    </Button>
  </div>
</form>
```

Rules:

- One column on mobile, max two on desktop; never three for data entry.
- Validate on blur, re-validate on submit; never on every keystroke.
- Keep values on error. Never reset the form after a failed submit.
- Disable submit while submitting and prevent double submit.
- Focus the first invalid field (or an error summary) on submit failure.
- Required fields marked; optional fields do not need a marker.
- Destructive actions are separated and confirmed.
- Disable navigation-away warnings only if drafts are saved.

### 9.3 Admin detail

```text
Back link / breadcrumb
Title + status badge + actions
Summary panel (key facts, 2 columns on desktop)
Sections (activity, history, settings)
Danger zone at the bottom, visually separated
```

- Read-only values use a definition list, not disabled inputs.
- Status badge sits next to the title, never floating alone.
- Actions: primary edit, secondary overflow, destructive last.
- Long histories paginate or "load more"; do not render unbounded lists.

### 9.4 Auth

```tsx
<div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
  <h1 className="text-title-sm sm:text-title-md mb-2 font-semibold text-gray-800 dark:text-white/90">
    Đăng nhập
  </h1>
  <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
    Nhập email và mật khẩu để truy cập hệ thống OneOps.
  </p>
  …
</div>
```

- Max width 448 px. Generous vertical spacing (24–32).
- One primary action; one secondary link (forgot password / sign up).
- Error alert above the form with `role="alert"`; field errors inline.
- Password visibility toggle with `aria-label` + `aria-pressed`.
- Password managers and paste must work.
- No marketing claims, no fake testimonials, no gradient hero.
- Auth pages may use more brand expression than product pages, but the same tokens.

### 9.5 Employee mobile-first screen

- Assume 375 px width, one hand, intermittent network.
- Primary action within thumb reach (bottom of the content or a sticky bar with safe-area padding).
- Cards over tables when the row has more than 3 values.
- Minimum 44 px targets.
- No hover-dependent controls.
- Show sync/offline state explicitly.
- Keep the same typography, color and component shapes as admin; change density, not identity.

---

## 10. States

Every component and screen must define these, where applicable:

| State | Requirement |
|---|---|
| Default | Resting appearance |
| Hover | Visible on pointer devices; never the only affordance |
| Focus-visible | Visible indicator, ≥ 3:1; keyboard only |
| Active/pressed | Immediate feedback within 100 ms; no layout shift |
| Disabled | Visually muted **and** `disabled`/`aria-disabled`; not focusable when truly disabled |
| Read-only | Looks different from disabled; still focusable/copyable |
| Loading | Preserve dimensions; block duplicate actions |
| Error | Message + recovery; field-level where possible |
| Empty | Explain + next action |
| Selected | Brand tint + non-color indicator (check, border, label) |
| Success | Confirm without blocking flow |
| Partial/permission | Explain what is hidden and why |

**No dead ends.** Every error state offers retry, edit, contact or back.

---

## 11. Content and formatting

### 11.1 Voice

- Polite, short, neutral. No humor around errors, payroll, HR or attendance.
- Address the user implicitly; avoid "Vui lòng" in every sentence.
- Never blame the user.
- One term per concept: **nhân viên**, **chấm công**, **nhiệm vụ**, **ca làm**, **tài khoản**. Do not alternate with English or synonyms per screen.

### 11.2 Labels and buttons

- Sentence case. Uppercase only for short badges/table headers.
- Button = verb + object: "Lưu thay đổi", "Tạo tài khoản", "Gửi duyệt", "Chấm công vào".
- Never a bare "OK", "Xác nhận", "Submit".
- Buttons ≤ 3 words; field labels ≤ 4 words.
- Link text says where it goes: "Xem chi tiết ca làm", not "Tại đây".

### 11.3 Errors

Format: **what happened + why + what to do.**

- "Email không hợp lệ. Kiểm tra lại định dạng, ví dụ ban@oneops.vn."
- "Mã nhân viên đã tồn tại. Dùng mã khác hoặc mở hồ sơ hiện có."
- "Không tải được danh sách. Kiểm tra kết nối và thử lại."

Never expose stack traces, SQL, internal IDs or English server messages to users.

### 11.4 Empty states

- "Chưa có ca làm nào trong tuần này. Tạo ca đầu tiên để bắt đầu."
- "Không tìm thấy tài khoản nào. Thử xoá bộ lọc hoặc đổi từ khoá tìm kiếm."

### 11.5 Data formatting

| Data | Format |
|---|---|
| Date | `dd/MM/yyyy` (`27/10/2026`) |
| Time | 24 h `HH:mm` |
| Money | `1.234.567 ₫` |
| Number | `Intl.NumberFormat("vi-VN")` |
| Percent | `12,5%` (comma decimal) |
| Units | Always explicit: phút, giờ, ngày, % |
| Names/places | Preserve Vietnamese diacritics |

Table numbers: right-aligned, `tabular-nums`, consistent decimal places. Do not hand-concatenate thousand separators.

### 11.6 Tone examples

| Bad | Good |
|---|---|
| "Có lỗi xảy ra" | "Không lưu được tài khoản. Email đã tồn tại." |
| "Thành công" | "Đã tạo tài khoản ban@oneops.vn." |
| "Không có dữ liệu" | "Chưa có nhiệm vụ nào. Tạo nhiệm vụ đầu tiên để bắt đầu." |
| "OK" | "Lưu thay đổi" |
| "Bạn có chắc chắn?" | "Vô hiệu hoá tài khoản này? Người dùng sẽ không đăng nhập được." |

---

## 12. Accessibility

### 12.1 Gate

| Area | Requirement |
|---|---|
| Contrast | Body/placeholder ≥ 4.5:1; large text ≥ 3:1; meaningful icon/border ≥ 3:1 |
| Keyboard | Every action reachable; logical order; no traps outside modals |
| Focus | Visible at all times; not hidden by sticky/overlay; ≥ 3:1 state change |
| Labels | Visible label or `sr-only`; icon-only has `aria-label`; inputs have `name` |
| Semantics | Real `button`, `a`, `input`, `table`, `dialog`; no clickable `div` |
| Headings | One `h1`; sequential levels |
| Color | Never sole signal |
| Motion | `prefers-reduced-motion` honored |
| Targets | ≥ 24×24 pointer; 44×44 touch |
| Errors | `aria-invalid`, `aria-describedby`, `role="alert"`; summary for many |
| Images | Correct `alt`; decorative empty alt |
| Route change | Move focus to main content; announce page change |
| Zoom | 200% without loss of content or horizontal scroll |
| Language | `<html lang="vi">` |

### 12.2 Focus rings are globally disabled — compensate

`globals.css` intentionally contains:

```css
*, *::before, *::after {
  outline: none !important;
  --tw-ring-shadow: 0 0 #0000 !important;
  --tw-ring-offset-shadow: 0 0 #0000 !important;
}
```

Consequences:

- `ring-*` utilities render **nothing**. Do not use `ring-1` for borders or `focus:ring-*` for focus.
- `outline-none` is already global; never add it.
- The visible focus indicator must come from something else.

Use:

```tsx
// Fields and surfaces with a border
focus-visible:border-brand-500
focus-visible:shadow-focus-ring

// Solid buttons / brand surfaces (strong two-ring indicator)
focus-visible:shadow-[0_0_0_2px_var(--color-white),0_0_0_4px_var(--color-brand-500)]
dark:focus-visible:shadow-[0_0_0_2px_var(--color-gray-900),0_0_0_4px_var(--color-brand-400)]

// Or a background/underline change
focus-visible:bg-gray-100
focus-visible:underline
```

Prefer a **border/background change plus** `shadow-focus-ring` for fields. The ring token is only 12% alpha, so it is an enhancement, not the sole indicator. Solid buttons need the two-ring recipe (§8.1). The arbitrary shadow values use theme CSS variables, so they remain token-based — no raw hex.

If you own a SHARED change, propose restoring:

```css
:focus-visible {
  outline: 2px solid var(--color-brand-500);
  outline-offset: 2px;
}
```

Get agreement first. Do not edit `globals.css` unilaterally.

### 12.3 Other global CSS facts

- `scroll-behavior: smooth` is global. Disable it under reduced motion.
- `button:not(:disabled), [role="button"]:not(:disabled)` gets `cursor: pointer`.
- Default border color is `gray-200`; always set explicit borders on new surfaces.
- Scrollbars are thin and themed globally; do not restyle per component.

### 12.4 Forms

- Associate every label with `htmlFor`/`id`.
- Required: `required` + visible marker.
- Error: `aria-invalid` + `aria-describedby` pointing to the message id.
- Do not rely on color; include an icon or "Lỗi:" text.
- Group related controls with `fieldset`/`legend` when the group has a name.
- On submit failure, focus the summary or the first invalid field.

### 12.5 Modals, menus, tables

- Modal: focus trap, Esc, restore focus, `aria-modal`, labelled title.
- Menu: `aria-haspopup`, `aria-expanded`, arrow keys, Esc.
- Table: `<caption>` or a visible title; `scope="col"` on headers; `aria-sort` on sortable columns.
- Tabs: `tablist` / `tab` / `tabpanel`.
- Toasts: `aria-live="polite"`; assertive only for errors that need immediate attention.

---

## 13. Responsive

### 13.1 Breakpoints

| Name | Width |
|---|---|
| `2xsm` | 375 |
| `xsm` | 425 |
| `sm` | 640 |
| `md` | 768 |
| `lg` | 1024 |
| `xl` | 1280 |
| `2xl` | 1536 |
| `3xl` | 2000 |

Supported minimum: **375 px**. Test 375 / 768 / 1280 / 1536.

### 13.2 Behavior

| Element | Mobile | Desktop |
|---|---|---|
| Sidebar | 64 px drawer + scrim | Rail + push panel |
| Header | Two rows when the menu is open; hamburger | One row; search visible |
| Page padding | 12 | 16 |
| KPI grid | 1 column → 2 at `sm` | 4 at `xl` |
| Toolbar | Stacked; filters full width | Inline; search flexes |
| Table | Horizontal scroll with `min-w`, or cards | Full table |
| Modal | Near-full width, scrollable | Max-width centered |
| Form grid | 1 column | 2 columns max |
| Actions | Primary full-width in sticky footer if needed | Inline right-aligned |

### 13.3 Rules

- No horizontal page scroll at 375. Table scroll stays inside its container.
- Never hide essential actions on mobile; move them, do not delete them.
- Sticky/fixed elements must not cover content or focus.
- Do not use hover as the only way to reveal information.
- Do not use fluid type in app chrome.
- Test with long Vietnamese labels; they are 20–40% longer than English.

---

## 14. Code conventions

### 14.1 Files

```text
features/<surface>/<module>/
├─ api/            # HTTP calls only
├─ hooks/          # state + api orchestration
├─ components/     # module-specific compositions
├─ ui/             # copied primitives owned by this module
├─ types.ts
├─ constants.ts
├─ nav.tsx
└─ index.ts        # barrel: outside imports only from here
```

- Route files in `app/**` stay thin: metadata + composition.
- `"use client"` only where state, effects, refs, events or browser APIs are used.
- Default to Server Components for layout/data shells.

### 14.2 Imports

- Outside a module: import from its barrel `@/features/<surface>/<module>`.
- Inside a module: relative imports (`../ui/Button`, `./components/...`).
- Never import `_template/ui`.
- Never import another module's `ui/` or internal components.
- `admin` ↔ `employee` imports are forbidden.
- Auth pages use only `features/auth/ui`.

### 14.3 TSX

- No `any`. Use module types, `unknown` + type guard, or a declared interface.
- No `console.log`; use NestJS `Logger` on the backend and proper UI error states on the frontend.
- No API calls in JSX. Use `api/` + `hooks/`.
- No business logic in presentational components; keep it in hooks/services.
- No raw hex, no inline `style` except computed geometry (sidebar width, tooltip position).
- No dynamic Tailwind class construction (`bg-${color}-500`); JIT cannot see it. Use full literal strings.
- Prefer `twMerge` for components that accept `className`.
- Use `next/link` for navigation and `next/image` for images.

### 14.4 Naming

| Thing | Convention |
|---|---|
| Component file | `PascalCase.tsx` |
| Hook | `useSomething.ts` |
| API module | `something.api.ts` |
| Types | `PascalCase` in `types.ts` |
| Constants | `SCREAMING_SNAKE_CASE` or `camelCase` objects |
| CSS utility groups | Local `const BASE`, `SIZE`, `VARIANT` |

### 14.5 Forbidden shortcuts

- A second `ThemeProvider`.
- Editing `generated.ts`.
- A new `tailwind.config.*`.
- A shared `packages/ui` or cross-surface component library.
- Copying a component but leaving its template comments referring to another module.
- Leaving `x-text`, `href="#"`, English placeholders or Lorem Ipsum.

### 14.6 Verification commands

```bash
pnpm nav:gen        # regenerate navigation registry
pnpm lint:structure # boundaries, console.log, cross-module imports
pnpm ui:drift       # see which UI copies drifted from the template
pnpm verify         # nav + boundaries + typecheck (CI gate)
```

Run `pnpm verify` before handoff. `ui:drift` is informational, not a merge blocker.

---

## 15. AI implementation contract

Follow this order. Do not skip to code.

### 15.1 Before writing code

1. **Read** `globals.css`, the nearest module on the same surface, `_template/ui`, and `nav.tsx`.
2. **Classify** surface (admin / employee / auth), mode (Operate / Persuade / Read), scope (extension / preserve / overhaul).
3. **State the Design Read + dials** (§4 of `skill.md`).
4. **List the states** you will implement (default, loading, empty, error, permission, disabled, long data).
5. **Decide the layout** (page pattern §9) and name the primary action.
6. **List the UI primitives** you will copy into `<module>/ui/` and any gaps you must fix (modal ARIA, switch semantics, ring → border).
7. **Check ownership**: if the change touches SHARED files (`globals.css`, `users.prisma`, `platform`, `app-shell`, `auth`), ask before editing.

### 15.2 While writing code

- Copy, don't import, primitives.
- Use literal class strings from this document.
- Use tokens for every color; no hex.
- Implement every state, including the ugly ones.
- Add `aria-*`, labels and focus styles as you go, not later.
- Keep components small; extract when a file exceeds ~250 lines or mixes concerns.
- Keep copy in Vietnamese, following §11.
- Do not invent API endpoints, fields or metrics. If data is missing, use a typed placeholder and mark it.

### 15.3 Definition of done

A change is done only when all are true:

- [ ] Screen matches §9 pattern and §8 component specs.
- [ ] Tokens only; no raw hex; no new config.
- [ ] All states implemented and reachable.
- [ ] Keyboard-only flow works; focus is visible.
- [ ] Light and dark both verified on a real render.
- [ ] 375 / 768 / 1280 / 1536 verified.
- [ ] Vietnamese copy is consistent and formatted correctly.
- [ ] No cross-module UI import; `pnpm lint:structure` passes.
- [ ] `pnpm verify` passes.
- [ ] Self-critique (§13 of `skill.md`) completed; no P0 left.

### 15.4 When the system is missing something

Do **not** invent a one-off style. Choose one:

1. Compose existing primitives.
2. Copy the closest template primitive and extend it **inside your module's `ui/`**.
3. If the gap is genuinely system-wide, propose a token/primitive change with evidence (3+ modules, same need) and get SHARED approval.

Never add a component to `_template/ui` unless the change is intended for every future module.

### 15.5 When asked to "make it look better"

Do not restyle randomly. Diagnose first:

| Symptom | Fix |
|---|---|
| Flat hierarchy | Type scale, weight, spacing, one accent |
| Too noisy | Remove decoration, reduce colors/shadows, increase whitespace |
| Generic | Stronger layout decision, better copy, real content structure |
| Cramped | Increase section gap and padding, not font size |
| Inconsistent | Normalize to §8 recipes; check radius/shadow/state drift |
| Unclear action | One primary CTA; demote the rest |

Then run the five-dimension critique before/after.

### 15.6 Response format for UI work

```markdown
Design Read: surface / mode / scope / dials
Decisions: layout, tokens, primitives, states
Changed: files + why
Verified: viewports, themes, a11y, commands
Known gaps: anything intentionally deferred
```

### 15.7 Copy-paste implementation prompt

```text
Implement [screen/component] in [surface/module].

Read first:
- DESIGN.md §8 for every component you will use, §9 for the page pattern
- the nearest existing module on the same surface
- apps/web/src/app/globals.css and the relevant files in _template/ui

Constraints:
- copy primitives from _template/ui into <module>/ui/; never import across modules
- tokens only; no raw hex, no new tailwind.config, no globals.css edits without approval
- implement default/hover/focus/active/disabled/loading/empty/error/permission states
- keyboard + visible focus + dark mode from the start
- Vietnamese copy per DESIGN.md §11

Deliver:
- Design Read, states list, files changed and why
- verification at 375/768/1280/1536 in light and dark
- self-check against DESIGN.md §17, then report remaining gaps
```

---

## 16. Known template gaps and required fixes

These are real issues in `_template/ui` / existing copies. Fix them **in your module's copy**; for SHARED shell/global files, propose the fix and get agreement. Do not edit `_template` unless the change is system-wide and approved.

| File | Gap | Fix when copying |
|---|---|---|
| `ui/button/Button.tsx` | Outline uses `ring-1 ring-inset ring-gray-300`, invisible under global ring reset | Use `border border-gray-300 dark:border-gray-700` |
| `ui/button/Button.tsx` | Props omit `type` and native button attributes | Extend the copied interface with `type`, `aria-*`, `form` |
| `ui/button/Button.tsx` | No focus-visible style | Add the two-ring focus recipe (§8.1) |
| `ui/form/InputField.tsx` | No focus-visible style; no `aria-invalid`/`aria-describedby`; placeholder contrast fails | Add focus classes; wire error/hint ids; use `placeholder:text-gray-500 dark:placeholder:text-gray-400` |
| `ui/form/Select.tsx` | `appearance-none` with no chevron; no focus style; props omit `id`/`value`/`disabled`/`aria-*` | Add chevron + focus classes; extend props and wire the label |
| `ui/form/TextArea.tsx` | Normal value color is `text-gray-400` | Use `text-gray-800 dark:text-white/90` |
| `ui/form/Switch.tsx` | `div` + click handler, no role/keyboard/`aria-checked` | Rebuild as `button role="switch"` or checkbox input |
| `ui/form/Checkbox.tsx` | No focus-visible indicator | Add a strong focus-visible shadow or border change |
| `ui/modal/index.tsx` | No `role="dialog"`, `aria-modal`, `aria-labelledby`, focus trap, close `aria-label` | Add all before shipping |
| `ui/modal/index.tsx` | Overlay `z-99999`; returns `null` when closed | Normalize to `z-9999`; add exit animation only if needed |
| `ui/dropdown/Dropdown.tsx` | No keyboard navigation or menu ARIA; `z-40`; uses `dark:bg-gray-dark` | Add ARIA/keyboard; normalize surface to `dark:bg-gray-900` |
| `ui/avatar/Avatar.tsx` | `width="0" height="0"`, `sizes="100vw"` | Use real pixel dimensions |
| `ui/PageBreadCrumb.tsx` | Stray `x-text`; English "Home"; hardcoded `/admin` | Remove attribute; localize; derive href |
| `app-shell/components/AppHeader.tsx` | `dark:bg-dark-900` is not a defined token (harmless dead class) | Remove it; `dark:bg-gray-900` is already applied |
| `app-shell` / users search | `focus:ring-3` is dead under global ring reset | Use border + `shadow-focus-ring` |
| Global | `outline: none !important` and ring reset | Compensate; do not add more resets |

If a fix changes the visual result, apply it consistently across the module. Do not mix fixed and unfixed copies in one screen.

---

## 17. Pre-delivery checklist

Copy this into the PR or your final answer.

### System

- [ ] Tokens only; no raw hex/rgb in TSX.
- [ ] No new `tailwind.config`; `globals.css` untouched without approval.
- [ ] One font; no display font in product UI.
- [ ] Radius/shadow/z-index follow §5–§6.
- [ ] No cross-module UI imports; primitives copied into `<module>/ui/`.
- [ ] `ThemeProvider` still mounted once.

### Layout

- [ ] Page follows a §9 pattern.
- [ ] One primary action.
- [ ] Page padding 12/16; section gap 24; field gap 16.
- [ ] No horizontal scroll at 375.
- [ ] Table has a mobile strategy and a sensible `min-w`.

### Components

- [ ] Buttons: primary/outline/ghost/danger used correctly; loading state keeps width.
- [ ] Inputs: visible label, hint/error, `aria-invalid`, `aria-describedby`.
- [ ] Select: chevron, focus style, real label.
- [ ] Modal: ARIA, focus trap, Esc, focus restore, labeled close.
- [ ] Switch/checkbox/radio: semantic control, keyboard, focus-visible.
- [ ] Table: header, hover, skeleton, empty, error, pagination.
- [ ] Badge/alert: text states the meaning; color is not the only signal.
- [ ] Dropdown: keyboard + ARIA + outside click.

### States

- [ ] Default, hover, focus-visible, active, disabled, read-only.
- [ ] Loading, empty, error, permission.
- [ ] Long text, 0 rows, 10k rows, offline, double submit.

### Accessibility

- [ ] Contrast 4.5:1 / 3:1.
- [ ] Keyboard-only flow works.
- [ ] Focus visible on every interactive element (compensating for global reset).
- [ ] `aria-label` on icon-only controls; alt text correct.
- [ ] `prefers-reduced-motion` honored.
- [ ] Targets 44 px touch / 24 px pointer.
- [ ] No color-only state.

### Dark mode

- [ ] Every surface/text/border has a `dark:` value.
- [ ] Contrast checked in dark, not inferred.
- [ ] State parity: hover/focus/disabled/selected remain distinguishable.
- [ ] Images/logos keep detail.

### Content

- [ ] Vietnamese is natural and consistent.
- [ ] Buttons say verb + object; errors say cause + fix.
- [ ] Dates/times/money/numbers use `vi-VN`.
- [ ] No filler, slogans, fake metrics or English placeholders.

### Verification

- [ ] Rendered at 375 / 768 / 1280 / 1536.
- [ ] Light + dark inspected visually.
- [ ] `pnpm verify` passes.
- [ ] Five-dimension critique done; no P0 remaining.

---

## 18. Governance

### 18.1 Changing this document

Change it when:

- A token in `globals.css` changes.
- `_template/ui` changes its API or canonical classes.
- A system-level decision is made (new component, new state pattern, new layout rule).
- The same drift appears in 3+ modules for the same reason.

Do not change it for a single screen's preference.

### 18.2 Drift policy

`pnpm ui:drift` reports copies that diverge from `_template/ui`. Drift is allowed — modules own their UI. But:

- If **one component drifts in 3+ modules for the same reason**, promote the difference to a token or update the template.
- If drift is accidental, re-copy the template and re-apply intentional changes.
- Never "fix" drift by creating a shared component library.

### 18.3 Ownership reminders

- `features/admin/attendance`, `features/employee/attendance`, attendance schema → **Dev 1**.
- `features/admin/tasks`, `features/employee/tasks`, tasks schema → **Dev 2**.
- chat, notifications, their schemas and surfaces → **Dev 3**.
- `users`, `platform`, `database`, `auth`, `admin/ui`, `app-shell` → **SHARED**, requires agreement.
- `globals.css` is SHARED: propose, do not edit unilaterally.

### 18.4 Review questions

Before approving a UI PR:

1. Does it look like OneOps, or like a different product?
2. Is there exactly one primary action?
3. Are all states present?
4. Is focus visible?
5. Does it work at 375 px?
6. Is dark mode designed?
7. Is the copy true, actionable and consistent?
8. Did it add a one-off pattern that should be a system rule?

If any answer is no, it is not ready.

---

> **The standard:** a new developer should not be able to tell which module was built last. That is consistency. A user should not notice the interface at all — only that their work got easier. That is craft.
