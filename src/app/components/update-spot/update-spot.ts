import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Importiamo il Model delle Categorie
import {
  Spot,
  Service,
  SpotImage,
  SpotCategory,
  SPOT_CATEGORY_LABELS,
} from '../../models/spot.model';
import { SpotService } from '../../services/spot';
import { ServiceService } from '../../services/service';

export interface SpotImagePreview {
  id?: number;
  file_path: string;
  previewUrl?: string;
  uploadedAt?: string;
}

@Component({
  selector: 'app-update-spot',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-spot.html',
  styleUrl: './update-spot.css',
})
export class UpdateSpotComponent implements OnInit {
  spotForm!: FormGroup;
  spotId: number | null = null;
  spotToEdit: Spot | null = null;

  loading: boolean = true;
  error: boolean = false;

  availableServices: Service[] = [];
  selectedServices: Service[] = [];
  images: SpotImagePreview[] = [];
  draggedIndex: number | null = null;

  // Generiamo l'elenco delle categorie dinamicamente dal Model
  categories = Object.keys(SpotCategory).map((key) => ({
    value: key,
    label: SPOT_CATEGORY_LABELS[key as SpotCategory] || key,
  }));

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private spotService: SpotService,
    private serviceService: ServiceService,
    private cdr: ChangeDetectorRef,
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.goBackToDetail();
      return;
    }

    this.spotId = Number(idParam);
    this.loadData(this.spotId);
  }

  private initForm(): void {
    this.spotForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      latitude: [null, Validators.required],
      longitude: [null, Validators.required],
      rating: [5],
      category: ['PESCA', Validators.required],
      status: ['DA_VISITARE', Validators.required],
    });
  }

  private loadData(id: number): void {
    this.loading = true;
    this.error = false;

    forkJoin({
      spot: this.spotService.getSpotById(id).pipe(
        catchError((err) => {
          console.error('Errore durante il recupero dello spot:', err);
          return of(null);
        }),
      ),
      services: this.serviceService.getAllServices().pipe(
        catchError((err) => {
          console.error('Errore durante il recupero dei servizi:', err);
          return of([]);
        }),
      ),
    }).subscribe({
      next: (result) => {
        if (!result.spot) {
          this.error = true;
        } else {
          this.spotToEdit = result.spot;
          this.availableServices = result.services;
          this.populateForm(result.spot);
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = true;
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private populateForm(spot: Spot): void {
    this.spotForm.patchValue({
      title: spot.title,
      description: spot.description || '',
      latitude: spot.latitude,
      longitude: spot.longitude,
      rating: spot.rating || 5,
      category: spot.category,
      status: spot.status,
    });

    const anySpot = spot as any;

    // Lettura flessibile delle immagini per assicurare l'anteprima
    const rawImages = anySpot.spot_images || anySpot.spotImages || anySpot.images || [];

    if (Array.isArray(rawImages)) {
      this.images = rawImages.map((img: any) => {
        const path = img.file_path || img.filePath || img.url || img.path || '';
        return {
          id: img.id,
          file_path: path,
          previewUrl: path,
          uploadedAt: img.uploaded_at || img.uploadedAt || new Date().toISOString(),
        };
      });
    }

    if (anySpot.services && Array.isArray(anySpot.services)) {
      this.selectedServices = anySpot.services.map((s: any) => ({
        id: s.id,
        name: s.name,
        iconCode: s.icon_code || s.iconCode,
        icon_code: s.icon_code || s.iconCode,
      }));
    }

    this.cdr.detectChanges();
  }

  setRating(star: number): void {
    this.spotForm.patchValue({ rating: star });
  }

  addServiceFromSelect(selectElement: HTMLSelectElement): void {
    const selectedId = Number(selectElement.value);
    if (!selectedId) return;

    const foundService = this.availableServices.find((s) => s.id === selectedId);
    if (foundService && !this.selectedServices.some((s) => s.id === foundService.id)) {
      this.selectedServices.push({ ...foundService });
    }

    selectElement.value = '';
  }

  removeService(index: number): void {
    this.selectedServices.splice(index, 1);
  }

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach(() => {
        const randomLock = Math.floor(Math.random() * 10000) + 1;
        const placeholderUrl = `https://loremflickr.com/1280/720/nature?lock=${randomLock}`;

        this.images.push({
          file_path: placeholderUrl,
          previewUrl: placeholderUrl,
          uploadedAt: new Date().toISOString(),
        });
      });

      input.value = '';
      this.cdr.detectChanges();
    }
  }

  removeImage(index: number): void {
    this.images.splice(index, 1);
  }

  onDragStart(index: number): void {
    this.draggedIndex = index;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(targetIndex: number): void {
    if (this.draggedIndex !== null && this.draggedIndex !== targetIndex) {
      const movedItem = this.images.splice(this.draggedIndex, 1)[0];
      this.images.splice(targetIndex, 0, movedItem);
    }
    this.draggedIndex = null;
    this.cdr.detectChanges();
  }

  onSubmit(): void {
    if (this.spotForm.invalid || !this.spotId) return;

    this.loading = true;
    const formVal = this.spotForm.value;
    const todayLocalDate = new Date().toISOString().split('T')[0];

    const mappedServices = this.selectedServices.map((s) => ({
      id: Number(s.id),
      name: s.name,
      icon_code: s.icon_code || s.iconCode || null,
    }));

    // 1. Estraiamo la lista degli ID preesistenti ordinati in modo crescente
    const existingIds = this.images
      .map((img: any) => img.id)
      .filter((id) => id !== undefined && id !== null)
      .sort((a, b) => a - b);

    let existingIdIndex = 0;

    // 2. Assegniamo agli elementi riordinati gli ID in sequenza crescente
    // In questo modo l'immagine che hai messo al #1 riceverà l'ID più basso (es. 39)
    const mappedImages: SpotImage[] = this.images.map((img: any) => {
      const imgObj: any = {
        file_path: img.file_path,
        uploaded_at: img.uploadedAt || img.uploaded_at || todayLocalDate,
      };

      if (img.id) {
        // Assegniamo gli ID in ordine crescente alla nuova sequenza trascinata
        imgObj.id = existingIds[existingIdIndex];
        existingIdIndex++;
      }

      return imgObj;
    });

    const payload: any = {
      id: this.spotId,
      title: formVal.title,
      description: formVal.description || '',
      latitude: Number(formVal.latitude),
      longitude: Number(formVal.longitude),
      rating: Number(formVal.rating || 5),
      category: formVal.category,
      status: formVal.status,
      visited_at: formVal.visited_at ? formVal.visited_at : todayLocalDate,
      created_at: formVal.created_at ? formVal.created_at : todayLocalDate,
      services: mappedServices,
      spot_images: mappedImages,
    };

    this.spotService.updateSpot(this.spotId, payload).subscribe({
      next: () => {
        this.loading = false;
        this.goBackToDetail();
      },
      error: (err) => {
        console.error("Errore durante l'aggiornamento dello spot:", err);
        alert('Si è verificato un errore durante il salvataggio.');
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  goBackToDetail(): void {
    if (this.spotId) {
      this.router.navigate(['/spots', this.spotId]);
    } else {
      this.router.navigate(['/map']);
    }
  }
}
