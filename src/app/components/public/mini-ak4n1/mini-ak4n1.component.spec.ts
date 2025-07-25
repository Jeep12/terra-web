import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniAk4n1Component } from './mini-ak4n1.component';

describe('MiniAk4n1Component', () => {
  let component: MiniAk4n1Component;
  let fixture: ComponentFixture<MiniAk4n1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiniAk4n1Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiniAk4n1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
