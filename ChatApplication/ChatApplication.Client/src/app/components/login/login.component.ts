import { AfterViewInit, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { CredentialResponse, PromptMomentNotification } from 'google-one-tap';
import { AuthService } from '../../services/auth/auth.service';
import { BehaviorSubject, last, Observable } from 'rxjs';
import { SessionService } from '../../services/session/session.service';
import { environment } from '../../../environments/environment';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { KeyStorageService } from '../../services/keyStorage/key-storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {
  public loginValid = true;
  private userSubject = new BehaviorSubject<firebase.User | null>(null);
  public user$ = this.userSubject.asObservable();
  publicKey$!: Observable<any>;

  // private _destroySub$ = new Subject<void>();
  // private readonly returnUrl: string;

  constructor(private fb :FormBuilder,
    private _router: Router,
    private service: AuthService,
    private _ngZone: NgZone,
    private sessionService: SessionService,
    private afAuth: AngularFireAuth,
    private dbService: KeyStorageService
  ) {
  }
  ngAfterViewInit(): void {
    //this.initialiseGoogleOneTap();
  }

  public ngOnInit(): void {
    console.log("initialised")
    //this.initialiseGoogleOneTap();
  }

  getEmail() : void{
    console.log(this.service.getUserEmail());
    console.log(this.service.isLoggedIn())
  }

  public ngOnDestroy(): void {
    // this._destroySub$.next();
  }
}