import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyTerraCoinComponent } from './buy-terra-coin.component';

describe('BuyTerraCoinComponent', () => {
  let component: BuyTerraCoinComponent;
  let fixture: ComponentFixture<BuyTerraCoinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuyTerraCoinComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuyTerraCoinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
