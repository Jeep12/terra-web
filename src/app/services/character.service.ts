import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  constructor() {
    // Inicializar el servicio de personajes
  }

  getCharacterDetails(characterId: number) {
    // Lógica para obtener los detalles de un personaje
  }

  createCharacter(characterData: any) {
    // Lógica para crear un nuevo personaje
  }

  updateCharacter(characterId: number, updatedData: any) {
    // Lógica para actualizar un personaje
  }

  deleteCharacter(characterId: number) {
    // Lógica para eliminar un personaje
  }
}

