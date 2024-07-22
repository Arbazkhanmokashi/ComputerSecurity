import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { ChatService } from '../../../services/chat/chat.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent  implements OnInit {
  public isAuthenticated = false;

  constructor(private chatService: ChatService, private router: Router, private authService: AuthService){}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
  }
  logout = () => {
    this.authService.logout();
    this.chatService.stopConnection();
    this.router.navigate(["/login"]);
  }
}

