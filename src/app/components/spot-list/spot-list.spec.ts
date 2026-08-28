import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpotList } from './spot-list';

describe('SpotList', () => {
  let component: SpotList;
  let fixture: ComponentFixture<SpotList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpotList],
    }).compileComponents();

    fixture = TestBed.createComponent(SpotList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
