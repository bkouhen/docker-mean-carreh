import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { Subscription } from 'rxjs';
import { NotificationService } from 'src/app/notification.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  isLoading: boolean = false;
  users: any = [];
  usersSub: Subscription;

  constructor(private authService: AuthService, private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.authService.getUsers();
    this.usersSub = this.authService.usersUpdated.subscribe(
      (users) => {
        this.users = users;
        this.isLoading = false;
      },
      (errorMessage) => {
        console.log(errorMessage);
        this.isLoading = false;
      }
    )
  }

  updateUserReadStatus(user: any, id: string) {
    if (user.readStatus === 0) {
      console.log(id);
      user.readStatus = 1;
      user.read = 1;
      this.authService.updateUserReadStatus(id).subscribe(
        (resData) => {
          console.log(resData);
          this.notificationService.getNotifications();
        },
        (errorMessage) => {
          console.log(errorMessage);
        }
      );
    }
  }

  onDeleteUser(id: string) {
    this.authService.deleteUser(id).subscribe(
      (resData) => {
        console.log(resData);
        this.authService.getUsers();
      },
      (errorMessage) => {
        console.log(errorMessage);
        this.authService.getUsers();
      }
    );
  }

}
