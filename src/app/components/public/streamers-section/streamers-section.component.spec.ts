import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamersSectionComponent } from './streamers-section.component';

describe('StreamersSectionComponent', () => {
  let component: StreamersSectionComponent;
  let fixture: ComponentFixture<StreamersSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreamersSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StreamersSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
