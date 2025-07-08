import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MagicCrystalComponent } from './magic-crystal.component';

describe('MagicCrystalComponent', () => {
  let component: MagicCrystalComponent;
  let fixture: ComponentFixture<MagicCrystalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagicCrystalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MagicCrystalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
