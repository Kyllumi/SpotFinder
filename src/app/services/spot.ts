import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Spot, SpotDTO, BoundingBox } from '../models/spot.model';

@Injectable({
  providedIn: 'root',
})
export class SpotService {
  private readonly apiUrl = 'http://localhost:8080/spots';

  constructor(private http: HttpClient) {}

  getAllSpots(): Observable<Spot[]> {
    return this.http.get<Spot[]>(this.apiUrl);
  }

  getSpotById(id: number): Observable<Spot> {
    return this.http.get<Spot>(`${this.apiUrl}/${id}`);
  }

  getSpotsInBoundingBox(box: BoundingBox): Observable<Spot[]> {
    const params = new HttpParams()
      .set('minLat', box.minLat.toString())
      .set('maxLat', box.maxLat.toString())
      .set('minLng', box.minLng.toString())
      .set('maxLng', box.maxLng.toString());

    return this.http.get<Spot[]>(`${this.apiUrl}/bbox`, { params });
  }

  createSpot(spot: SpotDTO): Observable<Spot> {
    return this.http.post<Spot>(this.apiUrl, spot);
  }

  updateSpot(id: number, spot: SpotDTO): Observable<Spot> {
    return this.http.put<Spot>(`${this.apiUrl}/${id}`, spot);
  }

  deleteSpot(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  uploadImage(spotId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/${spotId}/images`, formData);
  }
}
