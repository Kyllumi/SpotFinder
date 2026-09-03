import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UpdateSpot } from './update-spot';

describe('UpdateSpot', () => {
  let component: UpdateSpot;
  let fixture: ComponentFixture<UpdateSpot>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateSpot],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateSpot);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
