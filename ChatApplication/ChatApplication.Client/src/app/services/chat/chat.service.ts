import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { IHttpConnectionOptions } from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { ChatInfo, Message, UserMessageDTO, UserPublicKey } from '../../models/user/user';
import { EncryptionService } from '../encryption/encryption.service';
import { KeyStorageService } from '../keyStorage/key-storage.service';
import { GithubService } from '../github/github.service';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { UtilityService } from '../utility/utility.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private hubConnection!: signalR.HubConnection;
  private messagesSubject = new BehaviorSubject<ChatInfo[]>([]);
  public messages$ = this.messagesSubject.asObservable();
  private chatHubUrl = environment.chatHubUrl;

  // Manage online users
  private onlineUsersSubject = new BehaviorSubject<string[]>([]);
  public onlineUsers$ = this.onlineUsersSubject.asObservable();

  constructor(
    private encryptionService: EncryptionService, 
    private keyService: KeyStorageService, 
    private githubService: GithubService,
    private authService: AuthService,
    private router: Router, 
    private utilityService: UtilityService
  ) {
    this.createConnection();
    this.startConnection();
    this.startMessageSetup();
  }

  private createConnection() {
    var token = localStorage.getItem('jwt_token') ?? '';
    const options: IHttpConnectionOptions = {
      accessTokenFactory: () => {
        return token;
      }
    };
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.chatHubUrl, options)
      .build();
  }

  private startConnection() {
    if (this.authService.isTokenExpired()) {
      this.authService.logout();
      this.router.navigate(['/login']);
      this.utilityService.openSnackBar('Token has expired. Please login again');
      return;
    }
    if (this.hubConnection.state === signalR.HubConnectionState.Disconnected) {
      this.hubConnection.start()
        .then(() => console.log('Connection started'))
        .catch(err => {
          console.log('Error while starting connection: ' + err);
          setTimeout(() => this.startConnection(), 5000); // Retry connection after 5 seconds
        });
    }
  
    this.hubConnection.onreconnecting(error => {
      console.log(`Reconnecting: ${error}`);
    });
  
    this.hubConnection.onreconnected(connectionId => {
      console.log(`Reconnected: ${connectionId}`);
    });
  
    this.hubConnection.onclose(error => {
      console.log(`Connection closed: ${error}`);
      setTimeout(() => this.startConnection(), 5000); // Retry connection after 5 seconds
    });
  }

  private startMessageSetup(){
    this.hubConnection.on('ReceiveMessage', (user, message) => {
      this.addMessage(user, `${user}: ${message}`);
    });

    this.hubConnection.on('ReceivePrivateMessage', (user, message) => {
      this.addMessage(user, message);
    });

    this.hubConnection.on('UserConnected', (username: string) => {
      this.addOnlineUser(username);
    });

    this.hubConnection.on('UserDisconnected', (username: string) => {
      this.removeOnlineUser(username);
    });

    this.hubConnection.on('UpdateUserList', (users: string[]) => {
      this.onlineUsersSubject.next(users);
    });
  }
  

  public stopConnection() {
    if (this.hubConnection.state !== signalR.HubConnectionState.Disconnected) {
      this.hubConnection.stop()
        .then(() => console.log('Connection stopped'))
        .catch(err => console.log('Error while stopping connection: ' + err));
    }
  }
  private addMessage(sender: string, message: string) {
    const decipheredMessage = this.encryptionService.symmetricDecryption(message);
    if(decipheredMessage != null){
      const messagesData: Message[] = JSON.parse(decipheredMessage) as Message[];
    
    const privateKey = this.keyService.retrieveKey() ?? '';
    const device = this.keyService.retrieveDeviceNumber() ?? '';
    if(privateKey == null || device == null)
      throw new Error('Missing Private key or device info');
    
    var messageForCurrDevice!: Message;
    var val = messagesData.find(x => x.device == device);
    if(val != undefined)
      messageForCurrDevice = val;

    this.githubService.getPublicKey(sender).subscribe(res => {
      var response = JSON.parse(JSON.stringify(res));
      var keys = JSON.parse(window.atob(response.content)) as UserPublicKey[];
      var decryptedMessage = this.decryptMessage(keys, messageForCurrDevice.message, privateKey);
      if(decryptedMessage != null){
        const chatInfo: ChatInfo = { sender: sender, message: decryptedMessage, time: Date.now(), recipient: 'self' };
        const chats = this.messagesSubject.value;
        chats.push(chatInfo);
        this.messagesSubject.next(chats);
        this.utilityService.openSnackBar(`${sender} has sent you a message`);
      }
    });
    }
  }

  private decryptMessage = (keys: UserPublicKey[], message: string, privateKey: string):string | null => {
    var decryptedMessage: string|null = null;
    for (let i = 0; i < keys.length; i++) {
      try {
        decryptedMessage = this.encryptionService.decryptMessage(message, privateKey, keys[i].key);
        if (decryptedMessage) {
          return decryptedMessage;
        }
      } catch (error) {
        // Handle decryption error if necessary, otherwise, continue to the next key
      }
    }
    return decryptedMessage;
  }

  public sendMessage(user: string, message: string) {
    if (this.authService.isTokenExpired()) {
      this.authService.logout();
      this.router.navigate(['/login']);
      this.utilityService.openSnackBar('Token has expired. Please login again');
      return;
    }
    this.hubConnection.invoke('SendMessageToUser', user, message)
      .catch(err => console.error(err));
  }

  public sendMessageToGroup(groupName: string, user: string, message: string) {
    this.hubConnection.invoke('SendMessageToGroup', groupName, user, message)
      .catch(err => console.error(err));
  }

  public joinGroup(groupName: string) {
    this.hubConnection.invoke('AddToGroup', groupName)
      .catch(err => console.error(err));
  }

  public leaveGroup(groupName: string) {
    this.hubConnection.invoke('RemoveFromGroup', groupName)
      .catch(err => console.error(err));
  }

  public searchUsers(query: string): string[] {
    const users = this.onlineUsersSubject.value;
    return users.filter(user => user.toLowerCase().includes(query.toLowerCase()));
  }

  private addOnlineUser(username: string) {
    const users = this.onlineUsersSubject.value;
    if (!users.includes(username)) {
      users.push(username);
      this.onlineUsersSubject.next(users);
    }
  }

  private removeOnlineUser(username: string) {
    console.log(username + " has signed out");
    const users = this.onlineUsersSubject.value;
    const index = users.indexOf(username);
    if (index > -1) {
      users.splice(index, 1);
      this.onlineUsersSubject.next(users);
      this.utilityService.openSnackBar(`${username} has signed out`)
    }
  }
}
