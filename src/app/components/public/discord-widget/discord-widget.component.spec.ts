import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscordWidgetComponent } from './discord-widget.component';

describe('DiscordWidgetComponent', () => {
  let component: DiscordWidgetComponent;
  let fixture: ComponentFixture<DiscordWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscordWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscordWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
