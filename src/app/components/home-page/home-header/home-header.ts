import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-header.html',
  styleUrl: './home-header.css'
})
export class HomeHeaderComponent {
  @Output() navigate = new EventEmitter<'home' | 'map'>();
  
  isMenuOpen = false;

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  onNavigate(view: 'home' | 'map'): void {
    this.navigate.emit(view);
    this.isMenuOpen = false;
  }
}