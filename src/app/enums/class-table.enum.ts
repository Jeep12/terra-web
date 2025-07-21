// src/app/enums/class-table.enum.ts

export interface GameClass {
  id: number;
  name: string;
}

export const CLASS_TABLE: GameClass[] = [
  { id: 1, name: 'Human Warrior' },
  { id: 2, name: 'Gladiator' },
  { id: 3, name: 'Warlord' },
  { id: 4, name: 'Human Knight' },
  { id: 5, name: 'Paladin' },
  { id: 6, name: 'Dark Avenger' },
  { id: 7, name: 'Human Rogue' },
  { id: 8, name: 'Treasure Hunter' },
  { id: 9, name: 'Hawkeye' },
  { id: 10, name: 'Human Mystic' },

  { id: 11, name: 'Human Wizard' },
  { id: 12, name: 'Sorcerer' },
  { id: 13, name: 'Necromancer' },
  { id: 14, name: 'Warlock' },
  { id: 15, name: 'Cleric' },
  { id: 16, name: 'Bishop' },
  { id: 17, name: 'Prophet' },
  { id: 19, name: 'Elven Knight' },
  { id: 20, name: 'Temple Knight' },
  { id: 22, name: 'Elven Scout' },
  { id: 24, name: 'Silver Ranger' },
  { id: 26, name: 'Elven Wizard' },
  { id: 27, name: 'Spellsinger' },
  { id: 28, name: 'Elemental Summoner' },
  { id: 29, name: 'Elven Oracle' },
  { id: 30, name: 'Elven Elder' },
  { id: 32, name: 'Palus Knight' },
  { id: 33, name: 'Shillien Knight' },
  { id: 34, name: 'Bladedancer' },
  { id: 35, name: 'Assassin' },
  { id: 36, name: 'Abyss Walker' },
  { id: 37, name: 'Phantom Ranger' },
  { id: 39, name: 'Dark Wizard' },
  { id: 40, name: 'Spellhowler' },
  { id: 41, name: 'Phantom Summoner' },
  { id: 42, name: 'Shillien Oracle' },
  { id: 43, name: 'Shillien Elder' },
  { id: 45, name: 'Orc Raider' },
  { id: 46, name: 'Destroyer' },
  { id: 47, name: 'Monk' },
  { id: 48, name: 'Tyrant' },
  { id: 50, name: 'Orc Shaman' },
  { id: 51, name: 'Overlord' },
  { id: 52, name: 'Warcryer' },
  { id: 54, name: 'Scavenger' },
  { id: 55, name: 'Bounty Hunter' },
  { id: 56, name: 'Artisan' },
  { id: 57, name: 'Warsmith' },
  { id: 125, name: 'Trooper' },
  { id: 126, name: 'Warder' },
  { id: 127, name: 'Berserker' },
  { id: 131, name: 'Doombringer' },
  { id: 134, name: 'Trickster' },
  { id: 135, name: 'Inspector' },
  { id: 90, name: 'Phoenix Knight' },
  { id: 91, name: 'Hell Knight' },
  { id: 92, name: 'Sagittarius' },
  { id: 93, name: 'Adventurer' },
  { id: 94, name: 'Archmage' },
  { id: 95, name: 'Soultaker' },
  { id: 96, name: 'Arcana Lord' },
  { id: 97, name: 'Cardinal' },
  { id: 98, name: 'Hierophant' },
  { id: 100, name: 'Sword Muse' },
  { id: 101, name: 'Wind Rider' },
  { id: 102, name: 'Moonlight Sentinel' },
  { id: 103, name: 'Mystic Muse' },
  { id: 104, name: 'Elemental Master' },
  { id: 106, name: 'Shillien Templar' },
  { id: 107, name: 'Spectral Dancer' },
  { id: 108, name: 'Ghost Hunter' },
  { id: 109, name: 'Ghost Sentinel' },
  { id: 110, name: 'Storm Screamer' },
  { id: 111, name: 'Spectral Master' },
  { id: 112, name: 'Shillien Saint' },
  { id: 113, name: 'Titan' },
  { id: 114, name: 'Grand Khavatari' },
  { id: 115, name: 'Dominator' },
  { id: 116, name: 'Doom Cryer' },
  { id: 117, name: 'Fortune Seeker' },
  { id: 118, name: 'Maestro' },
  { id: 136, name: 'Judicator' },
  { id: 88, name: 'Duelist' },
  { id: 89, name: 'Dreadnought' },
  { id: 193, name: 'Soul Finder' },
  { id: 194, name: 'Soul Breaker' },
  { id: 195, name: 'Soul Hound' },
  { id: 130, name: 'Soul Ranger' },
  { id: 192, name: 'Soldier' },
  { id: 53, name: 'Soldier' }




];

export const CLASS_MAP: Record<number, GameClass> = CLASS_TABLE.reduce((acc, gameClass) => {
  acc[gameClass.id] = gameClass;
  return acc;
}, {} as Record<number, GameClass>);

export function searchClassById(id: number): GameClass | undefined {
  return CLASS_MAP[id];
}

// src/app/enums/class-table.enum.ts
export function getClassNameById(classId: number): string {
  const gameClass = searchClassById(classId);
  return gameClass ? gameClass.name : `No class ${classId}`;
}
