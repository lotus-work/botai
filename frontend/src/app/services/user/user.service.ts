import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `https://botai-7k46.onrender.com/user`;

  constructor(private http: HttpClient) {}

  addUser(name: string, emailAddress: string): Observable<any> {
    const payload = { name, emailAddress };
    return this.http.post<any>(this.apiUrl + "/add", payload).pipe(
      catchError(this.errorHandler)
    );
  }

  updateUser(userId: string, userData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl + "/update"}/${userId}`, userData)
      .pipe(catchError(this.errorHandler));
  }

  createOrganization(userId: string, organizationName: string): Observable<any> {
    const payload = { name: organizationName };
    return this.http.post<any>(`${this.apiUrl}/organization/add/${userId}`, payload)
      .pipe(catchError(this.errorHandler));
  }
  
  checkOrganization(userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/organization/check/${userId}`)
      .pipe(catchError(this.errorHandler));
  }
  addOrganizationMember(organizationId: string, name: string, emailAddress: string): Observable<any> {
    const payload = { organizationId, name, emailAddress };
    return this.http.post<any>(`${this.apiUrl}/organization/members/add`, payload).pipe(
      catchError(this.errorHandler)
    );
  }

  removeMember(organizationId: string, userId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/organization/${organizationId}/member/${userId}`).pipe(
      catchError(this.errorHandler)
    );
  }
  
  private errorHandler(error: HttpErrorResponse) {
    console.error('Error occurred:', error);
    return throwError(error.message || 'Server Error');
  }
}
