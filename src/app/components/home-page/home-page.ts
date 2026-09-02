import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  HostListener,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, switchMap, catchError } from 'rxjs/operators';

import { Spot } from '../../models/spot.model';
import { SpotService } from '../../services/spot';
import { GeocodingService, NominatimResult } from '../../services/geocoding';

export interface SuggestionItem {
  label: string;
  spot?: Spot;
  nominatim?: NominatimResult; // Per distinguere se la suggestion è una località esterna
  type: 'spot' | 'location';
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home-page.html',
  styleUrls: ['./home-page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent implements OnInit, OnDestroy {
  private readonly spotService = inject(SpotService);
  private readonly geocodingService = inject(GeocodingService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly elementRef = inject(ElementRef);

  spots: Spot[] = [];
  searchQuery = '';
  isLoading = true;
  readonly skeletonCards = Array(4).fill(0);

  // Gestione Suggerimenti Search Bar
  filteredSuggestions: SuggestionItem[] = [];
  selectedSuggestion: SuggestionItem | null = null;
  showSuggestions = false;
  selectedIndex = -1;

  // Stream per debounce della ricerca
  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;

  // Stato interazione drag-scroll carosello
  private activeTrack: HTMLDivElement | null = null;
  private isMouseDown = false;
  private isDragging = false;
  private startX = 0;
  private scrollLeft = 0;
  private velocity = 0;
  private lastX = 0;
  private animationFrameId: number | null = null;

  ngOnInit(): void {
    this.fetchSpots();
    this.initSearchStream();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  private fetchSpots(): void {
    this.isLoading = true;
    this.spotService.getAllSpots().subscribe({
      next: (data) => {
        this.spots = Array.isArray(data) ? data : [];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Errore durante il recupero degli spot:', err);
        this.spots = [];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  // Inizializza lo stream della ricerca con Debounce e SwitchMap
  private initSearchStream(): void {
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(300), // Attende 300ms di inattività prima di chiamare l'API
        switchMap((query) => {
          const trimmed = query.trim().toLowerCase();
          if (trimmed.length < 2) {
            return of({ query: trimmed, nominatimResults: [] });
          }
          // Esegue la chiamata verso Nominatim
          return this.geocodingService.searchLocation(trimmed).pipe(
            catchError(() => of([] as NominatimResult[])),
            switchMap((results) => of({ query: trimmed, nominatimResults: results })),
          );
        }),
      )
      .subscribe(({ query, nominatimResults }) => {
        this.buildSuggestions(query, nominatimResults);
      });
  }

  onSearchInput(): void {
    this.selectedIndex = -1;
    this.selectedSuggestion = null;
    this.searchSubject.next(this.searchQuery);
  }

  // Costruisce la lista combinata (Spot locali + Località Nominatim)
  private buildSuggestions(query: string, nominatimResults: NominatimResult[]): void {
    if (query.length < 2) {
      this.filteredSuggestions = [];
      this.showSuggestions = false;
      this.cdr.markForCheck();
      return;
    }

    const matches: SuggestionItem[] = [];
    const seenLabels = new Set<string>();

    // 1. Cerca prima tra gli Spot salvati nel DB
    for (const spot of this.spots) {
      const city = (spot as any).city || (spot as any).location || '';

      if (spot.title && spot.title.toLowerCase().includes(query) && !seenLabels.has(spot.title)) {
        seenLabels.add(spot.title);
        matches.push({ label: spot.title, spot, type: 'spot' });
      }

      if (city && city.toLowerCase().includes(query) && !seenLabels.has(city)) {
        seenLabels.add(city);
        matches.push({ label: city, spot, type: 'spot' });
      }

      if (matches.length >= 4) break; // Limite spot locali
    }

    // 2. Aggiungi i risultati geografici da OpenStreetMap (Nominatim)
    for (const res of nominatimResults) {
      if (!seenLabels.has(res.display_name)) {
        seenLabels.add(res.display_name);
        matches.push({
          label: res.display_name,
          nominatim: res,
          type: 'location',
        });
      }
    }

    this.filteredSuggestions = matches;
    this.showSuggestions = this.filteredSuggestions.length > 0;
    this.cdr.markForCheck();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (!this.showSuggestions || this.filteredSuggestions.length === 0) {
      if (event.key === 'Enter') this.onSearch();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.selectedIndex = (this.selectedIndex + 1) % this.filteredSuggestions.length;
      this.cdr.markForCheck();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.selectedIndex =
        (this.selectedIndex - 1 + this.filteredSuggestions.length) %
        this.filteredSuggestions.length;
      this.cdr.markForCheck();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (this.selectedIndex >= 0 && this.selectedIndex < this.filteredSuggestions.length) {
        this.selectSuggestion(this.filteredSuggestions[this.selectedIndex]);
      } else {
        this.onSearch();
      }
    } else if (event.key === 'Escape') {
      this.showSuggestions = false;
      this.cdr.markForCheck();
    }
  }

  selectSuggestion(item: SuggestionItem): void {
    this.searchQuery = item.label;
    this.selectedSuggestion = item;
    this.showSuggestions = false;
    this.onSearch();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showSuggestions = false;
      this.cdr.markForCheck();
    }
  }

  onSearch(): void {
    this.showSuggestions = false;
    const query = this.searchQuery.trim();

    if (!query) {
      this.onOpenMap();
      return;
    }

    // 1. Se l'utente ha selezionato un suggerimento specifico
    if (this.selectedSuggestion) {
      if (this.selectedSuggestion.type === 'spot' && this.selectedSuggestion.spot) {
        this.navigateToSpotMap(this.selectedSuggestion.spot);
      } else if (this.selectedSuggestion.type === 'location' && this.selectedSuggestion.nominatim) {
        const nom = this.selectedSuggestion.nominatim;
        this.router.navigate(['/map'], {
          queryParams: { lat: nom.lat, lng: nom.lon, q: nom.display_name },
        });
      }
      return;
    }

    // 2. Fallback: cerca match esatto tra gli spot salvati
    const matchedSpot = this.spots.find(
      (s) =>
        s.title?.toLowerCase() === query.toLowerCase() ||
        ((s as any).city && (s as any).city.toLowerCase() === query.toLowerCase()) ||
        ((s as any).location && (s as any).location.toLowerCase() === query.toLowerCase()),
    );

    if (matchedSpot) {
      this.navigateToSpotMap(matchedSpot);
    } else {
      // 3. Fallback Generico: inoltra la stringa di testo pura alla mappa
      this.router.navigate(['/map'], { queryParams: { q: query } });
    }
  }

  private navigateToSpotMap(spot: Spot): void {
    const lat = spot.latitude ?? (spot as any).lat;
    const lng = spot.longitude ?? (spot as any).lng;

    if (lat !== undefined && lng !== undefined) {
      this.router.navigate(['/map'], { queryParams: { lat, lng, id: spot.id } });
    } else {
      this.router.navigate(['/map'], { queryParams: { id: spot.id } });
    }
  }

  onOpenMap(): void {
    this.router.navigate(['/map']);
  }

  onGoToDetail(spot: Spot, event?: Event): void {
    if (event) event.stopPropagation();
    if (this.isDragging) return;
    if (spot?.id) {
      this.router.navigate(['/spots', spot.id]);
    }
  }

  onOpenMapWithSpot(spot: Spot, event?: Event): void {
    if (event) event.stopPropagation();
    if (this.isDragging) return;
    this.navigateToSpotMap(spot);
  }

  get latestSpots(): Spot[] {
    return this.spots.slice(0, 10);
  }

  get toVisitSpots(): Spot[] {
    return this.spots.filter((s) => s.status === 'DA_VISITARE');
  }

  get visitedSpots(): Spot[] {
    return this.spots.filter((s) => s.status === 'VISITATO');
  }

  scrollCarousel(track: HTMLDivElement, direction: 'left' | 'right'): void {
    const scrollAmount = track.clientWidth * 0.75;
    track.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }

  startDragging(e: MouseEvent, track: HTMLDivElement): void {
    if (e.button !== 0) return;
    this.isMouseDown = true;
    this.isDragging = false;
    this.activeTrack = track;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.startX = e.pageX - track.offsetLeft;
    this.lastX = e.pageX;
    this.scrollLeft = track.scrollLeft;
    this.velocity = 0;
  }

  @HostListener('window:mousemove', ['$event'])
  onWindowMouseMove(e: MouseEvent): void {
    if (!this.isMouseDown || !this.activeTrack) return;

    const x = e.pageX - this.activeTrack.offsetLeft;
    const distanceMoved = Math.abs(x - this.startX);

    if (distanceMoved > 5) {
      this.isDragging = true;
      this.activeTrack.style.cursor = 'grabbing';
      e.preventDefault();

      const walk = (x - this.startX) * 1.2;
      this.velocity = e.pageX - this.lastX;
      this.lastX = e.pageX;

      this.activeTrack.scrollLeft = this.scrollLeft - walk;
    }
  }

  @HostListener('window:mouseup')
  onWindowMouseUp(): void {
    if (!this.isMouseDown || !this.activeTrack) return;

    this.isMouseDown = false;
    const track = this.activeTrack;
    track.style.cursor = 'grab';

    const applyInertia = () => {
      if (Math.abs(this.velocity) > 0.5) {
        track.scrollLeft -= this.velocity;
        this.velocity *= 0.92;
        this.animationFrameId = requestAnimationFrame(applyInertia);
      } else {
        this.activeTrack = null;
        setTimeout(() => {
          this.isDragging = false;
        }, 50);
      }
    };

    applyInertia();
  }
}
