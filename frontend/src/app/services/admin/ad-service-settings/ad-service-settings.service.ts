import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdServiceSettingsService {
  private apiUrl = `https://botai-7k46.onrender.com/admin`;

  constructor(private http: HttpClient) {}
  
  updatePageSettings(pageSettingsData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl + "/page-settings"}`, pageSettingsData)
      .pipe(catchError(this.errorHandler));
  }

  getPageSettings(page: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/page-settings?page=${page}`)
      .pipe(catchError(this.errorHandler));
  }

  getBasicInfo(page: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/basicinfo`)
      .pipe(catchError(this.errorHandler));
  }

  getSettings(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/settings`).pipe(
      catchError(this.errorHandler)
    );
  }

  updateSettings(settingsData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/settings`, settingsData).pipe(
      catchError(this.errorHandler)
    );
  }

  getbasicDashboardStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/basicDashboardStatistics`)
      .pipe(catchError(this.errorHandler));
  }

  private errorHandler(error: HttpErrorResponse) {
    console.error('Error occurred:', error);
    return throwError(error.message || 'Server Error');
  }
}
