import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdAuthGuardService {
  constructor(private _router: Router) { }

  canActivate(route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
   if (localStorage.getItem('userData')==null) {
      this._router.navigate(["/admin/login"]);
      return false;
    }
    return true;
  }
}