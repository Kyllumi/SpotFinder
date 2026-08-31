import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Spot, SpotDTO, BoundingBox } from './models/spot.model';
import { SpotService } from './services/spot';

import { HeaderComponent } from './components/header/header';
import { MapComponent } from './components/map/map';
import { SpotListComponent } from './components/spot-list/spot-list';
import { SpotDetailComponent } from './components/spot-detail/spot-detail';
import { SpotFormComponent } from './components/spot-form/spot-form';
import { HomePageComponent } from './components/home-page/home-page';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    HeaderComponent, 
    MapComponent, 
    SpotListComponent, 
    SpotDetailComponent, 
    SpotFormComponent,
    HomePageComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class AppComponent {
  currentView: 'home' | 'map' = 'home'; // Mostra la home all'avvio

  spots: Spot[] = [];
  selectedSpot: Spot | null = null;
  spotToEdit: Spot | null = null;
  clickedCoords: { lat: number; lng: number } | null = null;
  showForm = false;
  currentBox!: BoundingBox;

  constructor(private spotService: SpotService) {}

  onNavigate(view: 'home' | 'map'): void {
    this.currentView = view;
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