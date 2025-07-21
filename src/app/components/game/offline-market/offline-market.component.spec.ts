import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfflineMarketComponent } from './offline-market.component';

describe('OfflineMarketComponent', () => {
  let component: OfflineMarketComponent;
  let fixture: ComponentFixture<OfflineMarketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfflineMarketComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfflineMarketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
