import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  accountDetailsUpdated = new BehaviorSubject<any>(Date.now());

  constructor() { }

}
