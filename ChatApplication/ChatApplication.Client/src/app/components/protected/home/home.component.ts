import { Component, OnInit } from '@angular/core';
import { GithubService } from '../../../services/github/github.service';
import { EncryptionService } from '../../../services/encryption/encryption.service';
import { ChatInfo, Message, UserMessageDTO, UserPublicKey } from '../../../models/user/user';
import { ChatService } from '../../../services/chat/chat.service';
import { KeyStorageService } from '../../../services/keyStorage/key-storage.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  privateKey!:string|null;
  deviceNumber!:string|null;
  message = '';
  messages: ChatInfo[] = [];
  searchQuery = '';
  filteredUsers: string[] = [];
  selectedUser: string | null = null;

  constructor(
    private chatService: ChatService, 
    private githubService: GithubService, 
    private keyService: KeyStorageService,
    private encryptionService: EncryptionService
  ) {}

  ngOnInit(): void {
    this.privateKey = this.keyService.retrieveKey();
    this.deviceNumber = this.keyService.retrieveDeviceNumber();
    this.chatService.messages$.subscribe(messages => {
      this.messages = messages;
    });
    this.chatService.onlineUsers$.subscribe(users => {
      this.filteredUsers = users;
    });
    // this.chatService.joinGroup('default-group');
  }

  sendMessage(): void {
    var messages: Message[] = [];
    if (this.message.trim() && this.selectedUser) {
      //get the recipient's public key
      this.githubService.getPublicKey(this.selectedUser).subscribe(res => {
        var response = JSON.parse(JSON.stringify(res));
        var keys = JSON.parse(window.atob(response.content)) as UserPublicKey[];
        keys.forEach(pubKey => {
          if(this.privateKey != null){
            const msg = this.encryptionService.encryptMessage(this.message, this.privateKey, pubKey.key);
            var message: Message = { device: pubKey.device, message: msg };
            messages.push(message);
          }
        });
        const ciphertext = this.encryptionService.symmetricEncryption(JSON.stringify(messages));
        if(this.selectedUser != null){
          this.chatService.sendMessage(this.selectedUser, ciphertext);
          this.message = '';
        }
      });
      
      // messageData = { reciever: this.selectedUser, message: ciphertext, time: Date.now() }
      
    }
  }

  searchUsers(): void {
    this.filteredUsers = this.chatService.searchUsers(this.searchQuery);
  }

  selectUser(user: string): void {
    this.selectedUser = user;
  }

}