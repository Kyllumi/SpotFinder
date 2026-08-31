import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UiStateService {
  private openFormSubject = new Subject<void>();
  openForm$ = this.openFormSubject.asObservable();

  triggerOpenForm(): void {
    this.openFormSubject.next();
  }
}