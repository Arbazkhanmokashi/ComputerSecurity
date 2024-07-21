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
  private fileName = 'UserPubkey.pub'
  private repoName = environment.githubConfig.repositoryName;

  constructor(private http: HttpClient, private authService: AuthService) 
  {
  }

  getUserDetails = async() => {
    var accessToken = this.authService.getToken();
    const octokit = new Octokit({
      auth: accessToken
    })
    var response = await octokit.request('GET /user', {
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })

    if(response.status == 200)
      return response.data;

    return null;
  }

  getUsername = async() => {    
    var response = await this.getUserDetails();

    if(response != null)
      return response.login;

    return null;
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

  createOrUpdateFile = async(content: string) => {
    var accessToken = this.authService.getToken();
    const octokit = new Octokit({
      auth: accessToken
    })
    var userDetails = await this.getUserDetails();
    var info = { 
      owner : userDetails?.login == undefined ? '' : userDetails?.login, 
      name: userDetails?.name == null ? '' : userDetails?.name, 
      email: userDetails?.email == null ? '' : userDetails?.email};
    return octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
      owner: info.owner,
      repo: this.repoName,
      path: this.fileName,
      message: 'updated pub key',
      committer: {
        name: info.name,
        email: info.email
      },
      content: content,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
  }

  getFileSha(username: string): Observable<any> {
    const accessToken = this.authService.getToken();
    const headers = { Authorization: `token ${accessToken}` };

    return this.http.get(`${this.apiUrl}/repos/${username}/${this.repoName}/contents/${this.fileName}`, { headers });
  }
  
  uploadFileToRepo = (username: string, content: string, sha: string | null) => {
    const accessToken = this.authService.getToken();
    const headers = { Authorization: `token ${accessToken}`, 'Content-Type': 'application/json' };
    const body = {
      message: 'add public key',
      content: btoa(content),
      sha: sha
    };

    return this.http.put(`${this.apiUrl}/repos/${username}/${this.repoName}/contents/${this.fileName}`, body, { headers });
  }

  getPublicKey(repoOwner: string) {
    return this.http.get(`https://api.github.com/repos/${repoOwner}/${this.repoName}/contents/${this.fileName}`);
  }
}