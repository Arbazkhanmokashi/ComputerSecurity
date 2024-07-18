import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { IsAuthGuard } from './oauth.guard';
import { HomeComponent } from './components/protected/home/home.component';
import { JoinChatComponent } from './components/protected/joinChat/join-chat/join-chat.component';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'auth-callback', component: AuthCallbackComponent },
  { path: 'home', component: HomeComponent, canActivate: [IsAuthGuard],
  children:[
    { path: 'join-chat', component: JoinChatComponent },
  ]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
