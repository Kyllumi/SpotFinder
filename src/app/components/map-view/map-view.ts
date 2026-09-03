import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router'; // 1. Importa ActivatedRoute
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
  private routeSub!: Subscription; // Subscription per i parametri URL

  constructor(
    private spotService: SpotService,
    private uiStateService: UiStateService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute, // 2. Inietta ActivatedRoute
    private cdr: ChangeDetectorRef,
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
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  loadSpots(): void {
    this.spotService.getAllSpots().subscribe({
      next: (data) => {
        this.spots = data || [];

        // 3. Ascolta i queryParams non appena gli spot sono caricati
        this.checkQueryParams();

        this.cdr.detectChanges();
      },
      error: (err) => console.error('Errore caricamento spot:', err),
    });
  }

  // Legge lat, lng e id dall'URL se si proviene dalla HomePage
  private checkQueryParams(): void {
    this.routeSub = this.route.queryParams.subscribe((params) => {
      const lat = parseFloat(params['lat']);
      const lng = parseFloat(params['lng']);
      const spotId = params['id'];

      if (!isNaN(lat) && !isNaN(lng)) {
        // Cerca lo spot corrispondente nella lista caricata
        const targetSpot =
          this.spots.find((s) => s.id == spotId) ||
          ({
            id: spotId,
            latitude: lat,
            longitude: lng,
          } as Spot);

        // Imposta lo spot selezionato in modo che app-map riceva le coordinate
        this.selectedSpot = targetSpot;

        // Se siamo su schermi piccoli chiude la sidebar per mostrare direttamente il punto
        if (window.innerWidth <= 768) {
          this.isSidebarOpen = false;
        }

        this.cdr.detectChanges();
      }
    });
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

  onSpotCardClick(spot: Spot): void {
    this.selectedSpot = spot;

    if (window.innerWidth <= 768) {
      this.isSidebarOpen = false;
    }

    this.cdr.detectChanges();
  }

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
