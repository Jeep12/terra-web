// Modelo base para sprites/personajes 2D
export type PersonajeAnim = 'IDLE' | 'WALK' | 'JUMP' | 'ATTACK' | 'DIE';

/**
 * Clase base Personaje: representa un sprite animado con lógica de movimiento y animación.
 * Todas las propiedades están documentadas con tipo, unidad y propósito.
 */
export class Personaje {
  /**
   * Animación actual del personaje.
   * Tipo: PersonajeAnim ('IDLE', 'WALK', 'JUMP', 'ATTACK', 'DIE')
   * Efecto: determina qué ciclo de frames y comportamiento se renderiza.
   */
  anim: PersonajeAnim = 'IDLE';

  /**
   * Frame actual de la animación.
   * Tipo: number (0-9)
   * Unidad: índice de frame
   * Efecto: determina qué imagen del ciclo de animación se muestra.
   */
  frame: number = 0;

  /**
   * Posición horizontal del personaje en el contenedor.
   * Tipo: number
   * Unidad: porcentaje (0-100)
   * Efecto: determina la posición X del sprite en la pantalla.
   */
  x: number = 50;

  /**
   * Dirección actual del personaje.
   * Tipo: 'left' | 'right'
   * Efecto: determina si el sprite se voltea horizontalmente.
   */
  direction: 'left' | 'right' = 'right';

  /**
   * Duración del movimiento walk (ms).
   * Tipo: number
   * Unidad: milisegundos
   * Efecto: controla la velocidad de desplazamiento del personaje.
   * Recomendado: igual a walkFrames * frameIntervalMs para sincronizar animación y movimiento.
   * Mayor valor = más lerdo.
   */
  walkDuration: number = 15000;

  /**
   * Cambia la animación y resetea el frame.
   * @param anim Nueva animación
   */
  setAnim(anim: PersonajeAnim) {
    this.anim = anim;
    this.frame = 0;
  }
}

/**
 * Subclase Knight: personaje caballero, puede tener lógica especial
 */
export class Knight extends Personaje {
  // Aquí puedes sobreescribir métodos si el caballero tiene lógica especial
} 