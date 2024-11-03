import { environment } from '../../../../environment';
import { AdminLoginResponse } from '../../../interface/admin/admin-login-response.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, retry, throwError } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AdServiceLoginService {
    private apiUrl = `${environment.baseUrl}/admin/login`;

    constructor(private http: HttpClient) {}

    login(emailAddress: string, password: string): Observable<AdminLoginResponse> {
      console.log(emailAddress);
      const payload = { emailAddress, password };
      return this.http.post<AdminLoginResponse>(this.apiUrl, payload)  // Corrected the post method usage
        .pipe(catchError(this.errorHandler));
    }

    private errorHandler(error: HttpErrorResponse) {
      console.error('Error occurred:', error);
      return throwError(error.message || "Server Error");  // Ensure throwError is imported
    }
}
