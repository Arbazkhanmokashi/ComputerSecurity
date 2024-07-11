import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KeyStorageService {

  constructor(private db: AngularFireDatabase) { }

  storePublicKey(userId: string, publicKey: string): Promise<void> {
    return this.db.object(`users/${userId}`).set({ publicKey });
  }

  getPublicKey(userId: string): Observable<any> {
    return this.db.object(`users/${userId}/publicKey`).valueChanges();
  }
}
