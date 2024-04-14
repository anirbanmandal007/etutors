import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Router, RouterModule } from "@angular/router";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { getAuth, signOut } from "firebase/auth";
import { AccountService } from "../../core/services/account.service";
import { NotificationService } from "../../core/services/notification.service";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [FontAwesomeModule, CommonModule, RouterModule],
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.scss",
})
export class HeaderComponent {
  faUser = faUser;
  loggedInUser = JSON.parse(sessionStorage.getItem("user") || "[]");
  constructor(
    public afAuth: AngularFireAuth, // Inject Firebase auth service
    private router: Router,
    private _accountService: AccountService,
    private _notificationService: NotificationService
  ) {
    this._accountService.accountDetailsUpdated.subscribe((res: any) => {
      setTimeout(() => {
        this.loggedInUser = JSON.parse(sessionStorage.getItem("user") || "[]");
      }, 500);
    });
  }

  logout() {
    this.afAuth
      .signOut()
      .then(() => {
        this._notificationService.success("Logged out successfully!");
        sessionStorage.clear();
        this.router.navigate(["/"]);
      })
      .catch((e) => {
        this._notificationService.error("Something went wrong!");
      });
  }
}
