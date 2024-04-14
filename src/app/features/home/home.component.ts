import { Component } from "@angular/core";
import { HeaderComponent } from "../header/header.component";
import { CommonModule } from "@angular/common";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { Router } from "@angular/router";
import { AccountService } from "../../core/services/account.service";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [HeaderComponent, CommonModule],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.scss",
})
export class HomeComponent {
  loggedInUser = JSON.parse(sessionStorage.getItem("user") || "[]");

  constructor(
    public afAuth: AngularFireAuth, // Inject Firebase auth service
    private router: Router,
    private _accountService: AccountService
  ) {
    this._accountService.accountDetailsUpdated.subscribe((res: any) => {
      setTimeout(() => {
        this.loggedInUser = JSON.parse(sessionStorage.getItem("user") || "[]");
      }, 500);
    });
  }
}
