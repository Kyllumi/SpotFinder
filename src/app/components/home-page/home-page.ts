import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Spot } from '../../models/spot.model';
import { SpotService } from '../../services/spot';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home-page.html',
  styleUrls: ['./home-page.css'],
})
export class HomePageComponent implements OnInit {
  private spotService = inject(SpotService);
  private router = inject(Router);

  spots: Spot[] = [];
  searchQuery = '';

  // Stato di caricamento
  isLoading = true;

  // Array fittizio per generare 4 card skeleton di placeholder
  skeletonCards = Array(4).fill(0);

  private isMouseDown = false;
  private isDragging = false;
  private startX = 0;
  private scrollLeft = 0;
  private velocity = 0;
  private lastX = 0;
  private animationFrameId: number | null = null;

  ngOnInit(): void {
    this.isLoading = true;
    this.spotService.getAllSpots().subscribe({
      next: (data) => {
        this.spots = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Errore nel caricamento degli spot:', err);
        this.isLoading = false;
      },
    });
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/map'], { queryParams: { q: this.searchQuery.trim() } });
    } else {
      this.onOpenMap();
    }
  }

  onOpenMap(): void {
    this.router.navigate(['/map']);
  }

  onGoToSpot(spot: Spot, event?: Event): void {
    if (event) {
      event.stopPropagation(); // Evita conflitti di bolla d'evento se necessario
    }
    this.router.navigate(['/spots', spot.id]);
  }

  // Navigazione alla vista di dettaglio dello spot
  onGoToDetail(spot: Spot): void {
    this.router.navigate(['/spots', spot.id]);
  }

  // Navigazione alla mappa centrata e con lo zoom sullo spot selezionato
  onOpenMapWithSpot(spot: Spot, event?: Event): void {
    if (event) {
      event.stopPropagation(); // Evita la propagazione se il click è dentro una card cliccabile
    }

    // Estrae le coordinate in modo sicuro
    const lat = spot.latitude ?? (spot as any).lat;
    const lng = spot.longitude ?? (spot as any).lng;

    if (lat !== undefined && lng !== undefined) {
      this.router.navigate(['/map'], {
        queryParams: {
          lat: lat,
          lng: lng,
          id: spot.id,
        },
      });
    } else {
      // Fallback se le coordinate non sono disponibili
      this.router.navigate(['/map'], { queryParams: { id: spot.id } });
    }
  }

  get safeSpots(): Spot[] {
    return Array.isArray(this.spots) ? this.spots : [];
  }

  get latestSpots(): Spot[] {
    return this.safeSpots.slice(0, 10);
  }

  get toVisitSpots(): Spot[] {
    return this.safeSpots.filter((spot) => spot.status === 'DA_VISITARE');
  }

  get visitedSpots(): Spot[] {
    return this.safeSpots.filter((spot) => spot.status === 'VISITATO');
  }

  scrollCarousel(track: HTMLDivElement, direction: 'left' | 'right'): void {
    const scrollAmount = 300;
    track.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }

  startDragging(e: MouseEvent, track: HTMLDivElement): void {
    this.isMouseDown = true;
    this.isDragging = false;
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);

    this.startX = e.pageX - track.offsetLeft;
    this.lastX = e.pageX;
    this.scrollLeft = track.scrollLeft;
    this.velocity = 0;
  }

  stopDragging(track: HTMLDivElement): void {
    if (!this.isMouseDown) return;
    this.isMouseDown = false;
    track.style.cursor = 'grab';

    const applyInertia = () => {
      if (Math.abs(this.velocity) > 0.5) {
        track.scrollLeft -= this.velocity;
        this.velocity *= 0.93;
        this.animationFrameId = requestAnimationFrame(applyInertia);
      }
    };
    applyInertia();
  }

  moveDragging(e: MouseEvent, track: HTMLDivElement): void {
    if (!this.isMouseDown) return;

    const x = e.pageX - track.offsetLeft;
    const distanceMoved = Math.abs(x - this.startX);

    if (distanceMoved > 5) {
      this.isDragging = true;
      track.style.cursor = 'grabbing';
      e.preventDefault();

      const walk = (x - this.startX) * 1.5;
      this.velocity = e.pageX - this.lastX;
      this.lastX = e.pageX;

      track.scrollLeft = this.scrollLeft - walk;
    }
  }
}
