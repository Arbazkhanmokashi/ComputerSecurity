import { Injectable } from '@angular/core';
import { LoginResponse } from '../../models/responses/login-response';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  storageName: string = "userDetails";
  authStorageName: string = "authToken";
  loginData!: LoginResponse;

  constructor() { }

  saveDetails = (details: LoginResponse) => {
    localStorage.setItem(this.storageName, JSON.stringify(details));
    localStorage.setItem(this.authStorageName, details.token);
  }

  retreiveDetails = (): LoginResponse | null => {
    var userInfo = localStorage.getItem(this.storageName);
    if(userInfo != null && userInfo != undefined && userInfo != ''){
      this.loginData = JSON.parse(userInfo);
      return this.loginData;
    }
    else
    {
      return null;
    }
  }

  getToken = (): string | null => {
    return localStorage.getItem(this.authStorageName);
  }
  
  deleteDetails = () => {
    localStorage.removeItem(this.storageName);
    localStorage.removeItem(this.authStorageName);
  }
}
