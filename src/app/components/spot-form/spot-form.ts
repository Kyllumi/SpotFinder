import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Spot, SpotDTO } from '../../models/spot.model';

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
  @Output() save = new EventEmitter<{ dto: SpotDTO }>();
  @Output() cancel = new EventEmitter<void>();

  spotForm!: FormGroup;
  isEditMode = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.spotForm) {
      if (changes['spotToEdit'] && this.spotToEdit) {
        this.isEditMode = true;
        this.spotForm.patchValue(this.spotToEdit);
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

  onSubmit(): void {
    if (this.spotForm.valid) {
      const dto: SpotDTO = {
        ...this.spotForm.value,
        id: this.spotToEdit ? this.spotToEdit.id : undefined,
        serviceIds: [],
      };
      this.save.emit({ dto });
    }
  }
}
