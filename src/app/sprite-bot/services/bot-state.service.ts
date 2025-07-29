// core/services/bot-state.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { 
  AnimationKey, 
  CharacterState, 
  BotPosition, 
  BotPhysics, 
  DragState,
  BOT_CONFIG 
} from '../config/bot-config';

@Injectable({
  providedIn: 'root'
})
export class BotStateService {
  // Subjects para estados reactivos
  private readonly _currentAnimation = new BehaviorSubject<AnimationKey>('idle');
  private readonly _characterState = new BehaviorSubject<CharacterState>('idle');
  private readonly _position = new BehaviorSubject<BotPosition>({ 
    x: BOT_CONFIG.initialX, 
    y: BOT_CONFIG.initialY 
  });
  private readonly _physics = new BehaviorSubject<BotPhysics>({
    velocity: 0,
    jumpVelocity: 0,
    fallSpeed: 0,
    isJumping: false,
    isFalling: false,
    groundY: 0
  });
  private readonly _dragState = new BehaviorSubject<DragState>({
    isDragging: false,
    isMouseDown: false,
    mouseDownTime: 0,
    startMouseX: 0,
    startMouseY: 0,
    startElementX: 0,
    startElementY: 0,
    dragOffsetX: 0,
    dragOffsetY: 0,
    dragDistance: 0,
    selecting: false,
    clickFired: false,
    selectionEffect: false
  });
  private readonly _facingLeft = new BehaviorSubject<boolean>(false);
  private readonly _currentFrame = new BehaviorSubject<number>(0);
  private readonly _dialog = new BehaviorSubject<string>('');

  // Observables públicos
  public readonly currentAnimation$ = this._currentAnimation.asObservable();
  public readonly characterState$ = this._characterState.asObservable();
  public readonly position$ = this._position.asObservable();
  public readonly physics$ = this._physics.asObservable();
  public readonly dragState$ = this._dragState.asObservable();
  public readonly facingLeft$ = this._facingLeft.asObservable();
  public readonly currentFrame$ = this._currentFrame.asObservable();
  public readonly dialog$ = this._dialog.asObservable();

  // Propiedades adicionales
  private _screenWidth = window.innerWidth;
  private _screenHeight = window.innerHeight;
  private _playOnce = false;
  private _blinkBackToIdle = false;

  // Getters para acceso síncrono
  get currentAnimation(): AnimationKey { return this._currentAnimation.value; }
  get characterState(): CharacterState { return this._characterState.value; }
  get position(): BotPosition { return this._position.value; }
  get physics(): BotPhysics { return this._physics.value; }
  get dragState(): DragState { return this._dragState.value; }
  get facingLeft(): boolean { return this._facingLeft.value; }
  get currentFrame(): number { return this._currentFrame.value; }
  get dialog(): string { return this._dialog.value; }
  get screenWidth(): number { return this._screenWidth; }
  get screenHeight(): number { return this._screenHeight; }
  get playOnce(): boolean { return this._playOnce; }
  get blinkBackToIdle(): boolean { return this._blinkBackToIdle; }

  // Setters para actualizar estados
  setAnimation(animation: AnimationKey, playOnce = false): void {
    this._currentAnimation.next(animation);
    this._playOnce = playOnce;
    this.setCurrentFrame(0);
    
    if (animation === 'idleBlinking' && playOnce) {
      this._blinkBackToIdle = true;
    } else {
      this._blinkBackToIdle = false;
    }
  }

  setCharacterState(state: CharacterState): void {
    this._characterState.next(state);
  }

  setPosition(x: number, y: number): void {
    this._position.next({ x, y });
  }

  updatePosition(updates: Partial<BotPosition>): void {
    const current = this._position.value;
    this._position.next({ ...current, ...updates });
  }

  setPhysics(physics: Partial<BotPhysics>): void {
    const current = this._physics.value;
    this._physics.next({ ...current, ...physics });
  }

  setDragState(dragState: Partial<DragState>): void {
    const current = this._dragState.value;
    this._dragState.next({ ...current, ...dragState });
  }

  setFacingLeft(facingLeft: boolean): void {
    this._facingLeft.next(facingLeft);
  }

  setCurrentFrame(frame: number): void {
    this._currentFrame.next(frame);
  }

  setDialog(text: string): void {
    this._dialog.next(text);
  }

  updateScreenSize(): void {
    this._screenWidth = window.innerWidth;
    this._screenHeight = window.innerHeight;
  }

  // Métodos de utilidad
  resetDragState(): void {
    this.setDragState({
      isDragging: false,
      isMouseDown: false,
      selecting: false,
      clickFired: false,
      selectionEffect: false,
      dragDistance: 0
    });
  }

  isWithinBounds(x: number, y: number): { x: number; y: number } {
    return {
      x: Math.max(0, Math.min(this._screenWidth - BOT_CONFIG.spriteWidth, x)),
      y: Math.max(0, y)
    };
  }

  getDistanceToTarget(targetX: number, targetY: number): number {
    const pos = this.position;
    const deltaX = targetX - pos.x;
    const deltaY = targetY - pos.y;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }

  shouldFaceLeft(targetX: number): boolean {
    return targetX < this.position.x;
  }

  // Validaciones de estado
  canMove(): boolean {
    const dragState = this.dragState;
    const physics = this.physics;
    return !dragState.isDragging && !physics.isJumping && !physics.isFalling && 
           this.characterState !== 'dying';
  }

  canJump(): boolean {
    const physics = this.physics;
    return !physics.isJumping && !physics.isFalling && this.characterState !== 'dying';
  }

  canInteract(): boolean {
    return this.characterState !== 'dying' && !this.dragState.isDragging;
  }

  // Limpieza
  reset(): void {
    this.setAnimation('idle');
    this.setCharacterState('idle');
    this.setPosition(BOT_CONFIG.initialX, BOT_CONFIG.initialY);
    this.setPhysics({
      velocity: 0,
      jumpVelocity: 0,
      fallSpeed: 0,
      isJumping: false,
      isFalling: false,
      groundY: 0
    });
    this.resetDragState();
    this.setFacingLeft(false);
    this.setDialog('');
  }
}