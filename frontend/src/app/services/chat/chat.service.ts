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

  mhbAdvisorAPI( fullName: string, email: string, phoneNumber: string, streetAddress: string, ownedProperty: string, sizeProperty: string, numberOfBedroom: string, numberOfBathroom: string, desiredSellingPrice: string, 
    currentCondition: string, motiveSellProperty: string, propertyType: string, sellingTimeline: string): Observable<any> {
    return this.http.post<any>(this.rootURL3 + "michael-the-home-buyer/mhb-advisor", {
      fullName: fullName,
      email: email,
      phoneNumber: phoneNumber,
      streetAddress: streetAddress,
      ownedProperty: ownedProperty,
      sizeProperty: sizeProperty,
      numberOfBedroom: numberOfBedroom,
      numberOfBathroom: numberOfBathroom,
      desiredSellingPrice: desiredSellingPrice,
      currentCondition:currentCondition,
      motiveSellProperty: motiveSellProperty,
      propertyType: propertyType,
      sellingTimeline: sellingTimeline
    }).pipe(catchError(this.errorHandler));
  }
  
  getResponseFromChatbot(message: string): Observable<any> {
    return this.http.post<any>(this.dialogflowAPI + "fred/chat", {
      message: message
    }).pipe(catchError(this.errorHandler));
  }

  getCatchResponse(): Observable<any> {
    const url = this.rootURL3 + "michael-the-home-buyer/mhb-advisor/instruction";

    // Make the HTTP GET request
    return this.http.get<any>(url);
  }

   // Method 1: Add New Conversation with Initial Message
   addConversation(userId: string, assistantId: string, conversationName: string, userPrompt: string, botReply: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}add`, {
      userId,
      assistantId,
      conversationName,
      message: {
        userPrompt,
        botReply
      }
    }).pipe(catchError(this.errorHandler));
  }

  // Method 2: Add Message to Existing Conversation
  addMessageToConversation(conversationId: string, userId: string, userPrompt: string, botReply: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}add`, {
      conversationId,
      userId,
      message: {
        userPrompt,
        botReply
      }
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
  
  errorHandler(error: HttpErrorResponse){
    console.error(error);
    return throwError(error.message || "Server Error");
  }
}