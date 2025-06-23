import { Component, type OnInit } from "@angular/core";
import { FormBuilder, type FormGroup, Validators, ReactiveFormsModule, FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import type { AccountMaster } from "../../../models/master.account.model";
import { AuthService } from "../../../services/auth.service";
import { Observable } from "rxjs";
import { RecentActivity } from "../../../models/recent.activity.model";
import { TrustedDeviceDTO } from "../../../models/trusted.device.model";
import { Router } from "@angular/router";
declare var bootstrap: any;

@Component({
  selector: "app-settings-account-master",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './settings-account-master.component.html',
  styleUrls: ['./settings-account-master.component.css'],

})
export class SettingsAccountMasterComponent implements OnInit {

  accountMaster: AccountMaster | undefined;
  pendingLogout = false;

  // Forms
  accountForm: FormGroup;

  passwordForm: FormGroup;
  currentPasswordVisible = false;
  newPasswordVisible = false;
  confirmPasswordVisible = false;

  securityForm: FormGroup;
  successTitle = '';
  successMessage = '';

  notificationForm: FormGroup;

  lastLoginDate: Date | null = null;

  originalTrustedDevices: TrustedDeviceDTO[] = [];
  filteredTrustedDevices: TrustedDeviceDTO[] = [];
  deviceSortOrder: 'asc' | 'desc' = 'desc';
  deviceFilterOptions: string[] = ['all']; // Inicializado con 'all'
  selectedDeviceFilter: string = 'all';
  showTrustedDevices = false;
  removeDeviceObj: any;
  removeDeviceSuccess = false;
  // Loading states
  isLoadingAccount = false;
  isLoadingPassword = false;
  isLoadingSecurity = false;

  // Recent activities mock data
  recentActivities: any;
  filteredActivities: RecentActivity[] = [];
  uniqueActions: string[] = [];
  selectedAction: string = '';
  dateSortOrder: 'asc' | 'desc' = 'desc';

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.accountForm = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
      terraCoins: [{ value: 0, disabled: true }],
    });

    this.passwordForm = this.formBuilder.group(
      {
        currentPassword: ["", [Validators.required]],
        newPassword: ["", [Validators.required, Validators.minLength(8)]],
        confirmPassword: ["", [Validators.required]],
      },
      { validators: this.passwordMatchValidator },
    );

    this.securityForm = this.formBuilder.group({
      twoFactorEnabled: [false],
      emailNotifications: [true],
      smsNotifications: [false],
    });

    this.notificationForm = this.formBuilder.group({
      emailNotifications: [true],
      pushNotifications: [true],
      marketingEmails: [false],
      securityAlerts: [true],
    });

  }

  ngOnInit() {



    this.loadAccountData();

    this.loadRecentActivities();

    this.loadTrustedDevices();

  }




  private loadRecentActivities() {
    this.authService.recentActivity().subscribe(
      activities => {
        try {

          // Asegurar que sea un array y añadir propiedad showIp
          this.recentActivities = (Array.isArray(activities) ? activities : [activities]).map(activity => ({
            ...activity,
            showIp: false, // Inicialmente ocultas
            ipAddress: activity.ipAddress || activity.ip || 'N/A' // Manejo seguro de la propiedad IP
          }));

          this.filteredActivities = [...this.recentActivities];
          this.lastLoginDate = this.getPreviousLogin(this.recentActivities);
          this.extractUniqueActions();
          this.sortActivities();
        } catch (error) {
          console.error('Error procesando actividades:', error);
        }
      },
      err => {
        console.error('Error en la petición:', err);
      }
    );
  }



  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get("newPassword");
    const confirmPassword = form.get("confirmPassword");

    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  private loadAccountData() {
    this.authService.getCurrentUser().subscribe((accountMaster) => {
      this.accountMaster = accountMaster;
      if (accountMaster) {
        this.accountForm.patchValue({
          email: accountMaster.email,
          terraCoins: accountMaster.terraCoins || 0
        });
        this.securityForm.patchValue({
          twoFactorEnabled: accountMaster.twoFactorEnabled
        });
      }
    });
  }


  onUpdateAccount() {
    if (this.accountForm.valid) {
      this.isLoadingAccount = true;

      const formData = this.accountForm.value;

      // Simulate API call
      setTimeout(() => {
        this.isLoadingAccount = false;
        // Show success message
      }, 1500);
    }
  }

  onChangePassword() {
    if (this.passwordForm.valid) {
      this.isLoadingPassword = true;

      const formData = this.passwordForm.value;

      // Simulate API call
      setTimeout(() => {
        this.passwordForm.reset();
        this.isLoadingPassword = false;
        // Show success message
      }, 1500);
    }
  }


  onUpdateSecurity() {
    this.isLoadingSecurity = true;

    const twoFAEnabled = this.securityForm.get('twoFactorEnabled')?.value;
    const currentlyEnabled = this.accountMaster?.twoFactorEnabled;

    this.authService.toggle2FA(twoFAEnabled).subscribe({
      next: (res: { message?: string } | string) => {
        this.successTitle = 'Two-Factor Updated!';
        this.successMessage = typeof res === 'string' ? res : res?.message ?? 'Two-Factor setting updated successfully.';

        this.pendingLogout = twoFAEnabled && !currentlyEnabled;

        this.showSuccessModal();

        this.isLoadingSecurity = false;
      },
      error: (err) => {
        this.successTitle = 'Two-Factor Not Updated';
        this.successMessage = err.error?.message ?? '2FA is already set or an error occurred.';

        this.pendingLogout = false; // no logout en error, o poné true si querés logout acá también

        this.showSuccessModal();

        this.isLoadingSecurity = false;
      }
    });
  }

  private handleModalClose = () => {
    if (this.pendingLogout) {
      this.authService.logout().subscribe({
        next: () => this.router.navigate(['/login']),
        error: err => console.error(err)
      });
    }
  }

  private showSuccessModal() {
    const modalElement = document.getElementById('successModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);

      // Quitar listener anterior si existiera para evitar duplicados
      modalElement.removeEventListener('hidden.bs.modal', this.handleModalClose);
      modalElement.addEventListener('hidden.bs.modal', this.handleModalClose);

      modal.show();
    }
  }


  onUpdateNotifications() {
    const formData = this.notificationForm.value;
  }


  onConfirmDeactivate() {

    if (this.accountMaster) {
      const newStatus = !this.accountMaster.enabled;
      alert("function in development")
    }


  }
  onToggleAccountStatus() {
    const modalElement = document.getElementById('confirmModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }

  onManageDevices() {
    this.showTrustedDevices = !this.showTrustedDevices;
  }

  getStatusText(): string {
    return this.accountMaster?.enabled ? "Active" : "Inactive";
  }

  getStatusClass(): string {
    return this.accountMaster?.enabled ? "status-active" : "status-inactive";
  }


  getPreviousLogin(activities: RecentActivity[]): Date | null {
    const logins = activities
      .filter(a => a.action.toLowerCase() === 'login')
      .map(a => new Date(a.timestamp))
      .sort((a, b) => b.getTime() - a.getTime()); // orden descendente

    if (logins.length < 2) return null; // no hay login anterior

    return logins[1]; // el segundo más nuevo, o sea el anterior
  }

  getDeviceIconClass(userAgent: string): string {
    if (!userAgent) return 'fa-solid fa-question';

    if (userAgent.includes('Android') || userAgent.includes('iPhone')) return 'fa-solid fa-mobile-screen';
    if (userAgent.includes('Chrome') || userAgent.includes('Firefox') || userAgent.includes('Safari') || userAgent.includes('Browser')) return 'fa-solid fa-globe';
    return 'fa-solid fa-desktop';
  }

  removeDeviceModal(deviceId: string) {
    for (let i = 0; i < this.originalTrustedDevices.length; i++) {
      if (this.originalTrustedDevices[i].deviceId == deviceId) {
        this.removeDeviceObj = this.originalTrustedDevices[i];
      }
    }
    const modalElement = document.getElementById('confirmDeleteDevice');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }

  removeTrustedDevice(deviceIdObj: string) {
    this.authService.removeTrustedDevice(deviceIdObj).subscribe({
      next: (res) => {
        this.removeDeviceSuccess = true;
        this.loadTrustedDevices();

      },
      error: (err) => {
        this.removeDeviceSuccess = false;

      }
    });
  }


  toggleCurrentPasswordVisibility() {
    this.currentPasswordVisible = !this.currentPasswordVisible;
  }

  toggleNewPasswordVisibility() {
    this.newPasswordVisible = !this.newPasswordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }



  // Add this to your component class
  get filteredRoles(): string[] {
    return this.accountMaster?.roles?.filter(r => r !== 'ROLE_USER') || [];
  }

  hasStreamerRole(): boolean {
    return this.accountMaster?.roles?.includes('ROLE_STREAMER') || false;
  }
  private extractUniqueActions(): void {
    const actions = new Set<string>();
    this.recentActivities.forEach((activity: { action: string; }) => actions.add(activity.action));
    this.uniqueActions = Array.from(actions).sort();
  }

  filterActivities(): void {
    if (!this.selectedAction) {
      this.filteredActivities = [...this.recentActivities];
    } else {
      this.filteredActivities = this.recentActivities.filter(
        (activity: { action: string; }) => activity.action === this.selectedAction
      );
    }
    this.sortActivities();
  }

  sortActivities(): void {
    this.filteredActivities.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return this.dateSortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }

  // Método para alternar visibilidad
  toggleIpVisibility(activity: RecentActivity): void {
    activity.showIp = !activity.showIp;
  }


  loadTrustedDevices() {
    this.authService.getTrustedDevices().subscribe(devices => {
      this.originalTrustedDevices = devices;
      this.filteredTrustedDevices = [...devices];
      this.extractDeviceFilterOptions();
      this.sortDevices();
    });
  }

  private extractDeviceFilterOptions() {
    const types = new Set<string>();
    this.originalTrustedDevices.forEach(device => {
      types.add(device.userAgent); // Usamos directamente el userAgent parseado
    });
    this.deviceFilterOptions = ['all', ...Array.from(types).sort()];
  }

  filterDevices() {
    if (this.selectedDeviceFilter === 'all') {
      this.filteredTrustedDevices = [...this.originalTrustedDevices];
    } else {
      this.filteredTrustedDevices = this.originalTrustedDevices.filter(
        device => device.userAgent === this.selectedDeviceFilter
      );
    }
    this.sortDevices();
  }

  sortDevices() {
    this.filteredTrustedDevices.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return this.deviceSortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }

  toggleDeviceSortOrder() {
    this.deviceSortOrder = this.deviceSortOrder === 'desc' ? 'asc' : 'desc';
    this.sortDevices();
  }




}