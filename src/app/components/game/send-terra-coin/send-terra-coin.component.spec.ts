import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendTerraCoinComponent } from './send-terra-coin.component';

describe('SendTerraCoinComponent', () => {
  let component: SendTerraCoinComponent;
  let fixture: ComponentFixture<SendTerraCoinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SendTerraCoinComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SendTerraCoinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
