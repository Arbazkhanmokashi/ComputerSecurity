import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, throwError } from 'rxjs';
import { HTTPResponse } from '../../models/responses/api-response';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) {
    // this.apiUrl = this.appConfig.config.apiUrl;
   }

   getData<T>(url: string): Observable<T> {
    return this.http.get<HTTPResponse<T>>(url, this.getRequestOptions()).pipe(
      map((response: HTTPResponse<T>) => {
        if (response.meta.retVal === 1) {
          return response.data;
        } else {
          throw new Error(response.meta.message || 'Unexpected response');
        }
      })
    );
  }

  postData<T, T1>(url: string, body: T1): Observable<T> {
    return this.http.post<HTTPResponse<T>>(url, body, this.getRequestOptions()).pipe(
      map((response: HTTPResponse<T>) => {
        if (response.meta.retVal === 1) {
          return response.data;
        } else {
          throw new Error(response.meta.message || 'Unexpected response');
        }
      })
    );
  }

  putData<T, T1>(url: string, body: T1): Observable<T> {
    return this.http.put<HTTPResponse<T>>(url, body, this.getRequestOptions()).pipe(
      map((response: HTTPResponse<T>) => {
        if (response.meta.retVal === 1) {
          return response.data;
        } else {
          throw new Error(response.meta.message || 'Unexpected response');
        }
      })
    );
  }

  // Helper method to construct request options (headers, etc.)
  private getRequestOptions() {
    // You can add any headers or authentication tokens here
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      // Add any additional headers here
    });
    return { headers };
  }

  // Helper method to handle errors
  private handleError(error: any) {
    if (error.error instanceof ErrorEvent) 
    {
      console.error('Client-side error:', error.error.message);
    } 
    else 
    {
      console.error('Server-side error:', error.status, error.error);
    }
    return throwError(() => error);
  }
}
