import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { INotification, NotificationType } from '../../shared/notification/notification.component';
@Injectable({
    providedIn: 'root'
})
export class NotificationService {
constructor() { }
    
  private notification$: Subject<INotification> = new Subject<INotification>;
  
  success(message: string, duration: any = null) {
    this.notify(message, NotificationType.Success, duration);
  }
  warning(message: string, duration: any = null) {
    this.notify(message, NotificationType.Warning, duration);
  }
  error(message: string, duration: any = null) {
    this.notify(message, NotificationType.Error, duration);
  }
  private notify(message: string, type: NotificationType, duration: number) {
    duration = !duration ? 3000 : duration;
    this.notification$.next({
        message: message,
        type: type,
        duration: duration
    } as INotification);
  }
  get notification() {
    return this.notification$.asObservable();
  }
}