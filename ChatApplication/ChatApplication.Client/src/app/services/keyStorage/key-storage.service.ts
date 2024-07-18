import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class KeyStorageService {
  private privateKeyStorageName = "user-key";

  constructor() { }

  storeKey = (key:string) =>{
    localStorage.setItem(this.privateKeyStorageName, key);
  }

  retrieveKey = () => {
    return localStorage.getItem(this.privateKeyStorageName);
  }
}
