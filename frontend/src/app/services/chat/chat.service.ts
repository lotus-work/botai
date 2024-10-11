import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiKey = '5ff0fedbab61462d958d31c234c6a31f';

  constructor(private http: HttpClient) { }
  
  // rootURL3 = "https://red-violet-horse-cape.cyclic.app/";  
  rootURL3 = "https://api.michaelthehomebuyer.ca/"
 // dialogflowAPI = "https://weak-gold-wasp-hose.cyclic.app/";

  
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


  // getResponseFromChatbot(text: string): Observable<any> {
  //   return this.http.post<any>(this.dialogflowAPI + "text-query", {
  //     text: text
  //   }).pipe(catchError(this.errorHandler));
  // }

  
  getResponseFromChatbot(message: string): Observable<any> {
    return this.http.post<any>(this.dialogflowAPI + "chat", {
      message: message
    }).pipe(catchError(this.errorHandler));
  }

  getCatchResponse(): Observable<any> {
    const url = this.rootURL3 + "michael-the-home-buyer/mhb-advisor/instruction";

    // Make the HTTP GET request
    return this.http.get<any>(url);
  }
  
  errorHandler(error: HttpErrorResponse){
    console.error(error);
    return throwError(error.message || "Server Error");
  }
}