import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';
import { catchError, map, Observable, of } from 'rxjs';
import { Octokit } from '@octokit/rest';

@Injectable({
  providedIn: 'root'
})
export class GithubService {

  private apiUrl = 'https://api.github.com';
  private repoName = environment.githubConfig.repositoryName;

  constructor(private http: HttpClient, private authService: AuthService) { }

  getUsername(){
    var accessToken = this.authService.getToken();
    const octokit = new Octokit({
      auth: accessToken
    })
    
    return octokit.request('GET /user', {
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
  }

  checkRepositoryExists(): Observable<boolean> {
    const url = `${this.apiUrl}/repos/${this.repoName}`;
    return this.http.get(url).pipe(
      map(() => true), // If the GET request succeeds, the repo exists
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          return of(false); // If the status is 404, the repo doesn't exist
        }
        throw error; // For other errors, rethrow
      })
    );
  }

  createRepository() {
    const accessToken = this.authService.getToken();
    const headers = { Authorization: `token ${accessToken}` };
    const body = {
      name: this.repoName,
      public: true,
      auto_init: true
    };

    return this.http.post(`${this.apiUrl}/user/repos`, body, { headers });
  }

  uploadFileToRepo(fileName: string, content: string) {
    const accessToken = this.authService.getToken();
    const headers = { Authorization: `token ${accessToken}` };
    const body = {
      message: 'add public key',
      content: btoa(content)
    };

    return this.http.put(`${this.apiUrl}/repos/${this.repoName}/contents/${fileName}`, body, { headers });
  }

  getPublicKey(repoOwner: string, repoName: string, fileName: string) {
    return this.http.get(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${fileName}`);
  }
}
