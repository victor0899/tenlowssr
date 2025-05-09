import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'badge-notification',
  templateUrl: './badge-notification.component.html',
  styleUrls: ['./badge-notification.component.scss']
})
export class BadgeNotificationComponent implements OnDestroy {

  unreadNotifications:number = 0;
  eventAuth!: Subscription;
  evntReduceNotification: Subscription;
  constructor(
    private userService: UserService,
    private authService: AuthService
  ){

    this.unreadNotifications =  this.userService.unreadNotifications;

    this.eventAuth = this.authService.eventAuthUser.subscribe( user => {
      if (user) {
        this.unreadNotifications =  this.userService.unreadNotifications;
      } else {
        this.unreadNotifications = 0;
      }
    });

    this.evntReduceNotification =  this.userService.evntReduceNotification.subscribe( data => {
      if(data.isReduce){
        this.unreadNotifications = this.unreadNotifications - 1;
      } else {
        this.unreadNotifications = data.total;
      }
    });

  }
  ngOnDestroy(): void {
    this.eventAuth.unsubscribe();
    this.evntReduceNotification.unsubscribe();
  }
}
