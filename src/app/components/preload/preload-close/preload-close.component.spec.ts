import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreloadCloseComponent } from './preload-close.component';

describe('PreloadCloseComponent', () => {
  let component: PreloadCloseComponent;
  let fixture: ComponentFixture<PreloadCloseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreloadCloseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreloadCloseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
