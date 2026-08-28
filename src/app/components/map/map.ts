import { Component, AfterViewInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { Spot, BoundingBox } from '../../models/spot.model';

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = defaultIcon;

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `<div id="map"></div>`,
  styles: [`
    #map { width: 100%; height: 100%; min-height: 400px; }
  `]
})
export class MapComponent implements AfterViewInit, OnChanges {
  private map!: L.Map;
  private markersGroup: L.LayerGroup = L.layerGroup();

  @Input() spots: Spot[] = [];
  @Input() selectedSpot: Spot | null = null;
  @Output() boundsChanged = new EventEmitter<BoundingBox>();
  @Output() mapClicked = new EventEmitter<{ lat: number, lng: number }>();
  @Output() spotSelected = new EventEmitter<Spot>();

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['spots'] && this.map) {
      this.updateMarkers();
    }
    if (changes['selectedSpot'] && this.selectedSpot && this.map) {
      this.map.flyTo([this.selectedSpot.latitude, this.selectedSpot.longitude], 14);
    }
  }

  private initMap(): void {
    this.map = L.map('map').setView([44.0678, 12.5695], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.markersGroup.addTo(this.map);

    this.map.on('moveend', () => this.emitBounds());
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.mapClicked.emit({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    setTimeout(() => {
      this.map.invalidateSize();
      this.emitBounds();
    }, 200);
  }

  private emitBounds(): void {
    const bounds = this.map.getBounds();
    this.boundsChanged.emit({
      minLat: bounds.getSouth(),
      maxLat: bounds.getNorth(),
      minLng: bounds.getWest(),
      maxLng: bounds.getEast()
    });
  }

  private updateMarkers(): void {
    this.markersGroup.clearLayers();
    this.spots.forEach(spot => {
      const marker = L.marker([spot.latitude, spot.longitude])
        .bindTooltip(`<b>${spot.title}</b>`);

      marker.on('click', () => this.spotSelected.emit(spot));
      this.markersGroup.addLayer(marker);
    });
  }
}