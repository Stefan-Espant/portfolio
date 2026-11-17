// Home: het cursieve deel van de kop ("van framework tot frontend.") schuift tijdens het scrollen langzaam
// verder naar rechts, gekoppeld aan de scrollpositie (scrub; terugscrollen schuift het terug). Bovenop de
// CSS-intro (die animeert `left`; dit gebruikt transform). Desktop 6rem, mobiel 2rem: binnen de kantlijn.
export function drift(gsap) {
  const hero = document.querySelector('.home__hero')
  const em = hero?.querySelector('.home__title em')
  if (!hero || !em) return
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
  gsap.to(em, {
    x: () => (window.innerWidth >= 768 ? 6 : 2) * rem,
    ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1.2, invalidateOnRefresh: true }
  })
}
