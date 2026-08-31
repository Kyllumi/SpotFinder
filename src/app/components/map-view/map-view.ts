import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Spot, SpotDTO, BoundingBox, Service } from '../../models/spot.model';
import { SpotService } from '../../services/spot';
import { UiStateService } from '../../services/ui-state';
import { MapComponent } from '../map/map';
import { SpotListComponent } from '../spot-list/spot-list';
import { SpotFormComponent } from '../spot-form/spot-form';

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [CommonModule, MapComponent, SpotListComponent, SpotFormComponent],
  templateUrl: './map-view.html',
  styleUrl: './map-view.css',
})
export class MapViewComponent implements OnInit, OnDestroy {
  spots: Spot[] = [];
  servicesList: Service[] = [];
  selectedSpot: Spot | null = null;
  spotToEdit: Spot | null = null;
  clickedCoords: { lat: number; lng: number } | null = null;
  showForm: boolean = false;
  isSidebarOpen: boolean = false;
  currentBox!: BoundingBox;

  private openFormSub!: Subscription;

  constructor(
    private spotService: SpotService,
    private uiStateService: UiStateService,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadServices();
    this.loadSpots();

    this.openFormSub = this.uiStateService.openForm$.subscribe(() => {
      this.openCreateForm();
    });
  }

  ngOnDestroy(): void {
    if (this.openFormSub) {
      this.openFormSub.unsubscribe();
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    this.cdr.detectChanges();
  }

  loadServices(): void {
    this.http.get<Service[]>('http://localhost:8080/services').subscribe({
      next: (data) => {
        this.servicesList = data || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Errore caricamento servizi:', err),
    });
  }

  loadSpots(): void {
    this.spotService.getAllSpots().subscribe({
      next: (data) => {
        this.spots = data || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Errore caricamento spot:', err),
    });
  }

  onBoundsChanged(box: BoundingBox): void {
    this.currentBox = box;
  }

  onMapClick(coords: { lat: number; lng: number }): void {
    this.clickedCoords = coords;
    this.openCreateForm();
  }

  openCreateForm(): void {
    this.spotToEdit = null;
    this.selectedSpot = null;
    this.showForm = true;
    this.isSidebarOpen = true;
    this.cdr.detectChanges();
  }

  closeForm(): void {
    this.showForm = false;
    this.spotToEdit = null;
    this.clickedCoords = null;
    this.cdr.detectChanges();
  }

  onSaveSpot(event: { dto: SpotDTO }): void {
    if (event.dto.id) {
      this.spotService.updateSpot(event.dto.id, event.dto).subscribe({
        next: () => this.finishSave(),
        error: (err) => console.error('Errore salvataggio:', err),
      });
    } else {
      this.spotService.createSpot(event.dto).subscribe({
        next: () => this.finishSave(),
        error: (err) => console.error('Errore creazione:', err),
      });
    }
  }

  private finishSave(): void {
    this.closeForm();
    this.loadSpots();
  }

  // 1. CLICK SULLA CARD: Seleziona lo spot, inquadra il pin sulla mappa e chiude la sidebar se siamo su mobile
  onSpotCardClick(spot: Spot): void {
    this.selectedSpot = spot;
    
    // Su schermi piccoli chiude la sidebar per mostrare la mappa centrata sul pin
    if (window.innerWidth <= 768) {
      this.isSidebarOpen = false;
    }
    
    this.cdr.detectChanges();
  }

  // 2. CLICK SU "VAI AL DETTAGLIO": Naviga verso la rotta dedicata
  onGoToDetail(spot: Spot): void {
    if (spot && spot.id) {
      this.router.navigate(['/spots', spot.id]);
    }
  }

  closeSidebar(): void {
    this.showForm = false;
    this.isSidebarOpen = false;
    this.cdr.detectChanges();
  }
}