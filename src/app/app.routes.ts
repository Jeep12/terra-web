import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';


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
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'create-account-game' // Ruta por defecto
            },
            {
                path: 'create-account-game', // <- ¡Sin "dashboard/"!
                loadComponent: () => import('./components/game/create-account-game/create-account-game.component').then(m => m.CreateAccountGameComponent)
            },
            {
                path: 'change-password-game', // <- ¡Sin "dashboard/"!
                loadComponent: () => import('./components/game/change-password-game/change-password-game.component').then(m => m.ChangePasswordGameComponent)
            }
        ]
    }

];


@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
