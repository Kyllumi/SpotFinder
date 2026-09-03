import { Routes } from '@angular/router';
import { HomePageComponent } from './components/home-page/home-page';
import { MapViewComponent } from './components/map-view/map-view';
import { SpotDetailComponent } from './components/spot-detail/spot-detail';
import { SpotFormComponent } from './components/spot-form/spot-form';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'map', component: MapViewComponent },
  { path: 'spots/new', component: SpotFormComponent },
  { path: 'spots/:id', component: SpotDetailComponent },
  { path: 'spots/:id/edit', component: SpotFormComponent },
  { path: '**', redirectTo: '' },
];
