import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BotterraComponent } from './botterra.component';

describe('BotterraComponent', () => {
  let component: BotterraComponent;
  let fixture: ComponentFixture<BotterraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BotterraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BotterraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
