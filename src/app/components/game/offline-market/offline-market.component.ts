import { Component, OnInit } from '@angular/core';
import { OfflineMarketService } from '../../../services/offline-market.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OfflineStoreDTO } from '../../../models/offline-store.model';

interface MarketItem {
  itemId: number;
  count: number;
  price: number;
  enchantLevel: number;
  time: number;
  name: string;
  type: string;
  attributes?: any;
}

interface MarketStore {
  char_name: string;
  title?: string;
  type: number;
  time: number;
  items: MarketItem[];
}

@Component({
  selector: 'app-offline-market',
  imports: [CommonModule, FormsModule],
  templateUrl: './offline-market.component.html',
  styleUrl: './offline-market.component.css'
})
export class OfflineMarketComponent implements OnInit {
  stores: MarketStore[] = [];
  filteredStores: MarketStore[] = [];
  loading = false;
  error = '';

  // Filtros
  searchTerm = '';
  selectedOperationType = 'all';
  selectedType = 'all';
  minPrice = '';
  maxPrice = '';
  enchantFilter = 'all';
  stockFilter = 'all';
  crystalFilter = 'all';
  timeFilter = 'all';
  sortBy = 'time';

  // Accordion states
  accordionStates = {
    enchant: true,
    stock: true,
    crystal: true,
    time: true
  };

  // Paginación
  currentPage = 1;
  itemsPerPage = 6;
  totalPages = 1;

  // Stats
  totalStores = 0;
  totalItems = 0;
  averagePrice = 0;

  constructor(private marketService: OfflineMarketService) { }

  ngOnInit() {
    this.loadMarketData();
  }

  loadMarketData() {
    this.loading = true;
    this.error = '';

    // IDs de items custom que requieren limpieza especial del icono
    const CUSTOM_ICON_IDS = [29520 /*, otros ids custom si los tienes */];

    this.marketService.getOfflineStores().subscribe({
      next: (stores: MarketStore[] | any) => {
        // Limpiar prefijo de icono de cada ítem (custom o normal)
        stores.forEach((store: MarketStore) => {
          store.items.forEach((item: MarketItem) => {
            if (item.attributes?.icon) {
              let iconName = item.attributes.icon;
              if (CUSTOM_ICON_IDS.includes(item.itemId)) {
                iconName = iconName.split('.').pop() || iconName;
              } else {
                iconName = iconName.replace('icon.', '');
              }
              item.attributes.icon = iconName;
            }
          });
        });









        this.stores = stores;
        this.calculateStats();
        this.applyFilters();

        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar las tiendas offline';
        this.loading = false;
        console.error('Error:', err);
      }
    });



  }


  calculateStats() {
    this.totalStores = this.stores.length;
    this.totalItems = this.stores.reduce((total, store) => total + store.items.length, 0);

    const allPrices = this.stores.flatMap(store => store.items.map(item => item.price));
    this.averagePrice = allPrices.length > 0 ?
      Math.round(allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length) : 0;
  }

  applyFilters() {
    let filtered = [...this.stores];

    // Filtro por nombre de tienda o título
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(store =>
        store.char_name.toLowerCase().includes(term) ||
        (store.title && store.title.toLowerCase().includes(term)) ||
        store.items.some(item => item.name.toLowerCase().includes(term))
      );
    }

    // Filtro por tipo de operación (compra/venta)
    if (this.selectedOperationType !== 'all') {
      const operationType = parseInt(this.selectedOperationType);
      filtered = filtered.filter(store => store.type === operationType);
    }

    // Filtro por tipo de item
    if (this.selectedType !== 'all') {
      filtered = filtered.filter(store =>
        store.items.some(item => item.type.toLowerCase() === this.selectedType.toLowerCase())
      );
    }

    // Filtro por precio
    if (this.minPrice) {
      const min = parseInt(this.minPrice);
      filtered = filtered.filter(store =>
        store.items.some(item => item.price >= min)
      );
    }

    if (this.maxPrice) {
      const max = parseInt(this.maxPrice);
      filtered = filtered.filter(store =>
        store.items.some(item => item.price <= max)
      );
    }

    // Filtro por enchant level
    if (this.enchantFilter !== 'all') {
      filtered = filtered.filter(store =>
        store.items.some(item => this.checkEnchantFilter(item.enchantLevel))
      );
    }

    // Filtro por stock
    if (this.stockFilter !== 'all') {
      filtered = filtered.filter(store =>
        this.checkStockFilter(store.items.length)
      );
    }

    // Filtro por tipo de cristal
    if (this.crystalFilter !== 'all') {
      filtered = filtered.filter(store =>
        store.items.some(item =>
          item.attributes?.crystal_type === this.crystalFilter
        )
      );
    }

    // Filtro por tiempo
    if (this.timeFilter !== 'all') {
      const timeLimit = this.getTimeLimit();
      filtered = filtered.filter(store => store.time >= timeLimit);
    }

    // Ordenamiento
    this.sortStores(filtered);

    this.filteredStores = filtered;
    this.totalPages = Math.ceil(this.filteredStores.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  checkEnchantFilter(enchantLevel: number): boolean {
    switch (this.enchantFilter) {
      case '0': return enchantLevel === 0;
      case '1-3': return enchantLevel >= 1 && enchantLevel <= 3;
      case '4-7': return enchantLevel >= 4 && enchantLevel <= 7;
      case '8-10': return enchantLevel >= 8 && enchantLevel <= 10;
      case '11-15': return enchantLevel >= 11 && enchantLevel <= 15;
      case '16+': return enchantLevel >= 16;
      default: return true;
    }
  }

  checkStockFilter(itemCount: number): boolean {
    switch (this.stockFilter) {
      case '1': return itemCount === 1;
      case '2-5': return itemCount >= 2 && itemCount <= 5;
      case '6-10': return itemCount >= 6 && itemCount <= 10;
      case '10+': return itemCount >= 10;
      default: return true;
    }
  }

  getTimeLimit(): number {
    const now = Date.now();
    switch (this.timeFilter) {
      case '1h': return now - (60 * 60 * 1000);
      case '24h': return now - (24 * 60 * 60 * 1000);
      case '7d': return now - (7 * 24 * 60 * 60 * 1000);
      case '30d': return now - (30 * 24 * 60 * 60 * 1000);
      default: return 0;
    }
  }

  sortStores(stores: MarketStore[]) {
    stores.sort((a, b) => {
      switch (this.sortBy) {
        case 'time':
          return b.time - a.time; // Más reciente primero
        case 'price':
          const aMaxPrice = Math.max(...a.items.map(item => item.price));
          const bMaxPrice = Math.max(...b.items.map(item => item.price));
          return bMaxPrice - aMaxPrice; // Precio más alto primero
        case 'name':
          return a.char_name.localeCompare(b.char_name);
        case 'enchant':
          const aMaxEnchant = Math.max(...a.items.map(item => item.enchantLevel || 0));
          const bMaxEnchant = Math.max(...b.items.map(item => item.enchantLevel || 0));
          return bMaxEnchant - aMaxEnchant; // Enchant más alto primero
        default:
          return 0;
      }
    });
  }

  onFilterChange() {
    this.applyFilters();
  }

  resetFilters() {
    this.searchTerm = '';
    this.selectedOperationType = 'all';
    this.selectedType = 'all';
    this.minPrice = '';
    this.maxPrice = '';
    this.enchantFilter = 'all';
    this.stockFilter = 'all';
    this.crystalFilter = 'all';
    this.timeFilter = 'all';
    this.sortBy = 'time';

    // Reset accordion states
    this.accordionStates = {
      enchant: false,
      stock: false,
      crystal: false,
      time: false
    };

    this.applyFilters();
  }

  getPagedStores(): MarketStore[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredStores.slice(startIndex, startIndex + this.itemsPerPage);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const pages = [];
    const maxPagesToShow = 5;
    const startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  formatPrice(price: number): string {
    return price.toLocaleString('es-ES');
  }

  formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  getItemTypes(): string[] {
    const types = new Set<string>();
    this.stores.forEach(store => {
      store.items.forEach(item => {
        types.add(item.type);
      });
    });
    return Array.from(types).sort();
  }

  getStoreTypeText(type: number): string {
    return type === 1 ? 'Sell' : 'Buy';
  }

  getStoreTypeClass(type: number): string {
    return type === 1 ? 'status-active' : 'status-inactive';
  }

  toggleAccordion(section: string) {
    this.accordionStates[section as keyof typeof this.accordionStates] =
      !this.accordionStates[section as keyof typeof this.accordionStates];
  }
}