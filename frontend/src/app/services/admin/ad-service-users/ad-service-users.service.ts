import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdServiceUsersService {
  private apiUrl = `https://api.bclone.ai/admin`;
  private userApiUrl = `https://api.bclone.ai`;

  constructor(private http: HttpClient) {}
  
  getAllUsers() {
    return this.http.get(`${this.apiUrl}/users`)
      .pipe(
        catchError(this.errorHandler)
      );
  }

  addUser(userData: any) {
    return this.http.post(`${this.apiUrl}/user/add`, userData)
      .pipe(
        catchError(this.errorHandler)
      );
  }

  updateAssistant(userId: string, assistantData: any) {
    return this.http.put(`${this.apiUrl}/user/edit/gptassistant/${userId}`, assistantData)
      .pipe(
        catchError(this.errorHandler)
      );
  }

  updateUserDetails(userId: string, userDetails: any) {
    return this.http.put(`${this.apiUrl}/user/edit/${userId}`, userDetails)
      .pipe(
        catchError(this.errorHandler)
      );
  }

  getUserDetails(userId: string) {
    return this.http.get(`${this.userApiUrl}/user/get/${userId}`)
      .pipe(
        catchError(this.errorHandler)
      );
  }

  deleteUserAndAssociatedRecords(userId: string) {
    return this.http.delete(`${this.apiUrl}/user/${userId}`)
      .pipe(
        catchError(this.errorHandler)
      );
  }

  deleteUserFromOrganization(organizationId: string, userId: string) {
    return this.http.delete(`${this.apiUrl}/organization/${organizationId}/member/${userId}`)
      .pipe(
        catchError(this.errorHandler)
      );
  }
  getUserMessageStats(userId: string, startDate?: string, endDate?: string) {
    const params: any = { userId };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
  
    return this.http
      .get(`${this.apiUrl}/user/message-stats`, { params })
      .pipe(catchError(this.errorHandler));
  }
  
  getOrganizationMessageStats(organizationId: string, startDate?: string, endDate?: string) {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
  
    return this.http
      .get(`${this.apiUrl}/organization/message-stats/${organizationId}`, { params })
      .pipe(catchError(this.errorHandler));
  }

  getAllUserStats(startDate?: string, endDate?: string) {
    const params: any = { };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
  
    return this.http
      .get(`${this.apiUrl}/allUser/stats`, { params })
      .pipe(catchError(this.errorHandler));
  }
  
  private errorHandler(error: HttpErrorResponse) {
    console.error('Error occurred:', error);
    return throwError(error.message || 'Server Error');
  }
}
