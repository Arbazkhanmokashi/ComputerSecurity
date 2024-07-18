import { Injectable, NgZone } from '@angular/core';
import { LoginResponse } from '../../models/responses/login-response';
import { ApiService } from '../http/api.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import firebase from 'firebase/compat/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';

declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private sessionStorageName = "user-data";
  private userSubject = new BehaviorSubject<firebase.User | null>(null);
  public user$ = this.userSubject.asObservable();
  public userTest : any = null;

  //github
  private clientId = environment.githubConfig.clientId;
  private clientSecret = environment.githubConfig.clientSecret;
  private redirectUri = environment.githubConfig.redirectURL;
  private backendUrl = environment.backendUrl + "api/auth/github"

  constructor(private afAuth: AngularFireAuth, private ngZone: NgZone, private http: HttpClient, private router: Router) {
    // this.initializeGoogleOneTap();
    // this.afAuth.authState.subscribe(user => {
    //   // this.userTest = user;
    //   this.userSubject.next(user);
    // });
  }

  //github authentication logic
  loginWithGitHub() {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&scope=repo`;
    window.location.href = githubAuthUrl;
  }

  handleAuthCallback(code: string) {
    return this.http.post(`${this.backendUrl}`, { code });
  }

  setSession(authResult: any) {
    localStorage.setItem('access_token', authResult.access_token);
  }

  logout() {
    localStorage.removeItem('access_token');
    this.router.navigate(['/']);
  }

  getToken() {
    return localStorage.getItem('access_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  //Google authentication logic
  private initializeGoogleOneTap() {
    window.onload = () => {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: this.handleCredentialResponse.bind(this)
      });
       // @ts-ignore
       google.accounts.id.renderButton(
        // @ts-ignore
        document.getElementById("googleBtn"),
          { theme: "outline", size: "large", width: "100%"}
      );

      google.accounts.id.prompt();
    };
  }

  private async handleCredentialResponse(response: any) {
    const credential = firebase.auth.GoogleAuthProvider.credential(response.credential);
    await this.afAuth.signInWithCredential(credential).then(() => {
      this.ngZone.run(() => {
        console.log('User signed in with Google One Tap');
        // const user = this.userSubject.getValue();
        // sessionStorage.setItem(this.sessionStorageName, JSON.stringify(user));
      });
    }).catch((error) => {
      console.error('Error signing in with Google One Tap', error);
    });
  }

  getUserEmail(): string | null {
    const user = this.userSubject.getValue();
    return user ? user.email : null;
  }

  isLoggedIn(): boolean {
    console.log(this.userTest);
    return this.userTest !== null;
  }
}
