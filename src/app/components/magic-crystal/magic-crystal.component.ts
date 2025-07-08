import { Component, type OnInit, type OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-magic-crystal",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./magic-crystal.component.html",
  styleUrls: ["./magic-crystal.component.css"],
})
export class MagicCrystalComponent implements OnInit, OnDestroy {
  // Propiedades de animación
  crystalY = 0
  crystalRotation = 0
  crystalOpacity = 0.6
  crystalScale = 1

  facetOpacity1 = 0.3
  facetOpacity2 = 0.3
  facetOpacity3 = 0.3

  glowScale = 0.8
  glowOpacity = 0.4

  baseScaleX = 1
  baseOpacity = 0.4

  pulse1Scale = 1
  pulse1Opacity = 0.6
  pulse2Scale = 1
  pulse2Opacity = 0.6
  pulse3Scale = 1
  pulse3Opacity = 0.6

  auraScale = 1
  auraOpacity = 0.3

  textOpacity = 0.6
  textY = 0

  particles: Array<{ id: number; x: number; y: number; opacity: number; scale: number }> = []
  lightRays: Array<{ scaleY: number; opacity: number }> = []

  private animationFrameId?: number
  private startTime = Date.now()

  ngOnInit() {
    // Inicializar partículas
    this.particles = Array.from({ length: 16 }, (_, i) => ({
      id: i,
      x: 0,
      y: 0,
      opacity: 1,
      scale: 0,
    }))

    // Inicializar rayos de luz
    this.lightRays = Array.from({ length: 6 }, () => ({
      scaleY: 0,
      opacity: 0,
    }))

    this.animate()
  }

  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }
  }

  private animate() {
    const elapsed = (Date.now() - this.startTime) / 1000

    // Animación del cristal principal
    this.crystalY = Math.sin(elapsed * 0.5) * 10
    this.crystalRotation = Math.sin(elapsed * 0.3) * 2
    this.crystalOpacity = 0.6 + Math.sin(elapsed) * 0.4
    this.crystalScale = 1 + Math.sin(elapsed) * 0.05

    // Animación de facetas
    this.facetOpacity1 = 0.3 + Math.sin(elapsed * 2) * 0.5
    this.facetOpacity2 = 0.3 + Math.sin(elapsed * 2 + 0.4) * 0.5
    this.facetOpacity3 = 0.3 + Math.sin(elapsed * 2 + 0.8) * 0.5

    // Animación del brillo interno
    this.glowScale = 0.8 + Math.sin(elapsed * 1.5) * 0.4
    this.glowOpacity = 0.4 + Math.sin(elapsed * 1.5) * 0.4

    // Animación de la base
    this.baseScaleX = 1 + Math.sin(elapsed) * 0.2
    this.baseOpacity = 0.4 + Math.sin(elapsed) * 0.3

    // Animación de pulsos
    const pulseTime1 = (elapsed % 3) / 3
    this.pulse1Scale = 1 + pulseTime1 * 2
    this.pulse1Opacity = 0.6 * (1 - pulseTime1)

    const pulseTime2 = ((elapsed + 1) % 3) / 3
    this.pulse2Scale = 1 + pulseTime2 * 2
    this.pulse2Opacity = 0.6 * (1 - pulseTime2)

    const pulseTime3 = ((elapsed + 2) % 3) / 3
    this.pulse3Scale = 1 + pulseTime3 * 2
    this.pulse3Opacity = 0.6 * (1 - pulseTime3)

    // Animación del aura
    this.auraScale = 1 + Math.sin(elapsed * 0.75) * 0.3
    this.auraOpacity = 0.3 + Math.sin(elapsed * 0.75) * 0.3

    // Animación del texto
    this.textOpacity = 0.6 + Math.sin(elapsed) * 0.4
    this.textY = Math.sin(elapsed * 1.5) * 5

    // Animación de partículas
    this.particles.forEach((particle, i) => {
      const particleTime = (elapsed + i * 0.1) % 2
      const angle = (i * 22.5 * Math.PI) / 180
      particle.x = Math.cos(angle) * 60 * particleTime
      particle.y = Math.sin(angle) * 60 * particleTime
      particle.opacity = 1 - particleTime
      particle.scale = particleTime
    })

    // Animación de rayos de luz
    this.lightRays.forEach((ray, i) => {
      const rayTime = (elapsed + i * 0.3) % 2
      ray.scaleY = rayTime
      ray.opacity = 0.8 * (1 - rayTime)
    })

    this.animationFrameId = requestAnimationFrame(() => this.animate())
  }

  trackParticle(index: number, particle: any): number {
    return particle.id
  }
}
