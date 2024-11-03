import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';

@Injectable({
  providedIn: 'root'
})
export class UserAuthGuardService {
  constructor(private _router: Router,  public auth: AuthService,) { }

  canActivate(route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
      if (localStorage.getItem('user')==null || !this.checkAuthKeysExist()) {
        this._router.navigate(["/login"]);
        return false;
      }
      this._router.navigate([""]);
    return true;
  }
  checkAuthKeysExist(): boolean {
    const keys = Object.keys(localStorage);
    const authKeys = keys.filter(key => key.startsWith('@@auth0spajs@@::'));
    return authKeys.length >= 2 && authKeys.every(key => localStorage.getItem(key));
  }

}
