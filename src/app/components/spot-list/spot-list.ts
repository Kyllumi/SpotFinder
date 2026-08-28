import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Spot } from '../../models/spot.model';

@Component({
  selector: 'app-spot-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spot-list.html',
  styleUrl: './spot-list.css',
})
export class SpotListComponent {
  @Input() spots: Spot[] = [];
  @Input() selectedSpotId: number | null = null;
  @Output() spotSelected = new EventEmitter<Spot>();
}