import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http'; // 1. Importa HttpClient
import { Spot, SpotDTO, BoundingBox, Service } from './models/spot.model'; // 2. Importa Service
import { SpotService } from './services/spot';

import { HeaderComponent } from './components/header/header';
import { MapComponent } from './components/map/map';
import { SpotListComponent } from './components/spot-list/spot-list';
import { SpotDetailComponent } from './components/spot-detail/spot-detail';
import { SpotFormComponent } from './components/spot-form/spot-form';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    HeaderComponent, 
    MapComponent, 
    SpotListComponent, 
    SpotDetailComponent, 
    SpotFormComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class AppComponent implements OnInit {
  spots: Spot[] = [];
  servicesList: Service[] = []; // Corretto in Service[]
  selectedSpot: Spot | null = null;
  spotToEdit: Spot | null = null;
  clickedCoords: { lat: number; lng: number } | null = null;
  showForm = false;
  currentBox!: BoundingBox;

  // 3. Iniettato 'http: HttpClient' nel costruttore
  constructor(
    private spotService: SpotService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Caricamento servizi dal backend
    this.http.get<Service[]>('http://localhost:8080/services').subscribe({
      next: (data) => {
        this.servicesList = data;
        console.log('Servizi caricati dal DB:', this.servicesList);
      },
      error: (err) => console.error('Errore caricamento servizi:', err)
    });
  }

  onBoundsChanged(box: BoundingBox): void {
    this.currentBox = box;
    this.loadSpots();
  }

  loadSpots(): void {
    this.spotService.getAllSpots().subscribe({
      next: (data) => {
        console.log('Spot ricevuti:', data);
        this.spots = data;
      },
      error: (err) => console.error('Errore backend:', err),
    });
  }

  onMapClick(coords: { lat: number; lng: number }): void {
    this.clickedCoords = coords;
    this.openCreateForm();
  }

  openCreateForm(): void {
    this.spotToEdit = null;
    this.selectedSpot = null;
    this.showForm = true;
  }

  openEditForm(spot: Spot): void {
    this.spotToEdit = spot;
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.spotToEdit = null;
    this.clickedCoords = null;
  }

  onSaveSpot(event: { dto: SpotDTO }): void {
    if (event.dto.id) {
      this.spotService.updateSpot(event.dto.id, event.dto).subscribe(() => this.finishSave());
    } else {
      this.spotService.createSpot(event.dto).subscribe(() => this.finishSave());
    }
  }

  private finishSave(): void {
    this.closeForm();
    this.loadSpots();
  }

  onDeleteSpot(id: number): void {
    if (confirm('Vuoi davvero eliminare questo spot?')) {
      this.spotService.deleteSpot(id).subscribe(() => {
        this.selectedSpot = null;
        this.loadSpots();
      });
    }
  }
}