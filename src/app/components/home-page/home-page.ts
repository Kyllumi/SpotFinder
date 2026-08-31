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
  styleUrl: './home-page.css'
})
export class HomePageComponent {
  @Input() spots: Spot[] = [];
  @Output() navigate = new EventEmitter<'home' | 'map'>();

  searchQuery = '';

  get latestSpots(): Spot[] {
    return [...this.spots].reverse().slice(0, 6);
  }

  get toVisitSpots(): Spot[] {
    return this.spots.filter(s => s.status?.toUpperCase().includes('VISIT') && !s.status?.toUpperCase().includes('VISITED'));
  }

  get visitedSpots(): Spot[] {
    return this.spots.filter(s => s.status?.toUpperCase().includes('VISITED'));
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.navigate.emit('map');
    }
  }

  onOpenMap(): void {
    this.navigate.emit('map');
  }

  onNavigate(view: 'home' | 'map'): void {
    this.navigate.emit(view);
  }
}