import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';


export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'login',
        loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./components/auth/register/register.component').then(m => m.RegisterComponent)
    },
    {
        path: 'reset-password',
        loadComponent: () => import('./components/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
    },
    {
        path: 'forgot-password',
        loadComponent: () => import('./components/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
    },
    {
        path: 'resend-email-verification',
        loadComponent: () => import('./components/auth/resend-email-verification/resend-email-verification.component').then(m => m.ResendEmailVerificationComponent)
    },
    {
        path: 'verify-email',
        loadComponent: () => import('./components/auth/verify-email/verify-email.component').then(m => m.VerifyEmailComponent)
    },
    {
        path: 'two-factor-step',
        loadComponent: () => import('./components/auth/two-factor/two-factor.component').then(m => m.TwoFactorComponent)
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [authGuard], // importalo arriba, no lo pongas con promesas

        children: [


            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'create-account-game' // Ruta por defecto
            },
            {
                path: 'home-dashboard', // <- ¡Sin "dashboard/"!
                loadComponent: () => import('./components/dashboard-home/dashboard-home.component').then(m => m.DashboardHomeComponent)
            },
            {
                path: 'create-account-game', // <- ¡Sin "dashboard/"!
                loadComponent: () => import('./components/game/create-account-game/create-account-game.component').then(m => m.CreateAccountGameComponent)
            },
            {
                path: 'change-password-game', // <- ¡Sin "dashboard/"!
                loadComponent: () => import('./components/game/change-password-game/change-password-game.component').then(m => m.ChangePasswordGameComponent)
            },
            {
                path: 'buy-terra-coin', // <- ¡Sin "dashboard/"!
                loadComponent: () => import('./components/game/buy-terra-coin/buy-terra-coin.component').then(m => m.BuyTerraCoinComponent)
            }
            ,
            {
                path: 'send-terra-coin', // <- ¡Sin "dashboard/"!
                loadComponent: () => import('./components/game/send-terra-coin/send-terra-coin.component').then(m => m.SendTerraCoinComponent)
            }
            ,
            {
                path: 'support', // <- ¡Sin "dashboard/"!
                loadComponent: () => import('./components/support/support.component').then(m => m.SupportComponent)
            }
            ,
            {
                path: 'setting-account-master', // <- ¡Sin "dashboard/"!
                loadComponent: () => import('./components/auth/settins-account-master/settings-account-master.component').then(m => m.SettingsAccountMasterComponent)
            }
        ]
    },
    {
        path: '**',
        loadComponent: () => import('./components/website-not-found/website-not-found.component').then(m => m.WebsiteNotFoundComponent)
    },

];


@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
