import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    country?: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class GeocodingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://nominatim.openstreetmap.org/search';

  searchLocation(query: string): Observable<NominatimResult[]> {
    if (!query || query.trim().length < 2) {
      return of([]);
    }

    const params = new HttpParams()
      .set('q', query.trim())
      .set('format', 'json')
      .set('addressdetails', '1')
      .set('limit', '5');

    return this.http.get<NominatimResult[]>(this.baseUrl, { params }).pipe(
      catchError((err) => {
        console.error('Errore durante la ricerca Nominatim:', err);
        return of([]);
      }),
    );
  }
}
