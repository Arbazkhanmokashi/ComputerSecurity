import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  constructor(private matSnackBar: MatSnackBar) { }

  getUniqueGUID = () : string => {
    function s4(): string {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return (
      s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4()
    );
  }

  openSnackBar(message: string) {
    this.matSnackBar.open(message, 'Dismiss', { duration: 3000 });
  }
}
