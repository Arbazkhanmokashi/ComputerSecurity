import { Injectable, NgZone } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  //github
  private clientId = environment.githubConfig.clientId;
  private clientSecret = environment.githubConfig.clientSecret;
  private redirectUri = environment.githubConfig.redirectURL;
  private backendUrl = environment.backendUrl + "api/auth/github"

  constructor(private http: HttpClient, private router: Router) {}

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
    localStorage.setItem('jwt_token', authResult.jwt_token);
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('jwt_token');
    this.router.navigate(['/']);
  }

  getToken() {
    return localStorage.getItem('access_token');
  }

  getJWTToken() {
    return localStorage.getItem('jwt_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}