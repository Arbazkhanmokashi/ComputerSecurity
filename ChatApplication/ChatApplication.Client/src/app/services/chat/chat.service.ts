import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { IHttpConnectionOptions } from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { ChatInfo, Message, UserMessageDTO, UserPublicKey } from '../../models/user/user';
import { EncryptionService } from '../encryption/encryption.service';
import { KeyStorageService } from '../keyStorage/key-storage.service';
import { GithubService } from '../github/github.service';
import { environment } from '../../../environments/environment';

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

  constructor(private encryptionService: EncryptionService, private keyService: KeyStorageService, private githubService: GithubService) {
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
    console.log(message);
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

    console.log(messageForCurrDevice);
    this.githubService.getPublicKey(sender).subscribe(res => {
      var response = JSON.parse(JSON.stringify(res));
      var keys = JSON.parse(window.atob(response.content)) as UserPublicKey[];
      keys.forEach(pubKey => {
        console.log(pubKey.device);
        try{
          var decryptedMessage = this.encryptionService.decryptMessage(messageForCurrDevice.message, privateKey, pubKey.key);
          console.log(decryptedMessage);
          const chatInfo: ChatInfo = { sender: sender, message: decryptedMessage };
          const chats = this.messagesSubject.value;
          chats.push(chatInfo);
          this.messagesSubject.next(chats);
          return false;
        }catch(e){return true;}
      });
    });
    }
  }

  private decryptMessage = async (sender: string, message: string):Promise<string | null> => {
    var decryptedMessage: string|null = null;
    
    return decryptedMessage;
  }

  public sendMessage(user: string, message: string) {
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
    const users = this.onlineUsersSubject.value;
    const index = users.indexOf(username);
    if (index > -1) {
      users.splice(index, 1);
      this.onlineUsersSubject.next(users);
    }
  }
}
