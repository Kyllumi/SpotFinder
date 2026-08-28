import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Service } from '../models/spot.model';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private readonly apiUrl = 'http://localhost:8080/services';

  constructor(private http: HttpClient) {}

  getAllServices(): Observable<Service[]> {
    return this.http.get<Service[]>(this.apiUrl);
  }
}