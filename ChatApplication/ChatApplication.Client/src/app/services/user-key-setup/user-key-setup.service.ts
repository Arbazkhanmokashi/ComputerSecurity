import { Injectable } from '@angular/core';
import { KeyStorageService } from '../keyStorage/key-storage.service';
import { UtilityService } from '../utility/utility.service';
import { GithubService } from '../github/github.service';
import { EncryptionService } from '../encryption/encryption.service';
import { UserPublicKey } from '../../models/user/user';

@Injectable({
  providedIn: 'root'
})
export class UserKeySetupService {
  private deviceNumber!: string;

  constructor(
    private keyService: KeyStorageService, 
    private utilityService: UtilityService, 
    private githubService: GithubService, 
    private encryptionService: EncryptionService
  ) { }

  setup = async () => {
    //first check if device is registered
    this.deviceNumber = this.keyService.retrieveDeviceNumber() ?? '';
    if(this.deviceNumber == ''){
      this.deviceNumber = this.utilityService.getUniqueGUID();
      this.keyService.storeDeviceNumber(this.deviceNumber);
    }
    this.checkRepositoryExists();
    return await this.keySetup();
  }

  
  keySetup = async (): Promise<Boolean> => {
    var success = false;
    var key = this.keyService.retrieveKey();
    if(key != null) //key already present
      return true;
    
    const username = await this.githubService.getUsername();
    if(username == null)
      throw new Error("Github Username is null")

    this.encryptionService.generateKeyPair().then(res => {
      //store private key
      this.keyService.storeKey(res.privateKey)
      
      //store public key
      var userPublicKeys: UserPublicKey[];
      var userKey: UserPublicKey = { device: this.deviceNumber, key: res.publicKey };

      this.githubService.getPublicKey(username).subscribe(res => {
        var response = JSON.parse(JSON.stringify(res))
        var keys = JSON.parse(window.atob(response.content)) as UserPublicKey[];
          
        const index = keys.findIndex(obj => obj.device == this.deviceNumber);
        if(index !== -1){
          keys[index] = userKey;
          userPublicKeys = keys;
        }
        else
          userPublicKeys = [userKey, ...keys];
        this.updateGitHubFile(JSON.stringify(userPublicKeys));
        success = true;
      }, err => {
        if(err.error.message == 'Not Found'){ //file not yet created
          userPublicKeys = [userKey];
          this.updateGitHubFile(JSON.stringify(userPublicKeys)).then(res => success = res);
        }
      })
    }).catch(err => {
      console.error("Error while generating keys");
    });

    return success;
  }

  updateGitHubFile = async(content: string) => {
    var success = false;
    const username = await this.githubService.getUsername();
    if(username == null)
      throw new Error("Invalid Username")
    this.githubService.getFileSha(username).subscribe(
      (response: any) => {
        const sha = response.sha;
        this.githubService.uploadFileToRepo(username, content, sha).subscribe(
          res => {
            console.log('File updated successfully:', res);
            success = true;
          },
          err => {
            console.error('Error updating file:', err);
          }
        );
      },
      error => {
        if (error.status === 404) {
          console.log('File does not exist. Creating a new one.');
          this.githubService.uploadFileToRepo(username, content, null).subscribe(
            res => {
              console.log('File created successfully:', res);
              success = true;
            },
            err => {
              console.error('Error creating file:', err);
            }
          );
        } else {
          console.error('Error fetching file SHA:', error);
        }
      }
    );

    return success;
  }

  checkRepositoryExists = () => {
    this.githubService.checkRepositoryExists().subscribe(res => {
      if(!res){
        this.githubService.createRepository().subscribe(res => {})
      }
    });
  }
}
