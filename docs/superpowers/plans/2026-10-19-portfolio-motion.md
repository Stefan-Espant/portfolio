# Portfolio redesign — Plan 3: Motion

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** De zeven goedgekeurde GSAP-effecten toevoegen (intro, lichtbundel, kopjes per letter, bento met tilt, marquee op scrollsnelheid, horizontale stroken en tijdlijn, pagina-overgang), plus parallax en optellende cijfers, volgens de performance-regels uit de spec.

**Architecture:** GSAP, ScrollTrigger en SplitText komen uit het npm-pakket `gsap` en worden door `wald.config.ts` naar `public/vendor/` gekopieerd en als `defer`-scripts geladen. De effecten staan in kleine ES-modules in `public/motion/` (één bestand per effectgroep), gestart vanuit `public/motion/index.js`. Elementen kiezen hun effect via de `data-motion`-attributen uit plan 2. Pure rekenhulpjes (`public/motion/utils.js`) worden met Vitest getest. Bij `prefers-reduced-motion` of zonder JavaScript blijft alles statisch zichtbaar.

**Tech Stack:** GSAP 3.15 (ScrollTrigger, SplitText, `gsap.matchMedia`, `quickTo`), vanilla ES-modules, CSS view transitions, Vitest.

**Spec:** [2026-10-12-portfolio-redesign-design.md](../specs/2026-10-12-portfolio-redesign-design.md), secties "Motion" en "Performance-regels".

**Referentie:** de goedgekeurde demo `.superpowers/brainstorm/16805-1792355737/content/home-compleet.html` (lichte versie, saffraan) en `case-tijdlijn.html`.

---

## Voordat je begint

- Branch `redesign`, repo `/Users/stefan/Desktop/hva-FDND/portfolio`. Lees en toon nooit waarden uit `.env`.
- **Bekijken:** `npm run build:preview` bouwt met de concepten uit Centaur. Er draait al een server op poort **4321** die `.vercel/output/static` serveert — na een build is die meteen bijgewerkt. Stop nooit processen op 4321, 4330 of 7233. Gebruik voor eigen checks eventueel 4322 en stop die server via de PID uit `lsof -ti :4322`.
- **JavaScript-fouten opsporen:** `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --enable-logging=stderr --v=0 --virtual-time-budget=5000 --dump-dom http://127.0.0.1:4321/ 2>&1 | grep -iE "Uncaught|SyntaxError|TypeError|ReferenceError"` — moet niets opleveren. Headless Chrome speelt GSAP-animaties niet betrouwbaar af; de echte bewegingscheck doet Stefan in zijn browser.
- **Performance-regels (spec):** alleen `transform`/`opacity` animeren (plus éénmalig de `wght`-as in de intro); geen `filter`, `mask`, `backdrop-filter` of `mix-blend-mode`; alles wat de muis volgt via `gsap.quickTo`, nooit een nieuwe tween per `pointermove`; afmetingen meten bij `pointerenter`; listeners `passive`; doorlopende animaties pauzeren buiten beeld; muis-effecten alleen bij `(pointer: fine)`.
- **Afwijking van de spec (bewust, wordt in Task 8 vastgelegd):** alleen de home-intro wacht met tonen op JavaScript (class `motion` op `<html>`), met een fail-safe van 3 seconden in `<head>`. Zonder JavaScript, bij reduced motion of als het script faalt, is alles meteen zichtbaar.
- Commit-messages eindigen met je standaard Co-Authored-By-regel.

## File map

| Bestand | Verantwoordelijkheid |
|---|---|
| `wald.config.ts` | GSAP-bestanden naar `public/vendor/` kopiëren |
| `src/layouts/Layout.wald` | Head-scripts (fail-safe, GSAP, motion), lichtbundel- en wipe-element |
| `src/styles/base.css` | Intro-verberg-regel, `.torch`, `.wipe`, view transitions |
| `public/motion/utils.js` | Pure helpers: teller, actieve tijdlijnstappen, cijfers parsen/formatteren |
| `tests/motion-utils.test.js` | Vitest voor `utils.js` |
| `public/motion/index.js` | Start: reduced-motion-check, plugins, effecten aanroepen |
| `public/motion/intro.js` | Home-intro |
| `public/motion/ambient.js` | Parallax en lichtbundel |
| `public/motion/reveal.js` | Kopjes per letter, bento met tilt |
| `public/motion/marquee.js` | Marquee op scrollsnelheid |
| `public/motion/count.js` | Optellende cijfers |
| `public/motion/scroll.js` | Horizontale stroken en tijdlijn |
| `public/motion/transition.js` | Pagina-overgang |
| `src/components/HScroll.wald`, `Timeline.wald`, `ProjectCard.wald` | CSS voor de gepinde/horizontale stand en de lichtvlek |

---

### Task 1: Rekenhulpjes (TDD)

**Files:**
- Create: `public/motion/utils.js`, `tests/motion-utils.test.js`
- Modify: `vitest.config.ts`

- [ ] **Step 1: Vitest ook in `tests/` laten zoeken**

Vervang in `vitest.config.ts` de `include`-regel door:

```ts
    include: ['src/**/*.test.ts', 'scripts/**/*.test.ts', 'tests/**/*.test.js']
```

- [ ] **Step 2: Failing tests schrijven**

`tests/motion-utils.test.js`:

```js
import { describe, expect, test } from 'vitest'
import { activeSteps, counterLabel, formatCount, parseCount } from '../public/motion/utils.js'

describe('counterLabel', () => {
  test('geeft het huidige item van een strook, met voorloopnul', () => {
    expect(counterLabel(0, 5)).toBe('01')
    expect(counterLabel(0.45, 5)).toBe('03')
    expect(counterLabel(0.99, 5)).toBe('05')
    expect(counterLabel(1, 5)).toBe('05')
    expect(counterLabel(0.5, 12)).toBe('07')
  })
})

describe('activeSteps', () => {
  test('een stap gaat aan zodra de lijn zijn stip bereikt', () => {
    expect(activeSteps(0, 3)).toBe(1)
    expect(activeSteps(0.3, 3)).toBe(1)
    expect(activeSteps(0.44, 3)).toBe(2)
    expect(activeSteps(0.9, 3)).toBe(3)
    expect(activeSteps(1, 3)).toBe(3)
    expect(activeSteps(0.5, 1)).toBe(1)
    expect(activeSteps(0.5, 0)).toBe(0)
  })
})

describe('parseCount en formatCount', () => {
  test('herkent getallen met voor- en achtervoegsel en behoudt het decimaalteken', () => {
    expect(parseCount('100')).toEqual({ prefix: '', value: 100, decimals: 0, separator: '.', suffix: '' })
    expect(parseCount('0,4 s')).toEqual({ prefix: '', value: 0.4, decimals: 1, separator: ',', suffix: ' s' })
    expect(parseCount('± 2.5 KB')).toEqual({ prefix: '± ', value: 2.5, decimals: 1, separator: '.', suffix: ' KB' })
    expect(parseCount('100%')).toEqual({ prefix: '', value: 100, decimals: 0, separator: '.', suffix: '%' })
  })

  test('geeft null zonder getal', () => {
    expect(parseCount('veel')).toBeNull()
    expect(parseCount('')).toBeNull()
  })

  test('formatCount schrijft een tussenwaarde in hetzelfde formaat', () => {
    const parsed = parseCount('0,4 s')
    expect(formatCount(parsed, 0)).toBe('0,0 s')
    expect(formatCount(parsed, 0.25)).toBe('0,3 s')
    expect(formatCount(parseCount('100%'), 42.4)).toBe('42%')
  })
})
```

- [ ] **Step 3: Tests draaien en zien falen**

Run: `npx vitest run tests/motion-utils.test.js`
Expected: FAIL, `Failed to resolve import "../public/motion/utils.js"`.

- [ ] **Step 4: `public/motion/utils.js` schrijven**

```js
// Pure rekenhulpjes voor de animaties (getest in tests/motion-utils.test.js).

/** Teller van een horizontale strook: welk item nu in beeld is, als "01", "02", … */
export function counterLabel(progress, count) {
  const index = Math.min(count, Math.max(1, Math.floor(progress * count) + 1))
  return String(index).padStart(2, '0')
}

/** Hoeveel tijdlijnstappen actief zijn: een stap gaat aan zodra de lijn zijn stip bereikt. */
export function activeSteps(progress, count) {
  if (count <= 1) return count
  return Math.min(count, Math.floor(progress * (count - 1) + 0.15) + 1)
}

/** "0,4 s" → { prefix: '', value: 0.4, decimals: 1, separator: ',', suffix: ' s' }; null zonder getal. */
export function parseCount(text) {
  const match = String(text).trim().match(/^(\D*?)(\d+(?:[.,]\d+)?)(.*)$/)
  if (!match) return null
  const [, prefix, number, suffix] = match
  const separator = number.includes(',') ? ',' : '.'
  const fraction = number.split(/[.,]/)[1]
  return { prefix, value: parseFloat(number.replace(',', '.')), decimals: fraction ? fraction.length : 0, separator, suffix }
}

/** Een tussenwaarde in hetzelfde formaat als het origineel. */
export function formatCount(parsed, value) {
  return parsed.prefix + value.toFixed(parsed.decimals).replace('.', parsed.separator) + parsed.suffix
}
```

- [ ] **Step 5: Tests draaien en zien slagen**

Run: `npx vitest run`
Expected: alles groen (67 bestaande + de nieuwe).

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts public/motion/utils.js tests/motion-utils.test.js
git commit -m "feat: tested helpers for motion counters, timeline steps and count-up"
```

---

### Task 2: Infrastructuur — GSAP laden, start-script, fail-safe

**Files:**
- Modify: `wald.config.ts`, `src/layouts/Layout.wald`, `src/styles/base.css`
- Create: `public/motion/index.js`

- [ ] **Step 1: GSAP naar `public/vendor/` kopiëren**

In `wald.config.ts`: vervang de importregels bovenaan door

```ts
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { parseEnv } from 'node:util'
import { defineConfig, vercelAdapter } from '@waldjs/cli'

// GSAP met ScrollTrigger en SplitText als losse bestanden naast de site (public/vendor staat in
// .gitignore): de browser cachet ze en ze laden alleen met defer.
const gsapDist = join(dirname(createRequire(join(process.cwd(), 'package.json')).resolve('gsap/package.json')), 'dist')
mkdirSync('public/vendor', { recursive: true })
for (const file of ['gsap.min.js', 'ScrollTrigger.min.js', 'SplitText.min.js']) {
  copyFileSync(join(gsapDist, file), join('public/vendor', file))
}
```

(de rest van het bestand blijft gelijk).

- [ ] **Step 2: `public/motion/index.js` schrijven**

```js
// Beweging voor de hele site (spec: Motion). GSAP, ScrollTrigger en SplitText staan als defer-scripts
// in <head>; dit module-script draait daarna. Bij prefers-reduced-motion of als GSAP ontbreekt
// gebeurt er niets en blijft alles statisch zichtbaar.
const root = document.documentElement
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const { gsap, ScrollTrigger, SplitText } = window

function stop() {
  root.classList.remove('motion', 'is-arriving')
}

if (reduced || !gsap || !ScrollTrigger || !SplitText) {
  stop()
} else {
  gsap.registerPlugin(ScrollTrigger, SplitText)
  ScrollTrigger.config({ ignoreMobileResize: true })
  const finePointer = window.matchMedia('(pointer: fine)').matches

  document.fonts.ready.then(() => {
    window.__motionReady = true
    // Effecten worden in de volgende taken hier aangeroepen.
    ScrollTrigger.refresh()
  }).catch(stop)
}
```

- [ ] **Step 3: Layout — scripts en elementen**

In `src/layouts/Layout.wald`, frontmatter: voeg vóór de regel `const nav = await Nav.render(…)` toe:

```ts
// Beweging (plan 3). Het inline script zet vóór de eerste paint `motion` op <html> (alleen de
// home-intro wacht daarop) en `is-arriving` als de vorige pagina met de wipe vertrok. Start het
// motion-script niet binnen 3 s, dan gaan beide classes eraf: inhoud blijft nooit onzichtbaar.
const motionHead = `<script data-wald-no-hoist>(function(){var d=document.documentElement;if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;d.classList.add('motion');try{if(sessionStorage.getItem('wipe')==='1'){d.classList.add('is-arriving');sessionStorage.removeItem('wipe')}}catch(e){}setTimeout(function(){if(!window.__motionReady)d.classList.remove('motion','is-arriving')},3000)})()</script>
    <script src="/vendor/gsap.min.js" defer data-wald-no-hoist></script>
    <script src="/vendor/ScrollTrigger.min.js" defer data-wald-no-hoist></script>
    <script src="/vendor/SplitText.min.js" defer data-wald-no-hoist></script>
    <script type="module" src="/motion/index.js" data-wald-no-hoist></script>`
```

In het template: voeg in `<head>` direct na `{new SafeHtml(inlineCss)}` toe: `{new SafeHtml(motionHead)}`.
Voeg in `<body>` direct na de skip-link toe:

```wald
    <div class="torch" aria-hidden="true"></div>
```

en vlak vóór `</body>`:

```wald
    <div class="wipe" aria-hidden="true"><span class="wipe__logo">Steefan</span></div>
```

- [ ] **Step 4: Basis-CSS**

Voeg onderaan `src/styles/base.css` toe:

```css
/* ── Motion (plan 3) ──────────────────────────────────────────────────────────────────── */

/* Alleen de home-intro wacht op JavaScript; de fail-safe in <head> haalt `motion` na 3 s weg. */
.motion [data-motion='intro'] {
  visibility: hidden;
}

/* Lichtbundel die de muis volgt (spec: Motion #2). Onzichtbaar tot motion.js hem aanzet. */
.torch {
  position: fixed;
  top: -260px;
  left: -260px;
  z-index: -1;
  width: 520px;
  height: 520px;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(255 214 150 / 0.13) 0%, rgb(255 214 150 / 0.05) 40%, transparent 70%);
  opacity: 0;
  pointer-events: none;
  will-change: transform;
}

/* Pagina-overgang (spec: Motion #7). */
.wipe {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  border-top: 2px solid var(--accent);
  background: var(--brand);
  transform: scaleY(0);
  transform-origin: bottom;
  pointer-events: none;
}
.wipe__logo {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  color: var(--accent);
  opacity: 0;
}
.is-arriving .wipe {
  transform: none;
}
.is-arriving .wipe__logo {
  opacity: 1;
}

@media (prefers-reduced-motion: no-preference) {
  @view-transition {
    navigation: auto;
  }
}
```

- [ ] **Step 5: Controleren**

```bash
npm run check && npm run build:preview
ls .vercel/output/static/vendor .vercel/output/static/motion
grep -c "motion/index.js" .vercel/output/static/index.html
```

Expected: check schoon; `vendor/` bevat de drie GSAP-bestanden, `motion/` bevat `index.js` en `utils.js`; grep geeft 1. Voer de "JavaScript-fouten opsporen"-check uit (zie "Voordat je begint"): geen fouten. Screenshot `/` (1280): de home ziet er hetzelfde uit als voorheen (intro wordt na laden zichtbaar).

- [ ] **Step 6: Commit**

```bash
git add wald.config.ts public/motion/index.js src/layouts/Layout.wald src/styles/base.css
git commit -m "feat: load GSAP, motion entry point, fail-safe and transition elements"
```

---

### Task 3: Intro, parallax en lichtbundel

**Files:**
- Create: `public/motion/intro.js`, `public/motion/ambient.js`
- Modify: `public/motion/index.js`

- [ ] **Step 1: `public/motion/intro.js`**

```js
// Home-intro (spec: Motion #1): de kopregels schuiven uit een masker omhoog terwijl Fraunces van dun
// naar vet groeit, het logo-verloop veegt erdoorheen, de steen zoomt rustig in en de lead fadet in.
export function intro(gsap, SplitText) {
  const root = document.documentElement
  const hero = document.querySelector('[data-motion="intro"]')
  const logo = document.querySelector('.nav__home')
  const styles = getComputedStyle(root)
  const accent = styles.getPropertyValue('--accent').trim()
  const accent2 = styles.getPropertyValue('--accent-2').trim()
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })

  tl.from('.stone', { scale: 1.08, duration: 1.6, ease: 'power2.out' }, 0)
  if (logo) {
    tl.fromTo(logo,
      { backgroundImage: `linear-gradient(90deg, ${accent}, #fff3cf, ${accent2})`, backgroundSize: '200% 100%', backgroundPosition: '100% 0' },
      { backgroundPosition: '0% 0', duration: 1.8, ease: 'power2.inOut', clearProps: 'backgroundImage,backgroundSize,backgroundPosition' }, 0.1)
  }

  if (!hero) {
    root.classList.remove('motion')
    return
  }
  const title = hero.querySelector('h1')
  const rest = [...hero.children].filter(element => element !== title)
  const split = title ? SplitText.create(title, { type: 'lines', mask: 'lines' }) : null
  // Beginstand zetten en dan pas zichtbaar maken: geen flits van de eindstand.
  gsap.set(rest, { autoAlpha: 0, y: 20 })
  root.classList.remove('motion')

  if (split) {
    tl.from(split.lines, { yPercent: 110, duration: 1.1, stagger: 0.12, onComplete: () => split.revert() }, 0.2)
      .fromTo(title,
        { fontVariationSettings: "'opsz' 144, 'wght' 300" },
        { fontVariationSettings: "'opsz' 144, 'wght' 700", duration: 1.6, ease: 'power3.out', clearProps: 'fontVariationSettings' }, 0.3)
  }
  tl.to(rest, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.12, clearProps: 'all' }, 0.7)
}
```

- [ ] **Step 2: `public/motion/ambient.js`**

```js
// Parallax op de steen en de lichtbundel die de muis volgt (spec: Motion #2).

export function parallax(gsap) {
  gsap.to('[data-motion="parallax"]', {
    yPercent: 8,
    ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: true }
  })
}

export function torch(gsap) {
  const element = document.querySelector('.torch')
  if (!element) return
  gsap.set(element, { x: innerWidth / 2, y: innerHeight * 0.4, autoAlpha: 1 })
  // quickTo: één doorlopende tween per as, geen nieuwe tween per muisbeweging.
  const moveX = gsap.quickTo(element, 'x', { duration: 0.6, ease: 'power3' })
  const moveY = gsap.quickTo(element, 'y', { duration: 0.6, ease: 'power3' })
  addEventListener('pointermove', event => {
    moveX(event.clientX)
    moveY(event.clientY)
  }, { passive: true })
}
```

- [ ] **Step 3: `public/motion/index.js` aanvullen**

Voeg bovenaan (vóór `const root`) toe:

```js
import { intro } from './intro.js'
import { parallax, torch } from './ambient.js'
```

Vervang de regel `// Effecten worden in de volgende taken hier aangeroepen.` door:

```js
    intro(gsap, SplitText)
    parallax(gsap)
    if (finePointer) torch(gsap)
    // Effecten worden in de volgende taken hier aangeroepen.
```

- [ ] **Step 4: Controleren**

`npm run build:preview`; JavaScript-fouten-check (geen fouten); screenshot `/` met `--virtual-time-budget=6000`: de hero-kop en lead zijn zichtbaar (eindstand). Screenshot met `--force-prefers-reduced-motion`: ook zichtbaar, geen lichtbundel.

- [ ] **Step 5: Commit**

```bash
git add public/motion/intro.js public/motion/ambient.js public/motion/index.js
git commit -m "feat: home intro, stone parallax and pointer torch"
```

---

### Task 4: Kopjes per letter en bento met tilt

**Files:**
- Create: `public/motion/reveal.js`
- Modify: `public/motion/index.js`, `src/components/ProjectCard.wald`

- [ ] **Step 1: `public/motion/reveal.js`**

```js
// Sectiekopjes per letter (spec: Motion #3) en de bento: opbouwen, kantelen naar de muis en een
// lichtvlek onder de cursor (spec: Motion #4).

export function chars(gsap, SplitText) {
  gsap.utils.toArray('h2.display').forEach(title => {
    const split = SplitText.create(title, { type: 'chars', mask: 'chars' })
    gsap.from(split.chars, {
      yPercent: 100,
      rotate: 6,
      duration: 0.7,
      stagger: 0.03,
      ease: 'back.out(1.8)',
      scrollTrigger: { trigger: title, start: 'top 85%', once: true },
      onComplete: () => split.revert()
    })
  })
}

export function bento(gsap, finePointer) {
  gsap.utils.toArray('[data-motion="bento"]').forEach(grid => {
    gsap.from(grid.children, {
      y: 60,
      rotateX: -12,
      transformPerspective: 900,
      autoAlpha: 0,
      duration: 1,
      stagger: 0.12,
      ease: 'power3.out',
      clearProps: 'transform,opacity,visibility',
      scrollTrigger: { trigger: grid, start: 'top 80%', once: true }
    })
  })
  if (!finePointer) return
  document.querySelectorAll('[data-motion="bento"] .project-card').forEach(card => tilt(gsap, card))
}

function tilt(gsap, card) {
  gsap.set(card, { transformPerspective: 900 })
  const rotateY = gsap.quickTo(card, 'rotationY', { duration: 0.4, ease: 'power2.out' })
  const rotateX = gsap.quickTo(card, 'rotationX', { duration: 0.4, ease: 'power2.out' })
  let box = null
  // Afmetingen één keer meten bij binnenkomst, niet bij elke beweging.
  card.addEventListener('pointerenter', () => { box = card.getBoundingClientRect() })
  card.addEventListener('pointermove', event => {
    if (!box) return
    const x = (event.clientX - box.left) / box.width
    const y = (event.clientY - box.top) / box.height
    card.style.setProperty('--cx', `${x * 100}%`)
    card.style.setProperty('--cy', `${y * 100}%`)
    rotateY((x - 0.5) * 10)
    rotateX((0.5 - y) * 10)
  }, { passive: true })
  card.addEventListener('pointerleave', () => {
    box = null
    gsap.to(card, { rotationY: 0, rotationX: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)', overwrite: true })
  })
}
```

- [ ] **Step 2: Lichtvlek in `src/components/ProjectCard.wald`**

Voeg in de `<style>`, in het `.project-card {…}`-blok, toe: `position: relative;` (bovenaan het blok) en direct na de `&:hover, &:focus-visible {…}`-regel:

```css
  /* Lichtvlek onder de cursor (motion.js zet --cx/--cy op bento-kaarten). */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: radial-gradient(circle 180px at var(--cx, 50%) var(--cy, 50%), rgb(255 176 0 / 0.14), transparent 70%);
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
  }
  &:hover::after {
    opacity: 1;
  }
```

- [ ] **Step 3: `public/motion/index.js` aanvullen**

Voeg bij de imports toe: `import { bento, chars } from './reveal.js'`, en vóór de regel `// Effecten worden in de volgende taken hier aangeroepen.`:

```js
    chars(gsap, SplitText)
    bento(gsap, finePointer)
```

- [ ] **Step 4: Controleren en committen**

`npm run check && npm run build:preview`; JavaScript-fouten-check; screenshot `/werk/` en `/` (eindstand, kopjes in saffraan zichtbaar).

```bash
git add public/motion/reveal.js public/motion/index.js src/components/ProjectCard.wald
git commit -m "feat: per-character section headings and bento build-in with tilt"
```

---

### Task 5: Marquee en optellende cijfers

**Files:**
- Create: `public/motion/marquee.js`, `public/motion/count.js`
- Modify: `public/motion/index.js`

- [ ] **Step 1: `public/motion/marquee.js`**

```js
// Marquee (spec: Motion #5): loopt continu, versnelt mee met de scrollsnelheid, draait om bij
// omhoog scrollen en staat stil buiten beeld.
export function marquee(gsap, ScrollTrigger) {
  document.querySelectorAll('[data-motion="marquee"]').forEach(band => {
    const track = band.querySelector('.marquee__track')
    if (!track) return
    const loop = gsap.to(track, { xPercent: -100 / 3, duration: 24, ease: 'none', repeat: -1, paused: true })
    // Ver vooruit beginnen, zodat achteruit lopen (omhoog scrollen) nooit tegen het begin stuit.
    loop.totalTime(loop.duration() * 1000)
    const speed = { value: 1 }
    const apply = () => loop.timeScale(speed.value)
    ScrollTrigger.create({
      trigger: band,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: self => (self.isActive ? loop.play() : loop.pause()),
      onUpdate: self => {
        const target = self.direction * (1 + Math.min(5, Math.abs(self.getVelocity()) / 300))
        // Eén snelheids-tween tegelijk (overwrite), daarna rustig terug naar normaal tempo.
        gsap.to(speed, {
          value: target,
          duration: 0.25,
          overwrite: true,
          onUpdate: apply,
          onComplete: () => gsap.to(speed, { value: self.direction, duration: 1, onUpdate: apply })
        })
      }
    })
  })
}
```

- [ ] **Step 2: `public/motion/count.js`**

```js
// Cijfers op case studies tellen op zodra ze in beeld komen. Tekst zonder getal blijft staan.
import { formatCount, parseCount } from './utils.js'

export function counts(gsap) {
  document.querySelectorAll('[data-motion="count"]').forEach(element => {
    const original = element.textContent || ''
    const parsed = parseCount(original)
    if (!parsed) return
    const state = { value: 0 }
    gsap.to(state, {
      value: parsed.value,
      duration: 1.6,
      ease: 'power2.out',
      scrollTrigger: { trigger: element, start: 'top 85%', once: true },
      onStart: () => { element.textContent = formatCount(parsed, 0) },
      onUpdate: () => { element.textContent = formatCount(parsed, state.value) },
      onComplete: () => { element.textContent = original }
    })
  })
}
```

- [ ] **Step 3: `public/motion/index.js` aanvullen**

Imports: `import { marquee } from './marquee.js'` en `import { counts } from './count.js'`. Vóór `// Effecten worden in de volgende taken hier aangeroepen.`:

```js
    marquee(gsap, ScrollTrigger)
    counts(gsap)
```

- [ ] **Step 4: Controleren en committen**

`npm run build:preview`; JavaScript-fouten-check.

```bash
git add public/motion/marquee.js public/motion/count.js public/motion/index.js
git commit -m "feat: scroll-velocity marquee and count-up metrics"
```

---

### Task 6: Horizontale stroken en tijdlijn

**Files:**
- Create: `public/motion/scroll.js`
- Modify: `public/motion/index.js`, `src/components/HScroll.wald`, `src/components/Timeline.wald`

- [ ] **Step 1: `public/motion/scroll.js`**

```js
// Horizontale stroken (spec: Motion #6) en de tijdlijn op case studies. Alleen vanaf 48rem; daaronder
// blijven het de swipe-lijst en de verticale tijdlijn uit plan 2. gsap.matchMedia ruimt alles op als
// het scherm smaller wordt.
import { activeSteps, counterLabel } from './utils.js'

export function hscroll(gsap) {
  gsap.matchMedia().add('(min-width: 48rem)', () => {
    const pinned = []
    document.querySelectorAll('[data-motion="hscroll"]').forEach(section => {
      const track = section.querySelector('.hscroll__track')
      const bar = section.querySelector('.hscroll__progress i')
      const current = section.querySelector('[data-hscroll-current]')
      if (!track) return
      section.classList.add('is-pinned')
      const distance = () => Math.max(0, track.scrollWidth - section.clientWidth)
      // Past alles al naast elkaar, dan niet pinnen.
      if (distance() === 0) {
        section.classList.remove('is-pinned')
        return
      }
      pinned.push(section)
      const count = track.children.length
      gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${distance()}`,
          scrub: 1,
          pin: true,
          invalidateOnRefresh: true,
          onUpdate: self => { if (current) current.textContent = counterLabel(self.progress, count) }
        }
      })
        .to(track, { x: () => -distance(), ease: 'none' }, 0)
        .fromTo(bar, { scaleX: 0 }, { scaleX: 1, ease: 'none' }, 0)
    })
    return () => pinned.forEach(section => section.classList.remove('is-pinned'))
  })
}

export function timeline(gsap) {
  gsap.matchMedia().add('(min-width: 48rem)', () => {
    const sections = [...document.querySelectorAll('[data-motion="timeline"]')]
    sections.forEach(section => {
      const body = section.querySelector('.timeline__body')
      const fill = section.querySelector('.timeline__line i')
      const steps = [...section.querySelectorAll('.timeline__step')]
      if (!body || !steps.length) return
      section.classList.add('is-horizontal')
      const distance = () => Math.max(0, body.scrollWidth - section.clientWidth)
      const setActive = progress => {
        const active = activeSteps(progress, steps.length)
        steps.forEach((step, index) => step.classList.toggle('is-active', index < active))
      }
      setActive(0)
      gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${distance()}`,
          scrub: 1,
          pin: true,
          invalidateOnRefresh: true,
          onUpdate: self => setActive(self.progress)
        }
      })
        .to(body, { x: () => -distance(), ease: 'none' }, 0)
        .fromTo(fill, { scaleX: 0 }, { scaleX: 1, ease: 'none' }, 0)
    })
    return () => sections.forEach(section => {
      section.classList.remove('is-horizontal')
      section.querySelectorAll('.timeline__step').forEach(step => step.classList.remove('is-active'))
    })
  })
}
```

- [ ] **Step 2: Gepinde stand in `src/components/HScroll.wald`**

Voeg in de `<style>`, onderaan binnen het `.hscroll {…}`-blok (vóór de sluitende `}`), toe:

```css
  /* Gepinde stand op desktop (motion.js zet .is-pinned). */
  &.is-pinned {
    min-height: 100vh;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-content: center;
    overflow: hidden;
  }
  /* Automatische marges in een grid laten de container krimpen; daarom expliciet 100%. */
  &.is-pinned .hscroll__head {
    width: 100%;
  }
  &.is-pinned .hscroll__counter,
  &.is-pinned .hscroll__progress {
    display: block;
  }
  &.is-pinned .hscroll__track {
    justify-self: start;
    width: max-content;
    overflow: visible;
    scroll-snap-type: none;
    will-change: transform;
  }
```

- [ ] **Step 3: Horizontale stand in `src/components/Timeline.wald`**

Voeg in de `<style>`, onderaan binnen het `.timeline {…}`-blok, toe:

```css
  /* Horizontale tijdlijn op desktop (motion.js zet .is-horizontal en .is-active per stap). */
  &.is-horizontal {
    min-height: 100vh;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-content: center;
    overflow: hidden;
  }
  &.is-horizontal > .container {
    width: 100%;
  }
  &.is-horizontal .timeline__body {
    justify-self: start;
    width: max-content;
    max-width: none;
    margin-top: var(--space-12);
    will-change: transform;
  }
  &.is-horizontal .timeline__track {
    display: flex;
    gap: 0;
    padding: 0;
  }
  &.is-horizontal .timeline__step {
    width: min(78vw, 44rem);
    padding-right: var(--space-24);
  }
  &.is-horizontal .timeline__num {
    height: 7rem;
    font-size: 7rem;
    color: transparent;
    -webkit-text-stroke: 1.5px #4a5266;
    transition: color 0.4s, -webkit-text-stroke-color 0.4s;
  }
  &.is-horizontal .timeline__line {
    top: 8rem;
    bottom: auto;
    left: 0;
    right: 0;
    width: auto;
    height: 2px;
    background: var(--border);
  }
  &.is-horizontal .timeline__line i {
    display: block;
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, var(--accent), var(--accent-2));
    transform-origin: left;
    transform: scaleX(0);
  }
  &.is-horizontal .timeline__dot {
    top: calc(8rem - 9px);
    left: 0;
    border: 2px solid #4a5266;
    background: var(--bg);
    transition: background 0.4s, border-color 0.4s;
  }
  &.is-horizontal .timeline__step-title {
    margin-top: var(--space-12);
    color: var(--text-muted);
    transition: color 0.4s;
  }
  &.is-horizontal .timeline__step.is-active .timeline__num {
    color: var(--accent);
    -webkit-text-stroke-color: transparent;
  }
  &.is-horizontal .timeline__step.is-active .timeline__dot {
    border-color: var(--accent);
    background: var(--accent);
  }
  &.is-horizontal .timeline__step.is-active .timeline__step-title {
    color: var(--text);
  }
```

(De tekst onder een stap blijft `--text-muted`, ook als de stap nog niet actief is: dat houdt het contrast op AA.)

- [ ] **Step 4: `public/motion/index.js` aanvullen**

Import: `import { hscroll, timeline } from './scroll.js'`. Vóór `// Effecten worden in de volgende taken hier aangeroepen.`:

```js
    hscroll(gsap)
    timeline(gsap)
```

- [ ] **Step 5: Controleren en committen**

`npm run check && npm run build:preview`; JavaScript-fouten-check op `/` en `/werk/peukenzee/`. Screenshot `/` op 1280: de strook "Ander werk" staat als één rij met teller `01 / 12` en voortgangsbalk (gepinde stand). Screenshot op 390 (iframe-wrapper): nog steeds de swipe-lijst.

```bash
git add public/motion/scroll.js public/motion/index.js src/components/HScroll.wald src/components/Timeline.wald
git commit -m "feat: pinned horizontal strips and horizontal case-study timeline"
```

---

### Task 7: Pagina-overgang

**Files:**
- Create: `public/motion/transition.js`
- Modify: `public/motion/index.js`

- [ ] **Step 1: `public/motion/transition.js`**

```js
// Pagina-overgang (spec: Motion #7): bij een interne link schuift een donker vlak met het saffraan logo
// omhoog; op de nieuwe pagina schuift het weer weg (het inline script in <head> zet `is-arriving`).
export function transitions(gsap) {
  const root = document.documentElement
  const wipe = document.querySelector('.wipe')
  if (!wipe) return
  const logo = wipe.querySelector('.wipe__logo')

  if (root.classList.contains('is-arriving')) {
    gsap.set(wipe, { scaleY: 1, transformOrigin: 'top' })
    gsap.set(logo, { autoAlpha: 1 })
    root.classList.remove('is-arriving')
    gsap.timeline()
      .to(logo, { autoAlpha: 0, duration: 0.2, delay: 0.1 })
      .to(wipe, { scaleY: 0, duration: 0.55, ease: 'power4.out' })
  }

  document.addEventListener('click', event => {
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null
    if (!link || event.defaultPrevented || event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    if ((link.target && link.target !== '_self') || link.hasAttribute('download')) return
    const url = new URL(link.href, location.href)
    if (url.origin !== location.origin) return
    if (url.pathname === location.pathname && url.hash) return // anker op dezelfde pagina (o.a. de skip-link)
    if (/\.[a-z0-9]{2,5}$/i.test(url.pathname)) return // bestanden zoals de cv-pdf
    event.preventDefault()
    gsap.timeline({
      onComplete: () => {
        try { sessionStorage.setItem('wipe', '1') } catch { /* privémodus: dan zonder wipe-uit */ }
        location.href = url.href
      }
    })
      .set(wipe, { transformOrigin: 'bottom' })
      .to(wipe, { scaleY: 1, duration: 0.5, ease: 'power4.in' })
      .to(logo, { autoAlpha: 1, duration: 0.15 })
  })

  // Terug-knop (bfcache): de pagina komt terug zoals hij vertrok, dus de wipe opruimen.
  addEventListener('pageshow', event => {
    if (event.persisted) gsap.set([wipe, logo], { clearProps: 'all' })
  })
}
```

- [ ] **Step 2: `public/motion/index.js` aanvullen**

Import: `import { transitions } from './transition.js'`. Vervang de regel `// Effecten worden in de volgende taken hier aangeroepen.` door:

```js
    transitions(gsap)
```

- [ ] **Step 3: Controleren en committen**

`npm run build:preview`; JavaScript-fouten-check op meerdere pagina's.

```bash
git add public/motion/transition.js public/motion/index.js
git commit -m "feat: dark wipe page transition with saffron logo"
```

---

### Task 8: Eindcontrole en spec bijwerken

**Files:**
- Modify: `docs/superpowers/specs/2026-10-12-portfolio-redesign-design.md`

- [ ] **Step 1: Alles draaien**

```bash
npx vitest run && npm run check && npm run build:preview
```

Expected: alles groen.

- [ ] **Step 2: Controles**

- JavaScript-fouten-check op `/`, `/werk/`, `/werk/peukenzee/`, `/over/`, `/contact/`, `/en/`: geen fouten.
- Screenshot van `/` met `--force-prefers-reduced-motion`: alle inhoud zichtbaar, geen lichtbundel, geen wipe.
- Zonder JavaScript (`--blink-settings=scriptEnabled=false`): screenshot van `/` — de hero is zichtbaar (geen `motion`-class, want het inline script draait niet).

- [ ] **Step 3: Spec bijwerken**

In de spec, sectie "Motion": vervang de zin "Alle GSAP-code staat in `public/motion.js`." door "Alle GSAP-code staat in kleine ES-modules in `public/motion/` (gestart vanuit `index.js`); pure rekenhulpjes in `utils.js` zijn getest." Vervang in de alinea "**Reduced motion:**" de zin "Elementen worden nooit met CSS verborgen in afwachting van JavaScript." door: "Alleen de home-intro wordt kort verborgen tot het motion-script start (class `motion` op `<html>`, gezet door een inline script); start het script niet binnen 3 seconden, dan wordt de class weggehaald. Zonder JavaScript of bij reduced motion wordt niets verborgen."

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-10-12-portfolio-redesign-design.md
git commit -m "docs: record motion module layout and intro fail-safe in spec"
```

- [ ] **Step 5: Overdracht aan Stefan**

Laat Stefan in zijn eigen browser (http://localhost:4321/) controleren: intro op de home, lichtbundel, kopjes per letter, tilt op de bento (zodra een project `featured` is), marquee bij snel en omhoog scrollen, de gepinde strook "Ander werk", de tijdlijn op een case study met Probleem/Aanpak/Resultaat-tekst, de pagina-overgang, en dat het soepel blijft (FPS).


---

## Uitvoeringsnotities (2026-10-26)

Uitgevoerd met subagents; Task 1–7 samen gereviewd. Afwijkingen ten opzichte van de code hierboven:

- **Task 1:** testinvoer `activeSteps(0.9, 3)` → `0.93` (met de formule gaat de laatste stap aan bij 0,925).
- **Task 2/3:** `window.__motionReady` wordt pas in `finally` gezet en alle effecten staan in een `try/catch`; bij een fout worden intro- en wipe-eigenschappen teruggezet en de classes verwijderd.
- **Task 4:** `chars()` slaat titels in links over (projectkaarten op /werk zijn ook `h2.display`) en splitst op `words,chars`.
- **Review:** lichtbundel na de steen in de DOM (stond eronder); `overflow: clip` en `100svh` voor gepinde secties; lichtere grijstint (`#6b7386`) voor inactieve tijdlijnstappen; dubbelklik-bescherming en tijdstempel-vlag voor de wipe (alleen geldig binnen 5 s, eigen vangnet van 1,5 s); marquee start 100 loops vooruit.
- **Niet automatisch te controleren:** headless Chrome speelt GSAP niet betrouwbaar af. Bewegingscheck door Stefan in de browser; de tijdlijn is pas te zien zodra een case study Probleem/Aanpak/Resultaat-tekst heeft.
