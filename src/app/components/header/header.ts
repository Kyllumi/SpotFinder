import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent {
  @Output() createSpot = new EventEmitter<void>();
  @Output() search = new EventEmitter<string>();
  @Output() filterFavorites = new EventEmitter<void>();
  @Output() navigate = new EventEmitter<'home' | 'map'>();
  
  isMenuOpen = false;
  searchQuery = '';

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  onNavigate(view: 'home' | 'map'): void {
    this.navigate.emit(view);
    this.isMenuOpen = false;
  }

  onSearch(): void {
    this.search.emit(this.searchQuery);
  }

  onFavoritesClick(): void {
    this.filterFavorites.emit();
  }

  onNewSpotClick(): void {
    this.createSpot.emit();
  }
}