import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Character } from '../models/character.model';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

/**
 * ========================================
 * SERVICIO DE PERSONAJES - TERRA API
 * ========================================
 * 
 * Este servicio maneja todas las operaciones relacionadas con personajes del juego.
 * Incluye paginación completa, estadísticas y métodos helper para facilitar el uso.
 * 
 * ENDPOINTS DISPONIBLES EN EL BACKEND:
 * - GET /api/game/characters/by-email?email=xxx (máximo 5 personajes)
 * - GET /api/game/characters/by-email/paginated?email=xxx&page=0&size=5 (paginación completa)
 * - GET /api/game/characters/by-email/stats?email=xxx (solo estadísticas)
 * - GET /api/game/characters/by-email/complete?email=xxx (personajes + stats)
 * 
 * TODOS LOS ENDPOINTS REQUIEREN AUTENTICACIÓN JWT
 */

// ========================================
// INTERFACES PARA TIPADO DE RESPUESTAS
// ========================================

/**
 * Respuesta paginada del backend
 * Contiene la lista de elementos y metadatos de paginación
 */
export interface PaginatedResponse<T> {
  content: T[];           // Lista de elementos de la página actual
  totalElements: number;  // Total de elementos en toda la base de datos
  totalPages: number;     // Total de páginas disponibles
  currentPage: number;    // Página actual (0-based)
  size: number;          // Tamaño de la página
  hasNext: boolean;      // Si existe página siguiente
  hasPrevious: boolean;  // Si existe página anterior
}

/**
 * Estadísticas de personajes del usuario
 * Calculadas automáticamente por el backend
 */
export interface CharacterStats {
  totalCharacters: number;  // Total de personajes del usuario
  totalPages: number;       // Páginas totales (con 5 por página)
  maxLevel: number;         // Nivel más alto entre todos los personajes
  averageLevel: number;     // Nivel promedio de todos los personajes
}

/**
 * Respuesta combinada: personajes + estadísticas
 * Útil para mostrar información completa en una sola llamada
 */
export interface CompleteCharacterResponse {
  characters: Character[];  // Lista de personajes (máximo 5)
  stats: CharacterStats;    // Estadísticas calculadas
}

@Injectable({
  providedIn: 'root'
})
export class CharacterService {

  constructor(private http: HttpClient) { }

  // ========================================
  // MÉTODOS PRINCIPALES - ENDPOINTS BÁSICOS
  // ========================================

  /**
   * Obtener personajes por email (máximo 5)
   * 
   * USO: Para mostrar una vista rápida de los personajes principales
   * ORDEN: Por nivel descendente (más alto primero)
   * 
   * @param email - Email del usuario autenticado
   * @returns Observable con array de personajes (máximo 5)
   */
  getCharactersByEmail(email: string): Observable<Character[]> {
    return this.http.get<Character[]>(`${environment.apiUrl}api/game/characters/by-email?email=${email}`);
  }

  /**
   * Obtener personajes con paginación completa
   * 
   * USO: Para implementar paginación en el frontend
   * ORDEN: Por nivel descendente (más alto primero)
   * 
   * @param email - Email del usuario autenticado
   * @param page - Número de página (0-based, default: 0)
   * @param size - Elementos por página (default: 5)
   * @returns Observable con respuesta paginada completa
   */
  getCharactersByEmailPaginated(email: string, page: number = 0, size: number = 5): Observable<PaginatedResponse<Character>> {
    return this.http.get<PaginatedResponse<Character>>(
      `${environment.apiUrl}api/game/characters/by-email/paginated?email=${email}&page=${page}&size=${size}`
    );
  }

  /**
   * Obtener solo estadísticas de personajes
   * 
   * USO: Para mostrar resumen o dashboard del usuario
   * 
   * @param email - Email del usuario autenticado
   * @returns Observable con estadísticas calculadas
   */
  getCharacterStatsByEmail(email: string): Observable<CharacterStats> {
    return this.http.get<CharacterStats>(`${environment.apiUrl}api/game/characters/by-email/stats?email=${email}`);
  }

  /**
   * Obtener personajes + estadísticas en una sola llamada
   * 
   * USO: Para cargar información completa de una vez
   * 
   * @param email - Email del usuario autenticado
   * @returns Observable con personajes y estadísticas
   */
  getCharactersComplete(email: string): Observable<CompleteCharacterResponse> {
    return this.http.get<CompleteCharacterResponse>(`${environment.apiUrl}api/game/characters/by-email/complete?email=${email}`);
  }

  /**
   * Obtener items de un personaje específico
   * 
   * @param playerId - ID del personaje
   * @returns Observable con array de items del personaje
   */
  getItemsByCharacterId(playerId: number): Observable<any[]> {
    const body = { playerId };
    return this.http.post<any[]>(`${environment.apiUrl}api/game/storage/inventory`, body);
  }

  test(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}api/game/storage/inventory`);
  }

  // ========================================
  // MÉTODOS HELPER - NAVEGACIÓN DE PÁGINAS
  // ========================================

  /**
   * Obtener la siguiente página de personajes
   * 
   * @param email - Email del usuario
   * @param currentPage - Página actual
   * @param size - Tamaño de página (default: 5)
   * @returns Observable con la siguiente página
   */
  getNextPage(email: string, currentPage: number, size: number = 5): Observable<PaginatedResponse<Character>> {
    return this.getCharactersByEmailPaginated(email, currentPage + 1, size);
  }

  /**
   * Obtener la página anterior de personajes
   * 
   * @param email - Email del usuario
   * @param currentPage - Página actual
   * @param size - Tamaño de página (default: 5)
   * @returns Observable con la página anterior
   */
  getPreviousPage(email: string, currentPage: number, size: number = 5): Observable<PaginatedResponse<Character>> {
    return this.getCharactersByEmailPaginated(email, currentPage - 1, size);
  }

  /**
   * Obtener una página específica de personajes
   * 
   * @param email - Email del usuario
   * @param page - Número de página específica
   * @param size - Tamaño de página (default: 5)
   * @returns Observable con la página solicitada
   */
  getPage(email: string, page: number, size: number = 5): Observable<PaginatedResponse<Character>> {
    return this.getCharactersByEmailPaginated(email, page, size);
  }

  // ========================================
  // MÉTODOS AVANZADOS - FUNCIONALIDADES ESPECIALES
  // ========================================

  /**
   * Obtener TODOS los personajes con paginación automática
   * 
   * USO: Para cargar todos los personajes de una vez (útil para búsquedas)
   * NOTA: Hace múltiples llamadas automáticamente hasta cargar todas las páginas
   * 
   * @param email - Email del usuario
   * @param size - Tamaño de página (default: 5)
   * @returns Observable con array de todos los personajes
   */
  getAllCharactersByEmail(email: string, size: number = 5): Observable<Character[]> {
    return new Observable(observer => {
      const allCharacters: Character[] = [];
      let currentPage = 0;
      let hasMorePages = true;

      const loadPage = () => {
        this.getCharactersByEmailPaginated(email, currentPage, size).subscribe({
          next: (response) => {
            allCharacters.push(...response.content);
            
            if (response.hasNext) {
              currentPage++;
              loadPage(); // Cargar siguiente página recursivamente
            } else {
              observer.next(allCharacters);
              observer.complete();
            }
          },
          error: (error) => {
            observer.error(error);
          }
        });
      };

      loadPage();
    });
  }

  /**
   * Obtener información completa del usuario
   * 
   * USO: Para cargar todo lo necesario en una sola operación
   * RETORNA: Personajes + Estadísticas + Información de paginación
   * 
   * @param email - Email del usuario
   * @returns Observable con información completa
   */
  getUserCompleteInfo(email: string): Observable<{
    characters: Character[];
    stats: CharacterStats;
    pagination: PaginatedResponse<Character>;
  }> {
    return new Observable(observer => {
      this.getCharactersComplete(email).subscribe({
        next: (completeResponse) => {
          // También obtener la primera página con información de paginación
          this.getCharactersByEmailPaginated(email, 0, 5).subscribe({
            next: (paginationResponse) => {
              observer.next({
                characters: completeResponse.characters,
                stats: completeResponse.stats,
                pagination: paginationResponse
              });
              observer.complete();
            },
            error: (error) => observer.error(error)
          });
        },
        error: (error) => observer.error(error)
      });
    });
  }
}
