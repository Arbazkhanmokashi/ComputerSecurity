import { Injectable } from '@angular/core';
import { LoginResponse } from '../../models/responses/login-response';
import { ApiService } from '../http/api.service';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private googleApiUrl = environment.googleLoginurl;

  constructor(private apiservice: ApiService) { }

  GoogleLogin(credential: string): Observable<LoginResponse>{

    return this.apiservice.postData<LoginResponse, string>(this.googleApiUrl, JSON.stringify(credential));
  }
}
