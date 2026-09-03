import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { UiStateService } from '../../services/ui-state';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent implements OnInit {
  searchQuery = '';
  isMenuOpen = false;
  isMapPage = false;

  constructor(
    private router: Router,
    private location: Location,
    private uiStateService: UiStateService
  ) {}

  ngOnInit(): void {
    // 1. Legge il percorso reale direttamente dal browser al refresh
    this.checkCurrentRoute(this.location.path());

    // 2. Continua ad ascoltare la navigazione interna di Angular
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.checkCurrentRoute(event.urlAfterRedirects);
      });
  }

  private checkCurrentRoute(url: string): void {
    // Normalizza e controlla se il percorso contiene /map
    this.isMapPage = url.startsWith('/map');
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  onNavigate(routePath: string): void {
    this.isMenuOpen = false;
    this.router.navigate([`/${routePath}`]);
  }

  onNewSpotClick(): void {
    if (this.isMapPage) {
      this.uiStateService.triggerOpenForm();
    } else {
      this.router.navigate(['/map']).then(() => {
        this.uiStateService.triggerOpenForm();
      });
    }
  }

  onFavoritesClick(): void {
    // Logica preferiti
  }

  onSearch(): void {
    // Logica ricerca
  }
}