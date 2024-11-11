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


  private errorHandler(error: HttpErrorResponse) {
    console.error('Error occurred:', error);
    return throwError(error.message || 'Server Error');
  }
}
