export interface OfflineStoreItemDTO {
  itemId: number;
  count: number;
  price: number;
}

export interface OfflineStoreDTO {
  charId: number;
  title: string;
  type: number;
  time: number;
  items: OfflineStoreItemDTO[];
}
