import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, CanActivateFn } from '@angular/router';
import { map, Observable, of, take } from 'rxjs';
import { AuthService } from './services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
class OauthGuard {

  constructor(private authService: AuthService, private router: Router) {

  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    let canActivate = false;
    if (this.authService.isLoggedIn()) 
    {
      console.log("OAuth valid");
      canActivate = true;
    } 
    else {
      canActivate = false;
      return this.router.createUrlTree(['/login'], {queryParams: {returnUrl: state.url}});
    }
    console.debug('canActivate:', canActivate);
    return of(canActivate).pipe();
  }
}

export const IsAuthGuard: CanActivateFn = (route, state) => {
  return inject(OauthGuard).canActivate(route, state);
};
