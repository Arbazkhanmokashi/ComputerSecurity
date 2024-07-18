import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { KeyStorageService } from '../../services/keyStorage/key-storage.service';
import { EncryptionService } from '../../services/encryption/encryption.service';
import { GithubService } from '../../services/github/github.service';

@Component({
  selector: 'app-auth-callback',
  templateUrl: './auth-callback.component.html',
  styleUrl: './auth-callback.component.css'
})
export class AuthCallbackComponent implements OnInit {
  constructor(private route: ActivatedRoute, 
    private authService: AuthService, 
    private router: Router, 
    private keyService: KeyStorageService, 
    private encryptionService: EncryptionService,
    private githubService: GithubService
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['code']) {
        this.authService.handleAuthCallback(params['code']).subscribe((authResult: any) => {
          console.log("Logged in successfully")
          this.authService.setSession(authResult);
          this.userProfileSetup();
          this.router.navigate(['/home']);
        });
      }
    });
  }

  userProfileSetup = () => {
    var key = this.keyService.retrieveKey();
    if(key == undefined || key == ''){
      //generate key-value pair
      this.encryptionService.generateKeyPair().then(res => {
        this.encryptionService.exportKeyAsString(res.privateKey).then(res => this.keyService.storeKey(res));
        
        
        this.encryptionService.exportKeyAsString(res.publicKey).then(res => {
          if(this.authService.isAuthenticated()){
            
          }
        });
      }).catch(err => {
        console.error("Error while generating keys");
      })
    }
  }
}
