import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SpotService } from '../../services/spot';
import { Spot } from '../../models/spot.model';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-spot-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './spot-detail.html',
  styleUrl: './spot-detail.css',
})
export class SpotDetailComponent implements OnInit {
  spot: Spot | null = null;
  loading: boolean = true;
  error: boolean = false;

  // Gestione Carosello Foto e Lightbox
  currentImageIndex: number = 0;
  isLightboxOpen: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private spotService: SpotService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const idParam = params.get('id');

          if (!idParam) {
            this.goBack();
            return of(null);
          }

          this.loading = true;
          this.error = false;
          this.spot = null;
          this.currentImageIndex = 0;
          this.cdr.detectChanges();

          return this.spotService.getSpotById(Number(idParam)).pipe(
            catchError((err) => {
              console.error('Errore nel recupero dello spot:', err);
              this.error = true;
              this.loading = false;
              this.cdr.detectChanges();
              return of(null);
            }),
          );
        }),
      )
      .subscribe((data) => {
        if (data) {
          this.spot = data;
          this.loading = false;
          this.error = false;
          this.currentImageIndex = 0;
          this.cdr.detectChanges();
        }
      });
  }

  // CONTROLLI CAROSELLO FOTO
  nextImage(event?: Event): void {
    if (event) event.stopPropagation();
    if (this.spot?.spot_images?.length) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.spot.spot_images.length;
      this.cdr.detectChanges();
    }
  }

  prevImage(event?: Event): void {
    if (event) event.stopPropagation();
    if (this.spot?.spot_images?.length) {
      this.currentImageIndex =
        (this.currentImageIndex - 1 + this.spot.spot_images.length) % this.spot.spot_images.length;
      this.cdr.detectChanges();
    }
  }

  setImageIndex(index: number, event?: Event): void {
    if (event) event.stopPropagation();
    this.currentImageIndex = index;
    this.cdr.detectChanges();
  }

  openLightbox(index: number): void {
    this.currentImageIndex = index;
    this.isLightboxOpen = true;
    this.cdr.detectChanges();
  }

  closeLightbox(): void {
    this.isLightboxOpen = false;
    this.cdr.detectChanges();
  }

  getStatusClass(status?: string): string {
    if (!status) return 'default';
    return status.toLowerCase().replace(/_/g, '-');
  }

  getStatusLabel(status?: string): string {
    if (!status) return '';
    return status.replace(/_/g, ' ').toLowerCase();
  }

  onDelete(): void {
    if (this.spot && confirm('Sei sicuro di voler eliminare questo spot?')) {
      this.spotService.deleteSpot(this.spot.id).subscribe({
        next: () => this.goBack(),
        error: (err) => console.error('Errore durante eliminazione:', err),
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/map']);
  }
}
