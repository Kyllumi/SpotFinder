import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Spot } from '../../models/spot.model';

@Component({
  selector: 'app-spot-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spot-detail.html',
  styleUrl: './spot-detail.css',
})
export class SpotDetailComponent {
  @Input() spot: Spot | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Spot>();
  @Output() delete = new EventEmitter<number>();

  readonly maxStars = [1, 2, 3, 4, 5];
}
