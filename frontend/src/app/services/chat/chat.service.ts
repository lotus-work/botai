import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiKey = '5ff0fedbab61462d958d31c234c6a31f';

  constructor(private http: HttpClient) { }
   
rootURL3 = "https://api.michaelthehomebuyer.ca/"
 private apiUrl = `https://botai-7k46.onrender.com/conversation/`;
  dialogflowAPI = "https://api.michaelthehomebuyer.ca/"
  
  getResponseFromChatbot(userId: string, message: string, temperature: number, isOwner: boolean, threadId: string, conversationId: string): Observable<any> {
    return this.http.post<any>(this.apiUrl + "chat", {
      userId : userId,
      message: message,
      temperature: temperature,
      isOwner : isOwner,
      threadId : threadId,
      conversationId : conversationId
    }).pipe(catchError(this.errorHandler));
  }

  getAllChatsByUserId(userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}user/${userId}`)
      .pipe(catchError(this.errorHandler));
  }

   // Method 1: Add New Conversation with Initial Message
   addConversation(userId: string, assistantId: string, conversationName: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}add`, {
      userId,
      assistantId,
      conversationName
    }).pipe(catchError(this.errorHandler));
  }

  // Method 2: Add Message to Existing Conversation
  addMessageToConversation(conversationId: string, userId: string, assistantId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}add`, {
      conversationId,
      userId,
      assistantId
    }).pipe(catchError(this.errorHandler));
  }

  // Method 3: Retrieve Conversation by Conversation ID and User ID
  getConversation(conversationId: string, userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}${conversationId}?userId=${userId}`)
      .pipe(catchError(this.errorHandler));
  }

  // Method 4: Export Conversation by Conversation ID and User ID
  exportConversation(conversationId: string, userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}export/${conversationId}?userId=${userId}`, { responseType: 'blob' as 'json' })
      .pipe(catchError(this.errorHandler));
  }


  exportConversations(startDate: string, endDate: string, userId: string): Observable<Blob> {
    console.log(`Exporting conversations from ${startDate} to ${endDate} for userId: ${userId}`);
    // The HTTP request now uses the query parameters directly in the URL
    return this.http.get(`${this.apiUrl}export/bydate/${startDate}/${endDate}/${userId || ''}`, {
      responseType: 'blob'  // Expecting a blob (ZIP file)
    });
  }
  

  deleteConversation(conversationId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}${conversationId}`)
      .pipe(catchError(this.errorHandler));
  }

  
  errorHandler(error: HttpErrorResponse){
    console.error(error);
    return throwError(error.message || "Server Error");
  }
}