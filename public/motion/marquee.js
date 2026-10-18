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
