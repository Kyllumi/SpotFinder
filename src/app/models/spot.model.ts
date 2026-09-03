export type Category = string;
export type Status = 'DA_VISITARE' | 'VISITATO';

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