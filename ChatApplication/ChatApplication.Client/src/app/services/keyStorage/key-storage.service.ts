import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class KeyStorageService {
  private privateKeyStorageName = "user-key";
  private deviceNumberStorageName = "device";
  private secretKey = environment.secretKey;

  constructor() { }

  storeKey = (key:string) =>{
    const val = window.btoa(key)
    const ciphertext = CryptoJS.AES.encrypt(val, this.secretKey).toString();
    localStorage.setItem(this.privateKeyStorageName, ciphertext);
  }

  retrieveKey = () => {
    const encryptedValue = localStorage.getItem(this.privateKeyStorageName);
    if (encryptedValue) {
      try {
        const bytes = CryptoJS.AES.decrypt(encryptedValue, this.secretKey);
        var val = bytes.toString(CryptoJS.enc.Utf8);
        return window.atob(val);
      } catch (e) {
        console.error('Error decrypting local storage item', e);
        return null;
      }
    }
    return null;
  }

  deleteKeyAndDevice = () => {
    localStorage.removeItem(this.deviceNumberStorageName);
    localStorage.removeItem(this.privateKeyStorageName);
  }

  storeDeviceNumber = (key:string) =>{
    localStorage.setItem(this.deviceNumberStorageName, key);
  }

  retrieveDeviceNumber = () => {
    return localStorage.getItem(this.deviceNumberStorageName);
  }
}