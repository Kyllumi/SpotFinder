import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpotDetail } from './spot-detail';

describe('SpotDetail', () => {
  let component: SpotDetail;
  let fixture: ComponentFixture<SpotDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpotDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(SpotDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
