import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebsiteNotFoundComponent } from './website-not-found.component';

describe('WebsiteNotFoundComponent', () => {
  let component: WebsiteNotFoundComponent;
  let fixture: ComponentFixture<WebsiteNotFoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebsiteNotFoundComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebsiteNotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
