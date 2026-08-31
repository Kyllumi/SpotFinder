import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Spot } from '../../models/spot.model';
import { HomeHeaderComponent } from './home-header/home-header';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, FormsModule, HomeHeaderComponent],
  templateUrl: './home-page.html',
  styleUrls: ['./home-page.css']
})
export class HomePageComponent {
  @Input() spots: Spot[] = [];
  @Output() navigate = new EventEmitter<string>();
  @Output() selectSpot = new EventEmitter<Spot>(); // Emette lo spot selezionato

  searchQuery = '';

  private isMouseDown = false;
  private startX = 0;
  private scrollLeft = 0;
  private velocity = 0;
  private lastX = 0;
  private animationFrameId: number | null = null;

  get latestSpots(): Spot[] {
    return this.spots.slice(0, 10);
  }

  get toVisitSpots(): Spot[] {
    return this.spots.filter(spot => !(spot as any).visited && !(spot as any).is_visited);
  }

  get visitedSpots(): Spot[] {
    return this.spots.filter(spot => (spot as any).visited || (spot as any).is_visited);
  }

  onSearch(): void {
    this.onOpenMap();
  }

  onOpenMap(): void {
    this.navigate.emit('map');
  }

  // APRI LA CARD DI DETTAGLIO DELLO SPOT
  onGoToSpot(spot: Spot): void {
    this.selectSpot.emit(spot);
    this.navigate.emit('spotDetail');
  }

  onNavigate(view: string): void {
    this.navigate.emit(view);
  }

  // SCROLL TRAMITE FRECCETTE
  scrollCarousel(track: HTMLDivElement, direction: 'left' | 'right'): void {
    const scrollAmount = 300;
    track.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  }

  // DRAG-TO-SCROLL CON INERZIA
  startDragging(e: MouseEvent, track: HTMLDivElement): void {
    this.isMouseDown = true;
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);

    this.startX = e.pageX - track.offsetLeft;
    this.lastX = e.pageX;
    this.scrollLeft = track.scrollLeft;
    this.velocity = 0;
    track.style.cursor = 'grabbing';
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
    e.preventDefault();

    const x = e.pageX - track.offsetLeft;
    const walk = (x - this.startX) * 1.5;

    this.velocity = e.pageX - this.lastX;
    this.lastX = e.pageX;

    track.scrollLeft = this.scrollLeft - walk;
  }
}