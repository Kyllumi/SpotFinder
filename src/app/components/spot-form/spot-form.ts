import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Spot, Service, SpotImage } from '../../models/spot.model';

export interface SpotImagePreview {
  id?: number;
  file_path: string;
  previewUrl?: string;
  uploadedAt?: string;
}

@Component({
  selector: 'app-spot-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './spot-form.html',
  styleUrl: './spot-form.css',
})
export class SpotFormComponent implements OnInit, OnChanges {
  @Input() spotToEdit: Spot | null = null;
  @Input() initialCoords: { lat: number; lng: number } | null = null;
  @Input() availableServices: Service[] = [];

  @Output() save = new EventEmitter<{ dto: any }>();
  @Output() cancel = new EventEmitter<void>();

  spotForm!: FormGroup;
  isEditMode = false;

  selectedServices: Service[] = [];
  images: SpotImagePreview[] = [];
  draggedIndex: number | null = null;

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.spotForm) {
      if (changes['spotToEdit'] && this.spotToEdit) {
        this.isEditMode = true;
        this.spotForm.patchValue(this.spotToEdit);

        const anySpot = this.spotToEdit as any;

        if (anySpot.spot_images) {
          this.images = anySpot.spot_images.map((img: any) => ({
            id: img.id,
            file_path: img.file_path,
            previewUrl: img.file_path,
            uploadedAt: img.uploaded_at || img.uploadedAt,
          }));
        }

        if (anySpot.services) {
          this.selectedServices = anySpot.services.map((s: any) => ({
            id: s.id,
            name: s.name,
            iconCode: s.icon_code || s.iconCode,
            icon_code: s.icon_code || s.iconCode,
          }));
        }
      } else if (changes['initialCoords'] && this.initialCoords && !this.isEditMode) {
        this.spotForm.patchValue({
          latitude: this.initialCoords.lat,
          longitude: this.initialCoords.lng,
        });
      }
    }
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

  // Generazione URL Placeholder tramite LoremFlickr
  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach(() => {
        // Genera un lock casuale per evitare che il browser prenda l'immagine in cache e per avere foto diverse
        const randomLock = Math.floor(Math.random() * 10000) + 1;
        
        // URL di LoremFlickr 600x400 a tema natura/paesaggi
        const placeholderUrl = `https://loremflickr.com/1280/720/nature?lock=${randomLock}`;

        this.images.push({
          file_path: placeholderUrl,
          previewUrl: placeholderUrl,
          uploadedAt: new Date().toISOString(),
        });
      });

      // Reset dell'input file per consentire nuove selezioni
      input.value = '';

      // Forza l'aggiornamento immediato della vista in Angular
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
  }

  onSubmit(): void {
    if (this.spotForm.invalid) return;

    const formVal = this.spotForm.value;
    const todayLocalDate = new Date().toISOString().split('T')[0];

    const mappedServices = this.selectedServices.map((s) => ({
      id: Number(s.id),
      name: s.name,
      icon_code: s.icon_code || s.iconCode || null,
    }));

    const mappedImages: SpotImage[] = this.images.map((img: any) => {
      const imgObj: SpotImage = {
        file_path: img.file_path,
        uploaded_at: img.uploaded_at || img.uploadedAt || todayLocalDate,
      };
      if (img.id) imgObj.id = img.id;
      return imgObj;
    });

    const payload: any = {
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

    if (this.isEditMode && this.spotToEdit?.id) {
      payload.id = this.spotToEdit.id;
    }

    this.save.emit({ dto: payload });
  }
}