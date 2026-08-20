/**
 * Self-contained styles for the mounted form. The original pages used the
 * Tailwind CDN; a distributable package can't rely on that, so the visual
 * design is reproduced here as scoped CSS under `.pf-root`. The critical bit
 * for the research instrumentation is the `.pf-reveal` / `.pf-reveal.pf-visible`
 * pair — it matches the original reveal animation so reaction timing is
 * measured the same way.
 */

export const ACCENTS = {
  green: { ring: '#16a34a', btn: '#16a34a', btnHover: '#15803d', dot: '#16a34a' },
  blue: { ring: '#3b82f6', btn: '#2563eb', btnHover: '#1d4ed8', dot: '#3b82f6' },
};

export const PANEL_TONES = {
  green: { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534' },
  amber: { bg: '#fffbeb', border: '#fde68a', text: '#92400e' },
  blue: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af' },
  purple: { bg: '#faf5ff', border: '#e9d5ff', text: '#6b21a8' },
  yellow: { bg: '#fefce8', border: '#fde047', text: '#854d0e' },
};

export function buildCss(accentName) {
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

/* Reveal animation — matches the original research pages exactly so the
   reveal→first-interaction timing signal is preserved. */
.pf-reveal{opacity:0;position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;}
.pf-reveal.pf-visible{position:relative;width:auto;height:auto;overflow:visible;pointer-events:auto;
  animation:pfFadeSlideIn .35s ease forwards;}
@keyframes pfFadeSlideIn{from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:translateY(0);}}
`;
}

function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
