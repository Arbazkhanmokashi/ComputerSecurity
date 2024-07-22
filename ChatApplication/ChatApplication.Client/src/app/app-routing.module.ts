import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { IsAuthGuard } from './oauth.guard';
import { HomeComponent } from './components/protected/home/home.component';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';
import { HeaderComponent } from './components/protected/header/header.component';

const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'home',},
  { path: 'login', component: LoginComponent },
  { path: 'auth-callback', component: AuthCallbackComponent },
  { path: '', component: HeaderComponent, 
    canActivate: [IsAuthGuard],
    children:[
      { path: 'home', component: HomeComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
