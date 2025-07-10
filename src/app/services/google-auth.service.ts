import { Injectable, inject } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signOut,
  type User
} from 'firebase/auth';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  private router = inject(Router);
  private http = inject(HttpClient);
  private auth = getAuth(initializeApp(environment.firebaseConfig));
  private googleProvider = new GoogleAuthProvider();
  private facebookProvider = new FacebookAuthProvider();

  constructor() {
    this.googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
  }

  async signInWithFacebook(): Promise<User> {
    try {
      const result = await signInWithPopup(this.auth, this.facebookProvider);
      const idToken = await result.user.getIdToken();

      await this.http.post(
        `${environment.apiUrl}api/auth/google/login`,
        { idToken },
        { withCredentials: true }
      ).toPromise();

      return result.user;
    } catch (error: any) {
      if (error.code === 'auth/account-exists-with-different-credential') {
        alert('This email is already registered with another provider. Please try signing in with Google.');
      }
      throw error;
    }
  }

  async signInWithGoogle(): Promise<User> {
    try {
      const result = await signInWithPopup(this.auth, this.googleProvider);
      const idToken = await result.user.getIdToken();

      await this.http.post(
        `${environment.apiUrl}api/auth/google/login`,
        { idToken },
        { withCredentials: false }
      ).toPromise();

      return result.user;
    } catch (error: any) {
      if (error.code === 'auth/account-exists-with-different-credential') {
        alert('This email is already registered with another provider. Please try signing in with Facebook.');
      }
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await this.http.post(`${environment.apiUrl}auth/logout`, {}).toPromise();
      await signOut(this.auth);
      this.router.navigate(['/login']);
    } catch (error) {
      throw error;
    }
  }

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }
}
