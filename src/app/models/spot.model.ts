export type Status = 'DA_VISITARE' | 'VISITATO';

// 1. Enum con le chiavi delle categorie
export enum SpotCategory {
  VISTA = 'VISTA',
  NATURA = 'NATURA',
  PESCA = 'PESCA',
  VANLIFE = 'VANLIFE',
  SPORT = 'SPORT',
  RELAX = 'RELAX',
  URBEX = 'URBEX',
  DOG_FRIENDLY = 'DOG_FRIENDLY',
  SMART_WORKING = 'SMART_WORKING',
  FOOD_SOCIAL = 'FOOD_SOCIAL',
}

// 2. Mappatura tra valore e testo leggibile per la UI
export const SPOT_CATEGORY_LABELS: Record<SpotCategory, string> = {
  [SpotCategory.VISTA]: 'Vista & Fotografia',
  [SpotCategory.NATURA]: 'Natura & Wild',
  [SpotCategory.PESCA]: 'Pesca & Water Spot',
  [SpotCategory.VANLIFE]: 'Vanlife & Overnight',
  [SpotCategory.SPORT]: 'Outdoor & Sport',
  [SpotCategory.RELAX]: 'Relax & Picnic',
  [SpotCategory.URBEX]: 'Urbano & Urbex',
  [SpotCategory.DOG_FRIENDLY]: 'Dog Friendly',
  [SpotCategory.SMART_WORKING]: 'Smart Working Outdoor',
  [SpotCategory.FOOD_SOCIAL]: 'Food & Social',
};

export type Category = SpotCategory | string;

export interface Service {
  id: number;
  name: string;
  icon_code?: string;
  iconCode?: string;
}

export interface SpotImage {
  id?: number;
  file_path: string;
  uploaded_at?: string;
}

export interface Spot {
  id: number;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  rating?: number;
  category: Category;
  status: Status;
  visited_at?: string;
  created_at?: string;
  services?: Service[];
  spot_images?: SpotImage[];
}

export interface SpotDTO {
  id?: number;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  rating?: number;
  category: string;
  status: Status;
  visited_at?: string;
  created_at?: string;
  services: Service[];
  spot_images?: SpotImage[];
}

export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}
