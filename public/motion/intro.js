// Binnenkomst (spec 2026-11-15, Motion: intro). De animatie zelf is CSS (base.css: intro-rise/intro-tile),
// zodat de hero niet op GSAP of de fonts hoeft te wachten (performance: LCP en Speed Index). Hier alleen
// de `motion`-class opruimen die <head> zet.
export function intro() {
  document.documentElement.classList.remove('motion')
}
