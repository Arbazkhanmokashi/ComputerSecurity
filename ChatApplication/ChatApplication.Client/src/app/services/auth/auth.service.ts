import { Injectable, NgZone } from '@angular/core';
import { LoginResponse } from '../../models/responses/login-response';
import { ApiService } from '../http/api.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import firebase from 'firebase/compat/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';

declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private sessionStorageName = "user-data";
  private userSubject = new BehaviorSubject<firebase.User | null>(null);
  public user$ = this.userSubject.asObservable();
  public userTest : any = null;

  constructor(private afAuth: AngularFireAuth, private ngZone: NgZone) {
    this.initializeGoogleOneTap();
    this.afAuth.authState.subscribe(user => {
      // this.userTest = user;
      this.userSubject.next(user);
    });
  }

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
