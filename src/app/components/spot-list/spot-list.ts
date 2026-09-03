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

  // Evento 1: Click sulla card -> Centra il marker sulla mappa
  @Output() spotSelected = new EventEmitter<Spot>();

  // Evento 2: Click sul bottone "Dettaglio" -> Naviga alla pagina di dettaglio
  @Output() viewDetail = new EventEmitter<Spot>();

  // Gestione del click sulla card intera
  onCardClick(spot: Spot): void {
    this.spotSelected.emit(spot);
  }

  // Gestione del click sul bottone Dettaglio
  onDetailClick(event: MouseEvent, spot: Spot): void {
    // FONDAMENTALE: Interrompe la propagazione per evitare di scatenare anche onCardClick
    event.stopPropagation();
    this.viewDetail.emit(spot);
  }
}
