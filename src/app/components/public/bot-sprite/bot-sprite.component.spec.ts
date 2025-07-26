import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BotSpriteComponent } from './bot-sprite.component';

describe('BotSpriteComponent', () => {
  let component: BotSpriteComponent;
  let fixture: ComponentFixture<BotSpriteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BotSpriteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BotSpriteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
