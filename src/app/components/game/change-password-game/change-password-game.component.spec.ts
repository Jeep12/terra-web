import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangePasswordGameComponent } from './change-password-game.component';

describe('ChangePasswordGameComponent', () => {
  let component: ChangePasswordGameComponent;
  let fixture: ComponentFixture<ChangePasswordGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangePasswordGameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangePasswordGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
