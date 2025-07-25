import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpriteBotComponent } from './sprite-bot.component';

describe('SpriteBotComponent', () => {
  let component: SpriteBotComponent;
  let fixture: ComponentFixture<SpriteBotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpriteBotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpriteBotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
