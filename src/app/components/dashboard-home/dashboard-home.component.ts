// src/app/dashboard-home/dashboard-home.component.ts
import { Component, NgModule, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Character } from '../../models/character.model';
import { CharacterService, PaginatedResponse, CharacterStats } from '../../services/character.service';
import { AuthService } from '../../services/auth.service';
import { AccountMaster } from '../../models/master.account.model';
import { FormsModule, NgModel } from '@angular/forms';
import { LEVEL_EXPERIENCE_TABLE } from '../../enums/experience-table.enum';
import { CLASS_TABLE, getClassNameById } from '../../enums/class-table.enum';
import { AccountGameResponse } from '../../models/game.account.model';
import { Clan } from '../../models/clan.model';
import { ClanService } from '../../services/clan.service';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit, OnDestroy {
  characters: Character[] = [];
  filteredCharacters: Character[] = [];

  loading = true;
  pageLoading = false; // Nuevo estado para carga de páginas
  error: string | null = null;
  // Filtros
  searchTerm = '';
  selectedRace: number | null = null;
  selectedAccount: string | null = null;
  selectedClass: number | null = null;
  onlineStatus: number | null = null;
  minLevel: number | null = null;
  maxLevel: number | null = null;
  totalOnlineTime: number = 0;
  seeMoreMap: { [charId: number]: boolean } = {};

  // Paginación del backend
  currentPage = 0; // Cambiado a 0-based para el backend
  itemsPerPage = 4; // 4 personajes por página
  totalPages = 1;
  totalElements = 0;
  hasNext = false;
  hasPrevious = false;

  // Estadísticas del backend
  characterStats: CharacterStats | null = null;

  // Modal properties
  showModal = false;
  modalType: 'inventory' | 'warehouse' = 'inventory';
  selectedCharacter: Character | null = null;
  warehouseTab: 'personal' | 'clan' = 'personal';
  showInventoryModal: boolean = false;

  // Tooltip properties
  selectedItem: any = null;
  modalReady = false;
  detailSelected: any = null;
  activeTab: 'inventory' | 'warehouse' = 'inventory';
  hoveredItem: any = null;

  // Carrusel universal de stats
  carouselIndex = 0;
  visibleStatsCount = 4;

  get statsArray() {
    return [
      {
        icon: 'fas fa-users',
        value: this.getTotalCharacters(),
        label: 'Total Characters'
      },
      {
        icon: 'fas fa-chart-line',
        value: this.getAverageLevel(),
        label: 'Average Level'
      },
      {
        icon: 'fas fa-skull',
        value: this.getTotalPvpKills(),
        label: 'Total PvP Kills'
      },
      {
        icon: 'fas fa-clock',
        value: this.formatSecondsToHM(this.totalOnlineTime),
        label: 'Total Online Time'
      },
      {
        icon: 'fas fa-star',
        value: this.getMaxLevel(),
        label: 'Max Level'
      }
      // Agregá más stats acá si querés
    ];
  }

  get visibleStats() {
    return this.statsArray.slice(this.carouselIndex, this.carouselIndex + this.visibleStatsCount);
  }

  nextStats() {
    if (this.carouselIndex + this.visibleStatsCount < this.statsArray.length) {
      this.carouselIndex++;
    }
  }
  prevStats() {
    if (this.carouselIndex > 0) {
      this.carouselIndex--;
    }
  }

  selectDetailItem(item: any): void {
    this.detailSelected = item;
  }

  // Mock data for inventory/warehouse
  inventorySlots: any[] = [];
  warehouseSlots: any[] = [];

  // Map para almacenar items por personaje
  characterItems: Map<number, {
    equipped: any[],
    inventory: any[],
    warehouse: any[]
  }> = new Map();

  // Opciones de filtro
  races = [
    { id: 0, name: 'Human' },
    { id: 1, name: 'Elf' },
    { id: 2, name: 'Dark Elf' },
    { id: 3, name: 'Orc' },
    { id: 4, name: 'Dwarf' },
    { id: 5, name: 'Kamael' }
  ];

  classes = CLASS_TABLE;
  accountsGames: String[] = [];

  onlineOptions = [
    { value: 1, label: 'Online' },
    { value: 0, label: 'Offline' }
  ];

  private clansPlayersMap: Map<number, Clan> = new Map();
  Object: any;

  constructor(
    private characterService: CharacterService,
    private authService: AuthService,
    private clanService: ClanService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Ajustar visibleStatsCount según el ancho de pantalla
    this.updateVisibleStatsCount();
    window.addEventListener('resize', this.updateVisibleStatsCount.bind(this));

    // Obtener datos del usuario actual incluyendo email desde el endpoint /me
    this.authService.getCurrentUser().subscribe({
      next: (user: AccountMaster) => {
        const email = user.email;
        this.loadCharactersByEmail(email);
      },
      error: () => {
        this.error = 'User not authenticated.';
        this.loading = false;
      }
    });


    // Add keyboard event listener for Escape key
    document.addEventListener('keydown', this.handleKeyDown.bind(this));

    // Add Bootstrap modal event listeners
    this.setupModalListeners();
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.updateVisibleStatsCount.bind(this));
    // Remove keyboard event listener
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
  }

  private setupModalListeners(): void {
    // Wait for Bootstrap to be available
    setTimeout(() => {
      const modal = document.getElementById('itemDetailsModal');
      if (modal) {
        modal.addEventListener('hidden.bs.modal', () => {
          this.selectedItem = null;
          this.modalReady = false;
        });

        modal.addEventListener('shown.bs.modal', () => {
          this.modalReady = true;
          this.cdr.detectChanges();
        });
      }
    }, 1000);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.selectedItem) {
      this.hideItemTooltip();
    }
  }

  private loadCharactersByEmail(email: string) {
    // Cargar la primera página con paginación del backend
    this.loadPage(email, 0);

    // Cargar estadísticas del backend
    this.characterService.getCharacterStatsByEmail(email).subscribe({
      next: (stats: CharacterStats) => {
        this.characterStats = stats;
      },
      error: (err) => {
        console.error('Error loading character stats:', err);
      }
    });
  }

  private loadPage(email: string, page: number) {
    // Solo mostrar loading completo en la primera carga
    if (page === 0) {
      this.loading = true;
    } else {
      this.pageLoading = true;
    }

    // Limpiar el mapa de clanes al cambiar de página para evitar conflictos
    this.clansPlayersMap.clear();

    this.characterService.getCharactersByEmailPaginated(email, page, this.itemsPerPage).subscribe({
      next: (response: PaginatedResponse<Character>) => {
        this.characters = response.content;
        this.filteredCharacters = response.content; // Inicialmente igual a los personajes cargados

        // Actualizar información de paginación
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.hasNext = response.hasNext;
        this.hasPrevious = response.hasPrevious;

        this.loading = false;
        this.pageLoading = false;

        let totalpvp = 0;
        let charactersLoaded = 0;
        const totalCharacters = response.content.length;

        // Limpiar el map de items por personaje
        this.characterItems.clear();

        // Cargar cuentas únicas
        this.accountsGames = [];
        response.content.forEach(char => {
          if (!this.accountsGames.includes(char.accountName)) {
            this.accountsGames.push(char.accountName);
          }

          // Inicializar arrays de items para este personaje
          this.characterItems.set(char.charId, {
            equipped: [],
            inventory: [],
            warehouse: []
          });

          // Cargar items del personaje
          this.characterService.getItemsByCharacterId(char.charId).subscribe({
            next: (items: any) => {
              // Obtener el objeto de items de este personaje
              const charItems = this.characterItems.get(char.charId);
              // Procesar items según su ubicación
              if (items && Array.isArray(items) && charItems) {
                items.forEach(item => {
                  // Arreglo de itemIds custom que requieren limpieza especial del icono
                  const CUSTOM_ICON_IDS = [29520];
                  let iconPath = 'assets/images/classic.png'; // fallback
                  if (item.attributes?.icon) {
                    let iconName = item.attributes.icon;
                    if (CUSTOM_ICON_IDS.includes(item.itemId)) {
                      // Remueve todo antes del último punto
                      iconName = iconName.split('.').pop() || iconName;
                    } else {
                      iconName = iconName.replace('icon.', '');
                    }
                    // Solo agrega .png si no termina en .png
                    if (!iconName.toLowerCase().endsWith('.png')) {
                      iconName += '.png';
                    }
                    iconPath = `assets/icon/${iconName}`;
                  }

                  // Crear objeto de item procesado
                  const processedItem = {
                    ...item,
                    icon: iconPath,
                    characterName: char.charName,
                    characterId: char.charId,
                    // Usar el nombre real si existe, si no buscar en attributes, si no fallback
                    name:
                      (item.name && !item.name.startsWith('Item ')) ? item.name :
                      (item.attributes?.name) ? item.attributes.name :
                      `Item ${item.itemId}`,
                    type: this.getItemType(item.attributes)
                  };

                  // Clasificar items según su ubicación
                  if (item.location === 'PAPERDOLL') {
                    // Item equipado
                    charItems.equipped.push(processedItem);
                  } else if (item.location === 'INVENTORY') {
                    // Item en inventario
                    charItems.inventory.push(processedItem);
                  } else if (item.location === 'WAREHOUSE') {
                    // Item en warehouse
                    charItems.warehouse.push(processedItem);
                  }
                });
              }

              charactersLoaded++;

              // Si todos los personajes han cargado, aplicar filtros
              if (charactersLoaded === totalCharacters) {
                this.applyFilters();
              }
            },
            error: (err: any) => {
              console.error('Error loading items for character', char.charName, err);
              charactersLoaded++;
              if (charactersLoaded === totalCharacters) {
                this.applyFilters();
              }
            }
          });

          if (char.clanid) {
            this.clanService.getClanById(char.clanid).subscribe({
              next: (clan) => {
                this.addClanToMap(clan);
                // Forzar detección de cambios después de cargar el clan
                this.cdr.detectChanges();
              },
              error: (err) => {
              }
            });
          }

          totalpvp += char.pvpkills || 0;
        });

        this.totalOnlineTime = this.characters.reduce((sum, char) => sum + (char.onlineTime || 0), 0);

      },
      error: () => {
        this.error = 'Error loading characters.';
        this.loading = false;
        this.pageLoading = false;
      }
    });
  }

  private addClanToMap(clan: Clan): void {
    this.clansPlayersMap.set(clan.clanId, clan);
  }
  getClanById(clanId: number): Clan | undefined {
    if (!clanId) {
      return undefined;
    }

    const clan = this.clansPlayersMap.get(clanId);
    if (!clan) {
    }
    return clan;
  }

  isClanLoaded(clanId: number): boolean {
    return this.clansPlayersMap.has(clanId);
  }
  // Método privado para actualizar el array que usa el template (si lo necesitás)


  getAverageLevel(): number {
    // Usar estadísticas del backend si están disponibles
    if (this.characterStats) {
      return this.characterStats.averageLevel;
    }
    // Fallback a cálculo local
    if (this.filteredCharacters.length === 0) return 0;
    const totalLevel = this.filteredCharacters.reduce((sum, char) => sum + char.level, 0);
    return Math.round(totalLevel / this.filteredCharacters.length);
  }

  getTotalPvpKills(): number {
    return this.filteredCharacters.reduce((sum, char) => sum + char.pvpkills, 0);
  }

  getMaxLevel(): number {
    // Usar estadísticas del backend si están disponibles
    if (this.characterStats) {
      return this.characterStats.maxLevel;
    }
    // Fallback a cálculo local
    if (this.filteredCharacters.length === 0) return 0;
    return Math.max(...this.filteredCharacters.map(char => char.level));
  }

  getTotalCharacters(): number {
    // Usar estadísticas del backend si están disponibles
    if (this.characterStats) {
      return this.characterStats.totalCharacters;
    }
    // Fallback a cálculo local
    return this.totalElements;
  }

  /**
   * Convierte una cantidad de segundos a un string legible con días, horas, minutos y segundos.
   * Ejemplo: 5612 -> "1 hour, 33 minutes and 32 seconds"
   * @param totalSeconds número total de segundos a convertir
   * @returns string formateado
   */
  /**
  * Convierte un total de segundos en un string legible con días, horas y minutos.
  * Evita mostrar valores poco útiles (como milisegundos).
  * @param totalSeconds - tiempo total en segundos
  * @returns string formateado
  */
  formatSecondsToDHMS(unixTimestampSeconds: number): string {
    if (!unixTimestampSeconds || unixTimestampSeconds <= 0) return '0 seconds';

    const nowSeconds = Math.floor(Date.now() / 1000); // tiempo actual en segundos

    // Diferencia entre timestamp futuro o pasado respecto a ahora
    let diffSeconds = unixTimestampSeconds - nowSeconds;

    if (diffSeconds <= 0) {
      return 'Expired'; // o 'Ended', '0 seconds' según contexto
    }

    // Calcular días, horas, minutos de la diferencia
    const days = Math.floor(diffSeconds / 86400);
    const hours = Math.floor((diffSeconds % 86400) / 3600);
    const minutes = Math.floor((diffSeconds % 3600) / 60);

    const parts: string[] = [];

    if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);

    if (parts.length === 0) return 'Less than a minute';

    return parts.join(', ');
  }
  /**
   * Convierte un timestamp en ms a un string legible con días, horas y minutos restantes.
   * Si el tiempo ya pasó, devuelve "Expired".
   * También devuelve la fecha completa para referencia.
   * @param timestampMs Timestamp en milisegundos
   * @returns String formateado con duración y fecha
   */
  /**
   * Convierte un timestamp en ms a un string abreviado con días (d), horas (h) y minutos (m).
   * Si ya expiró, devuelve 'Exp.'.
   * Ejemplo: "1d 3h 5m", "2h 15m", "5m"
   * @param timestampMs Timestamp en milisegundos
   * @returns String abreviado con tiempo restante o Exp.
   */
  formatTimestampMsToShortRemaining(timestampMs: number): string {
    if (!timestampMs || timestampMs <= 0) return 'No penalty';

    const nowMs = Date.now();
    const diffMs = timestampMs - nowMs;

    if (diffMs <= 0) return 'Exp.';

    const diffSeconds = Math.floor(diffMs / 1000);

    const days = Math.floor(diffSeconds / 86400);
    const hours = Math.floor((diffSeconds % 86400) / 3600);
    const minutes = Math.floor((diffSeconds % 3600) / 60);

    const parts: string[] = [];

    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);

    if (parts.length === 0) parts.push('<1m');

    return parts.join(' ');
  }

  /**
   * Convierte segundos a formato compacto "1H 30M"
   * @param totalSeconds Segundos totales
   * @returns String con horas y minutos abreviados
   */
  formatSecondsToHM(totalSeconds: number): string {
    if (!totalSeconds || totalSeconds <= 0) return '0M';

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    const parts: string[] = [];

    if (hours > 0) {
      parts.push(`${hours}H`);
    }
    if (minutes > 0 || parts.length === 0) {
      parts.push(`${minutes}M`);
    }

    return parts.join(' ');
  }

  /**
 * Convierte un timestamp (segundos) a tiempo transcurrido con iniciales abreviadas.
 * Ejemplo: 90061 (segundos) → "1d 1h 1m"
 * @param lastAccessTimestamp timestamp en segundos
 * @returns string con formato compacto de tiempo
 */
  formatTimestampToCompactElapsed(lastAccessTimestamp: number): string {
    if (!lastAccessTimestamp) return 'N/A';

    const lastAccessDate = new Date(lastAccessTimestamp * 1000);
    const now = new Date();

    let diffSeconds = Math.floor((now.getTime() - lastAccessDate.getTime()) / 1000);
    if (diffSeconds < 0) return 'In the future';

    const days = Math.floor(diffSeconds / 86400);
    diffSeconds %= 86400;

    const hours = Math.floor(diffSeconds / 3600);
    diffSeconds %= 3600;

    const minutes = Math.floor(diffSeconds / 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);

    // Si no hay días, horas ni minutos (menos de 60s)
    if (parts.length === 0) return 'less than a minute';

    return parts.join(' ');
  }


  getRaceName(raceId: number): string {
    const races: Record<number, string> = {
      0: 'Human',
      1: 'Elf',
      2: 'Dark Elf',
      3: 'Orc',
      4: 'Dwarf',
      5: 'Kamael'
    };
    return races[raceId] || 'Unknown';
  }

  getClassName(classId: number): string {
    return getClassNameById(classId);
  }

  formatNumber(num: number): string {
    return num.toLocaleString();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US');
  }

  trackByCharId(index: number, character: Character): number {
    return character.charId;
  }

  applyFilters(): void {
    // Para filtros locales, solo filtramos los personajes de la página actual
    this.filteredCharacters = this.characters.filter(character => {
      // Filtro de búsqueda por nombre
      const matchesSearch = this.searchTerm === '' ||
        character.charName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        character.accountName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        this.getClassName(character.classid).toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        this.getRaceName(character.race).toLowerCase().includes(this.searchTerm.toLowerCase());

      // Filtro por raza
      const matchesRace = this.selectedRace === null || character.race === this.selectedRace;

      // Filtro por cuenta
      const matchesAccount = this.selectedAccount === null || character.accountName === this.selectedAccount;

      // Filtro por clase
      const matchesClass = this.selectedClass === null || character.classid === this.selectedClass;

      // Filtro por estado online
      const matchesOnlineStatus = this.onlineStatus === null || character.online === this.onlineStatus;

      // Filtro por nivel
      const matchesMinLevel = this.minLevel === null || character.level >= this.minLevel;
      const matchesMaxLevel = this.maxLevel === null || character.level <= this.maxLevel;

      return matchesSearch && matchesRace && matchesAccount && matchesClass && matchesOnlineStatus &&
        matchesMinLevel && matchesMaxLevel;
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedRace = null;
    this.selectedAccount = null;
    this.selectedClass = null;
    this.onlineStatus = null;
    this.minLevel = null;
    this.maxLevel = null;
    this.applyFilters();
  }

  // Métodos de paginación actualizados para usar el backend
  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      // Obtener el email del usuario actual
      this.authService.getCurrentUser().subscribe({
        next: (user: AccountMaster) => {
          // Pequeño delay para transición suave
          setTimeout(() => {
            this.loadPage(user.email, page);
          }, 100);
        },
        error: () => {
          this.error = 'User not authenticated.';
        }
      });
    }
  }

  nextPage(): void {
    if (this.hasNext) {
      this.authService.getCurrentUser().subscribe({
        next: (user: AccountMaster) => {
          this.loadPage(user.email, this.currentPage + 1);
        },
        error: () => {
          this.error = 'User not authenticated.';
        }
      });
    }
  }

  previousPage(): void {
    if (this.hasPrevious) {
      this.authService.getCurrentUser().subscribe({
        next: (user: AccountMaster) => {
          this.loadPage(user.email, this.currentPage - 1);
        },
        error: () => {
          this.error = 'User not authenticated.';
        }
      });
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5; // Máximo de números de página a mostrar

    if (this.totalPages <= maxVisiblePages) {
      // Mostrar todas las páginas si son pocas (0-based)
      for (let i = 0; i < this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para mostrar páginas con "..." en medio (0-based)
      const startPage = Math.max(0, this.currentPage - Math.floor(maxVisiblePages / 2));
      const endPage = Math.min(this.totalPages - 1, startPage + maxVisiblePages - 1);

      if (startPage > 0) {
        pages.push(0);
        if (startPage > 1) {
          pages.push(-1); // -1 representará los "..."
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < this.totalPages - 1) {
        if (endPage < this.totalPages - 2) {
          pages.push(-1); // -1 representará los "..."
        }
        pages.push(this.totalPages - 1);
      }
    }

    return pages;
  }

  toggleSeeMore(charId: number): void {
    this.seeMoreMap[charId] = !this.seeMoreMap[charId];
  }

  isSeeMore(charId: number): boolean {
    return !!this.seeMoreMap[charId];
  }

  getExpProgressPercentage(character: Character): number {
    const currentLevel = character.level;
    const currentExp = character.exp;

    const levelInfo = LEVEL_EXPERIENCE_TABLE.find(lvl => lvl.level === currentLevel);

    if (!levelInfo || levelInfo.expToNext === 0) return 100; // Max level or error

    const expToNext = levelInfo.expToNext;

    // Calcular cuánta exp lleva hacia el siguiente nivel
    const previousLevelsExp = LEVEL_EXPERIENCE_TABLE
      .filter(l => l.level < currentLevel)
      .reduce((sum, l) => sum + l.expToNext, 0);

    const expInThisLevel = currentExp - previousLevelsExp;

    const percentage = (expInThisLevel / expToNext) * 100;

    return Math.min(Math.max(+percentage.toFixed(2), 0), 100); // Redondeado a 2 decimales
  }

  // Modal methods
  openInventoryModal(character: Character): void {
    this.selectedCharacter = character;
    this.activeTab = 'inventory';
    this.showInventoryModal = true;
    this.detailSelected = null;
  }

  openWarehouseModal(character: Character): void {
    this.selectedCharacter = character;
    this.activeTab = 'warehouse';
    this.showInventoryModal = true;
    this.detailSelected = null;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedCharacter = null;
    this.inventorySlots = [];
    this.warehouseSlots = [];
  }

  setWarehouseTab(tab: 'personal' | 'clan'): void {
    this.warehouseTab = tab;
  }



  // Helper methods for tooltip
  hasStats(slot: any): boolean {
    return slot && slot.stats && typeof slot.stats === 'object' && Object.keys(slot.stats).length > 0;
  }

  hasAttributes(slot: any): boolean {
    return slot && slot.attributes && typeof slot.attributes === 'object' && Object.keys(slot.attributes).length > 0;
  }

  getStatsArray(stats: any): Array<{ name: string, value: any }> {
    if (!stats || typeof stats !== 'object') return [];

    const statNames: { [key: string]: string } = {
      'pAtk': 'Physical Attack',
      'mAtk': 'Magic Attack',
      'pDef': 'Physical Defense',
      'mDef': 'Magic Defense',
      'pAtkSpd': 'Attack Speed',
      'mAtkSpd': 'Magic Speed',
      'pAtkRange': 'Attack Range',
      'rCrit': 'Critical Rate',
      'accCombat': 'Accuracy',
      'randomDamage': 'Random Damage',
      'maxMp': 'Max MP'
    };

    return Object.entries(stats)
      .filter(([_, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => ({
        name: statNames[key] || this.formatStatName(key),
        value: value
      }));
  }

  getAttributesArray(attributes: any): Array<{ name: string, value: any }> {
    if (!attributes || typeof attributes !== 'object') return [];

    const attributeNames: { [key: string]: string } = {
      'weapon_type': 'Weapon Type',
      'armor_type': 'Armor Type',
      'material': 'Material',
      'weight': 'Weight',
      'bodypart': 'Body Part',
      'is_tradable': 'Tradable',
      'is_dropable': 'Dropable',
      'is_sellable': 'Sellable',
      'is_depositable': 'Depositable',
      'immediate_effect': 'Immediate Effect',
      'soulshots': 'Soulshots',
      'spiritshots': 'Spiritshots',
      'default_action': 'Default Action',
      'isAppearanceable': 'Appearanceable',
      'damage_range': 'Damage Range',
      'crystal_type': 'Crystal Type',
      'crystal_count': 'Crystal Count',
      'price': 'Price',
      'enchant_enabled': 'Enchant Enabled',
      'mp_consume': 'MP Consume',
      'is_stackable': 'Stackable',
      'handler': 'Handler',
      'etcitem_type': 'Item Type',
      'is_oly_restricted': 'Olympiad Restricted',
      'commissionItemType': 'Commission Type',
      'is_magic_weapon': 'Magic Weapon',
      'time': 'Time'
    };

    return Object.entries(attributes)
      .filter(([key, value]) => value !== null && value !== undefined && value !== '' && key !== 'icon')
      .map(([key, value]) => ({
        name: attributeNames[key] || this.formatAttributeName(key),
        value: this.formatAttributeValue(key, value)
      }));
  }

  private formatStatName(key: string): string {
    return key.replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  private formatAttributeName(key: string): string {
    return key.replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  private formatAttributeValue(key: string, value: any): string {
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (key === 'weight') {
      return `${value}g`;
    }
    if (key === 'damage_range') {
      return value.replace(/;/g, ' - ');
    }
    if (key === 'price') {
      return this.formatNumber(parseInt(value));
    }
    if (key === 'time') {
      return this.formatSecondsToHM(parseInt(value));
    }
    if (key === 'mp_consume') {
      return `${value} MP`;
    }
    if (key === 'crystal_count') {
      return `${value} crystals`;
    }
    if (key === 'is_tradable' || key === 'is_dropable' || key === 'is_sellable' ||
      key === 'is_depositable' || key === 'immediate_effect' || key === 'isAppearanceable' ||
      key === 'enchant_enabled' || key === 'is_stackable' || key === 'is_oly_restricted' ||
      key === 'is_magic_weapon') {
      return value === 'true' ? 'Yes' : 'No';
    }
    return String(value);
  }

  // Helper method to format damage range for display
  formatDamageRange(damageRange: string): string {
    if (!damageRange) return '0-0';
    return damageRange.replace(/;/g, ' - ');
  }

  // Helper methods for inventory sections
  getEquippedSlots(): any[] {
    if (!this.selectedCharacter) return [];
    const charItems = this.characterItems.get(this.selectedCharacter.charId);
    return charItems?.equipped || [];
  }

  getInventorySlots(): any[] {
    if (!this.selectedCharacter) return [];
    const charItems = this.characterItems.get(this.selectedCharacter.charId);
    return charItems?.inventory || [];
  }

  getWarehouseSlots(): any[] {
    if (!this.selectedCharacter) return [];
    const charItems = this.characterItems.get(this.selectedCharacter.charId);
    return charItems?.warehouse || [];
  }

  // Tooltip methods
  showItemTooltip(item: any): void {
    // Cierra el modal si ya está abierto
    const modal = document.getElementById('itemDetailsModal');
    if (modal && typeof (window as any).bootstrap !== 'undefined') {
      const existingModal = (window as any).bootstrap.Modal.getInstance(modal);
      if (existingModal) {
        existingModal.hide();
      }
    }

    // Setea el item seleccionado para detalles
    this.detailSelected = item;
    this.modalReady = true;
    this.cdr.detectChanges();

    // Abre el modal después de un pequeño delay
    setTimeout(() => {
      if (modal && typeof (window as any).bootstrap !== 'undefined') {
        const bootstrapModal = new (window as any).bootstrap.Modal(modal);
        bootstrapModal.show();
      }
    }, 50);
  }

  hideItemTooltip(): void {
    this.detailSelected = null;
    this.modalReady = false;
    // Hide Bootstrap modal
    const modal = document.getElementById('itemDetailsModal');
    if (modal) {
      const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modal);
      if (bootstrapModal) {
        bootstrapModal.hide();
      }
    }
  }

  // Debug method for item clicks
  debugItemClick(item: any, event: any): void {
    // Stop event propagation
    event.stopPropagation();

    // Call the original method
    this.showItemTooltip(item);
  }



  // Helper method to determine item type from attributes
  private getItemType(attributes: any): string {
    if (!attributes) return 'Unknown';

    if (attributes.weapon_type) return 'Weapon';
    if (attributes.armor_type) return 'Armor';
    if (attributes.bodypart) return 'Accessory';
    if (attributes.material) return 'Material';
    if (attributes.crystal_type) return 'Crystal';
    if (attributes.commissionItemType) return 'Commission Item';

    return 'Item';
  }

  // Check if warehouse is empty
  isWarehouseEmpty(): boolean {
    if (!this.selectedCharacter) return true;
    const charItems = this.characterItems.get(this.selectedCharacter.charId);
    return !charItems || charItems.warehouse.length === 0;
  }

  updateVisibleStatsCount() {
    if (window.innerWidth < 700) {
      this.visibleStatsCount = 1;
    } else {
      this.visibleStatsCount = 4;
    }
    // Ajustar el índice si es necesario
    if (this.carouselIndex + this.visibleStatsCount > this.statsArray.length) {
      this.carouselIndex = Math.max(0, this.statsArray.length - this.visibleStatsCount);
    }
  }
}