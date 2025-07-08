import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KickPlatformLiveComponent } from './kick-platform-live.component';

describe('KickPlatformLiveComponent', () => {
  let component: KickPlatformLiveComponent;
  let fixture: ComponentFixture<KickPlatformLiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KickPlatformLiveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KickPlatformLiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
