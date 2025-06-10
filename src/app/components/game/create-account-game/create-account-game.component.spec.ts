import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAccountGameComponent } from './create-account-game.component';

describe('CreateAccountGameComponent', () => {
  let component: CreateAccountGameComponent;
  let fixture: ComponentFixture<CreateAccountGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateAccountGameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateAccountGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
