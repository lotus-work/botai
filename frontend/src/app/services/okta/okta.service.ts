import { Injectable } from '@angular/core';
declare let OktaSignIn: any;

@Injectable({
  providedIn: 'root'
})
export class OktaService {
  widget;
  constructor() {
    this.widget = new OktaSignIn({
      baseUrl: 'https://dev-158606.oktapreview.com',
      clientId: 'RLroj4NiQtyPWWthGUnN',
      redirectUri: 'http://localhost:4200',
      authParams: {
        responseType: ['id_token', 'token']
      }
    });
  }

  getWidget() {
    return this.widget;
  }
}
