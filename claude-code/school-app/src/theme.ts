/**
 * Design tokens ported from classconnect_app_preview.html.
 *
 * Colour and radius values are taken verbatim from the prototype's `:root` block
 * so the app matches the approved design exactly. The spacing scale is the one
 * thing invented here: the prototype has no scale at all, every value is ad-hoc
 * px, so these are the recurring values rounded onto a 4px-ish rhythm.
 *
 * The design is light-only by decision (app.json sets userInterfaceStyle: light).
 */

export const color = {
  bg: '#F3F6F8',
  surface: '#FFFFFF',

  ink: '#182333',
  inkSoft: '#5C6B7A',
  inkFaint: '#93A2AF',

  navy: '#1B3A6B',
  navyDeep: '#122A50',
  navyTint: '#E7ECF3',

  emerald: '#1E9E6B',
  emeraldSoft: '#DFF5EA',
  emeraldText: '#146A48',

  blue: '#3B6EA8',
  blueSoft: '#E4EDF6',
  blueText: '#2A527D',

  yellow: '#D9A21B',
  yellowSoft: '#FBF1D9',
  yellowText: '#8A6A10',

  orange: '#E08A2E',
  orangeSoft: '#FCEBDA',
  orangeText: '#A85D1C',

  coral: '#E15A5A',
  coralSoft: '#FBE6E6',
  coralText: '#A83232',

  line: '#E3EAEE',

  /** Greys the prototype hard-codes without tokenising. */
  neutral: '#EEF2F4', // inactive chips, badge-neutral, ring track
  track: '#E3ECEF', // segmented control track
  trackOff: '#D7E1E6', // toggle, off state
  weekendText: '#C3CDD6',
} as const;

/**
 * Semantic roles. Attendance status, grade letters and badges all resolve
 * through here so a colour is never picked ad hoc at the call site.
 */
export const semantic = {
  safe: { bg: color.emeraldSoft, fg: color.emeraldText, solid: color.emerald },
  info: { bg: color.blueSoft, fg: color.blueText, solid: color.blue },
  warning: { bg: color.yellowSoft, fg: color.yellowText, solid: color.yellow },
  caution: { bg: color.orangeSoft, fg: color.orangeText, solid: color.orange },
  danger: { bg: color.coralSoft, fg: color.coralText, solid: color.coral },
  neutral: { bg: color.neutral, fg: color.inkSoft, solid: color.inkFaint },
} as const;

/** attendance_status enum -> colour role. Mirrors the prototype's .att-btn classes. */
export const attendanceRole = {
  present: 'safe',
  absent: 'danger',
  late: 'warning',
  leave: 'info',
} as const satisfies Record<string, keyof typeof semantic>;

/** Grade letters. The prototype has no 'E'. */
export const gradeRole = {
  A: 'safe',
  B: 'info',
  C: 'warning',
  D: 'caution',
  F: 'danger',
} as const satisfies Record<string, keyof typeof semantic>;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 26,
  /** Horizontal padding for every screen and overlay. */
  screen: 18,
  /** Inner padding of a card. */
  card: 15,
  /** Vertical gap between stacked cards. */
  cardGap: 11,
} as const;

export const radius = {
  card: 22, // --radius-lg
  panel: 16, // --radius-md
  button: 14,
  input: 12,
  chip: 10,
  badge: 9,
  cell: 8, // calendar cell, attendance button
  pill: 100, // badges, chips, segmented, toggles
} as const;

export const font = {
  /** Body and UI. */
  body: 'Inter',
  /** Headings, numerics, brand. */
  display: 'Manrope',
  /** Urdu. Android renders Urdu badly without this bundled. */
  urdu: 'NotoNastaliqUrdu',
} as const;

export const type = {
  pageTitle: { fontFamily: font.display, fontSize: 21, color: color.navyDeep, letterSpacing: -0.2 },
  sectionTitle: { fontFamily: font.display, fontSize: 14.5, color: color.ink },
  overlayTitle: { fontFamily: font.display, fontSize: 15.5, color: color.ink },
  eyebrow: { fontFamily: font.body, fontSize: 12, color: color.inkSoft },
  listTitle: { fontFamily: font.body, fontSize: 13.5, color: color.ink },
  listSub: { fontFamily: font.body, fontSize: 11.5, color: color.inkSoft },
  badge: { fontFamily: font.body, fontSize: 11 },
  statValue: { fontFamily: font.display, fontSize: 16, color: color.ink },
  navLabel: { fontFamily: font.body, fontSize: 10 },
} as const;

/**
 * The prototype's --shadow-sm. RN needs the pieces separately; elevation is the
 * Android equivalent since we ship Android first.
 */
export const shadow = {
  card: {
    shadowColor: '#1B3A6B',
    shadowOpacity: 0.14,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  raised: {
    shadowColor: '#1B3A6B',
    shadowOpacity: 0.5,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
} as const;

/** The six gradient avatar presets (av-1..av-6). Students get one by avatar_seed. */
export const avatarGradients = [
  [color.navy, color.emerald],
  [color.emerald, color.blue],
  [color.yellow, color.navy],
  [color.blue, color.emerald],
  [color.navy, color.yellow],
  [color.emerald, color.navyDeep],
] as const;

export const theme = {
  color,
  semantic,
  attendanceRole,
  gradeRole,
  space,
  radius,
  font,
  type,
  shadow,
  avatarGradients,
} as const;

export type Theme = typeof theme;
