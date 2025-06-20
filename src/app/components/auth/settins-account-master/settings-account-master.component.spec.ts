import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsAccountMasterComponent } from './settings-account-master.component';

describe('SettinsAccountMasterComponent', () => {
  let component: SettingsAccountMasterComponent;
  let fixture: ComponentFixture<SettingsAccountMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsAccountMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsAccountMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
