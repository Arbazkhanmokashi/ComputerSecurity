import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { KeyStorageService } from '../../services/keyStorage/key-storage.service';
import { EncryptionService } from '../../services/encryption/encryption.service';
import { GithubService } from '../../services/github/github.service';
import { UtilityService } from '../../services/utility/utility.service';
import { UserPublicKey } from '../../models/user/user';
import { UserKeySetupService } from '../../services/user-key-setup/user-key-setup.service';

@Component({
  selector: 'app-auth-callback',
  templateUrl: './auth-callback.component.html',
  styleUrl: './auth-callback.component.css'
})
export class AuthCallbackComponent implements OnInit {
  constructor(private route: ActivatedRoute, 
    private authService: AuthService, 
    private router: Router, 
    private userKeySetupService: UserKeySetupService
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['code']) {
        this.authService.handleAuthCallback(params['code']).subscribe((authResult: any) => {
          console.log("Logged in successfully")
          this.authService.setSession(authResult);
          this.userKeySetupService.setup().then(res => {
            if(res)
              this.router.navigate(['/home']);
            else
              this.router.navigate(['/login']);
          });
        });
      }
    });
  }

}