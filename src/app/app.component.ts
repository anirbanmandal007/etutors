import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterOutlet } from "@angular/router";
import { environment } from "../environments/environment";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NotificationComponent } from "./shared/notification/notification.component";
import { SpinnerService } from "./core/services/spinner.service";
import { SpinnerComponent } from "./shared/spinner/spinner.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, NotificationComponent, SpinnerComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent {
  title = "e-tutors";
  showSpinner = false;

  constructor(
    private _spinnerService: SpinnerService
  ) {
    this._spinnerService.spinner$.subscribe((data: boolean) => {
      setTimeout(() => {
        this.showSpinner = data ? data : false;
      });
      console.log(this.showSpinner);
    });
  }

  ngOnInit() {}
}
