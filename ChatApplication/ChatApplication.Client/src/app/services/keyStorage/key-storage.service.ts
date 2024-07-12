import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KeyStorageService {
  private basePath = '/pub-keys';

  constructor(private db: AngularFireDatabase) { }

  addItem(item: any): void {
    this.db.list(this.basePath).push(item);
  }

  getItems(): Observable<any[]> {
    return this.db.list(this.basePath).valueChanges();
  }

  getItem(key: string): Observable<any> {
    return this.db.object(`${this.basePath}/${key}`).valueChanges();
  }

  updateItem(key: string, value: any): void {
    this.db.list(this.basePath).update(key, value);
  }

  deleteItem(key: string): void {
    this.db.list(this.basePath).remove(key);
  }
}
