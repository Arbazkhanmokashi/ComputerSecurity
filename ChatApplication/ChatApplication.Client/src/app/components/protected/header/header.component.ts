import { Component, OnInit } from '@angular/core';
import { KeyStorageService } from '../../../services/keyStorage/key-storage.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent  implements OnInit {
  public isAuthenticated = false;

  constructor(private keyStorageService: KeyStorageService, private router: Router, private authService: AuthService){}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
  }
  logout = () => {
    this.authService.logout();
    this.router.navigate(["/login"]);
  }
}

