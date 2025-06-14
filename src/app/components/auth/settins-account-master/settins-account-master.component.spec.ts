import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettinsAccountMasterComponent } from './settins-account-master.component';

describe('SettinsAccountMasterComponent', () => {
  let component: SettinsAccountMasterComponent;
  let fixture: ComponentFixture<SettinsAccountMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettinsAccountMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettinsAccountMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
