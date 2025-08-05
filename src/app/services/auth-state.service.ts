import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { AccountMaster } from '../models/master.account.model';

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private authStateSubject = new BehaviorSubject<boolean>(false);
  private userDataSubject = new BehaviorSubject<AccountMaster | null>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  private initialized = false;
  private isInitializing = false; // Flag para evitar múltiples inicializaciones

  constructor(private authService: AuthService) {
    // NO inicializar automáticamente para evitar loops
  }

  // Método para inicializar solo cuando sea necesario
  initializeAuthState(): Observable<boolean> {
    if (this.initialized) {
      return this.authStateSubject.asObservable();
    }

    if (this.isInitializing) {
      return this.authStateSubject.asObservable();
    }

    this.isInitializing = true;
    this.initialized = true;
    console.log('🔍 [AUTH STATE] Inicializando estado de autenticación');
    
    // Verificar estado inicial de autenticación
    this.authService.isLoggedIn().subscribe({
      next: (isLoggedIn) => {
        console.log('🔍 [AUTH STATE] Estado de autenticación:', isLoggedIn);
        this.authStateSubject.next(isLoggedIn);
        this.isInitializing = false;
        if (isLoggedIn) {
          this.loadUserData();
        }
      },
      error: (error) => {
        console.log('🔍 [AUTH STATE] Error al verificar autenticación:', error);
        this.authStateSubject.next(false);
        this.userDataSubject.next(null);
        this.isInitializing = false;
      }
    });

    return this.authStateSubject.asObservable();
  }

  get isAuthenticated$(): Observable<boolean> {
    // Solo inicializar si se solicita explícitamente
    return this.authStateSubject.asObservable();
  }

  get isAuthenticated(): boolean {
    return this.authStateSubject.value;
  }

  get userData$(): Observable<AccountMaster | null> {
    return this.userDataSubject.asObservable();
  }

  get userData(): AccountMaster | null {
    return this.userDataSubject.value;
  }

  get isLoading$(): Observable<boolean> {
    return this.isLoadingSubject.asObservable();
  }

  private loadUserData() {
    // Evitar múltiples llamadas simultáneas
    if (this.isLoadingSubject.value) {
      return;
    }

    console.log('🔍 [AUTH STATE] Cargando datos de usuario');
    this.isLoadingSubject.next(true);
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        console.log('🔍 [AUTH STATE] Datos de usuario cargados:', user);
        this.userDataSubject.next(user);
        this.isLoadingSubject.next(false);
      },
      error: (error) => {
        console.error('🔍 [AUTH STATE] Error cargando datos de usuario:', error);
        this.userDataSubject.next(null);
        this.isLoadingSubject.next(false);
        
        // Si hay error de autenticación, actualizar estado
        if (error.status === 401 || error.status === 403) {
          this.authStateSubject.next(false);
        }
      }
    });
  }

  updateAuthState(isAuthenticated: boolean) {
    console.log('🔍 [AUTH STATE] Actualizando estado:', isAuthenticated);
    this.authStateSubject.next(isAuthenticated);
    if (!isAuthenticated) {
      this.userDataSubject.next(null);
    }
  }

  clearUserData() {
    console.log('🔍 [AUTH STATE] Limpiando datos de usuario');
    this.userDataSubject.next(null);
  }

  refreshUserData() {
    if (this.isAuthenticated && !this.isLoadingSubject.value) {
      console.log('🔍 [AUTH STATE] Refrescando datos de usuario');
      this.loadUserData();
    }
  }

  // Método para resetear el estado (útil para logout)
  reset() {
    console.log('🔍 [AUTH STATE] Reseteando estado');
    this.initialized = false;
    this.isInitializing = false;
    this.authStateSubject.next(false);
    this.userDataSubject.next(null);
    this.isLoadingSubject.next(false);
  }
} 