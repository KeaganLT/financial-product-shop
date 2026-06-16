// ─── InsureTechGuard Design Tokens ────────────────────────────────────────────
// Single source of truth for all design decisions.
// Every component should import from here — never hardcode hex values.
//
// Usage:
//   import { colors, spacing, radius, gradient } from '../tokens';
//   style={{ backgroundColor: colors.brand[100] }}
//   style={{ padding: spacing[4] }}
//   style={{ borderRadius: radius.md }}

// ─── Brand colours ────────────────────────────────────────────────────────────
export const colors = {
    brand: {
        300: '#1C2435',   // darkest brand — used for logo background, dark UI
        200: '#1AAFDE',   // mid brand — gradient end, accent
        100: '#1860BF',   // primary brand blue — CTAs, links, active states
    },

    // ─── Neutrals (greys) ────────────────────────────────────────────────────
    neutral: {
        800: '#1C1C1C',   // near black — primary text
        700: '#3A3A3C',   // dark grey — secondary headings
        600: '#8E8E93',   // mid grey — body text, descriptions, prices
        500: '#AEAEB2',   // light grey — disabled text
        400: '#C7C7CC',   // border grey — card borders, dividers
        300: '#E5E5EA',   // very light grey — disabled backgrounds, hairlines
        200: '#F2F2F7',   // near white — page backgrounds, skeleton blocks
        100: '#FFFFFF',   // white — cards, headers, modals
    },

    // ─── Green ───────────────────────────────────────────────────────────────
    green: {
        400: '#168C34',   // dark green — success text
        300: '#34C759',   // primary green — success states, badges
        200: '#A1EFB5',   // light green — success backgrounds
        100: '#DAF4E1',   // very light green — success tints
    },

    // ─── Yellow ──────────────────────────────────────────────────────────────
    yellow: {
        400: '#E07912',   // dark yellow — warning text
        300: '#FF9F40',   // primary yellow — warning states
        200: '#FFBA75',   // light yellow — warning backgrounds
        100: '#FFEAD6',   // very light yellow — warning tints
    },

    // ─── Red ─────────────────────────────────────────────────────────────────
    red: {
        400: '#C51C13',   // dark red — error text
        300: '#FF3B30',   // primary red — error states, destructive actions
        200: '#FF9F9A',   // light red — error backgrounds
        100: '#FCD0C6',   // very light red — error tints
    },

    // ─── Blue ────────────────────────────────────────────────────────────────
    blue: {
        400: '#005ABD',   // dark blue — informational text
        300: '#007AFF',   // primary blue — informational states
        200: '#A6D0FF',   // light blue — informational backgrounds
        100: '#E4EFFF',   // very light blue — informational tints
    },
};

// ─── Gradient ─────────────────────────────────────────────────────────────────
// The brand gradient — used on primary CTAs and the Add to cart button
export const gradient = {
    brand: `linear-gradient(90deg, ${colors.brand[100]} 0%, ${colors.brand[200]} 100%)`,
};

// ─── Spacing scale ────────────────────────────────────────────────────────────
// Based on 4px base unit matching the Figma spacing tokens
// Usage: padding: spacing[4] → 16px
export const spacing = {
    0:    '0px',
    0.5:  '2px',
    1:    '4px',
    2:    '8px',
    3:    '12px',
    4:    '16px',
    5:    '20px',
    6:    '24px',
    7:    '28px',
    8:    '32px',
    9:    '36px',
    10:   '40px',
    11:   '44px',
    12:   '48px',
    13:   '52px',
    14:   '56px',
    15:   '60px',
};

// ─── Border radius ────────────────────────────────────────────────────────────
export const radius = {
    none:   '0px',
    xs:     '2px',
    sm:     '4px',    // discount badges, small tags
    md:     '8px',    // product images, cards
    lg:     '12px',   // related product cards
    xl:     '24px',   // hero slider cards
    round:  '50px',   // pills, filter tabs
    full:   '100px',  // buttons, avatars
};

// ─── Typography ───────────────────────────────────────────────────────────────
// Font families used across the app
export const font = {
    sans: 'Roboto, -apple-system, BlinkMacSystemFont, sans-serif',
};

// Common text styles — matches Figma type scale exactly
export const text = {
    // Headlines
    headline1: { fontSize: '34px', fontWeight: 700, lineHeight: '41px', letterSpacing: '0.41px' },
    headline2: { fontSize: '28px', fontWeight: 700, lineHeight: '34px', letterSpacing: '0.41px' },
    headline3Bold: { fontSize: '20px', fontWeight: 700, lineHeight: '28px', letterSpacing: '0.35px' },
    headline3Regular: { fontSize: '20px', fontWeight: 400, lineHeight: '28px', letterSpacing: '0.35px' },
    // Body
    body17Semibold: { fontSize: '17px', fontWeight: 600, lineHeight: '22px', letterSpacing: '0.0035em' },
    body17Regular: { fontSize: '17px', fontWeight: 400, lineHeight: '22px', letterSpacing: '0.0035em' },
    body15Regular: { fontSize: '15px', fontWeight: 400, lineHeight: '20px', letterSpacing: '0.41px' },
    // Taglines / captions
    tagline13: { fontSize: '13px', fontWeight: 400, lineHeight: '18px', letterSpacing: '0.41px' },
    tagline11: { fontSize: '11px', fontWeight: 400, lineHeight: '14px', letterSpacing: '0.41px' },
};