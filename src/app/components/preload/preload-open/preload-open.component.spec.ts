import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreloadOpenComponent } from './preload-open.component';

describe('PreloadOpenComponent', () => {
  let component: PreloadOpenComponent;
  let fixture: ComponentFixture<PreloadOpenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreloadOpenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreloadOpenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
