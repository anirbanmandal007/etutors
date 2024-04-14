import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

@Component({
  selector: "app-forgot-password",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: "./forgot-password.component.html",
  styleUrl: "./forgot-password.component.scss",
})
export class ForgotPasswordComponent {
  email: string = "";

  constructor(private afAuth: AngularFireAuth) {}

  sendPwdResetMail() {
    this.afAuth
      .sendPasswordResetEmail(this.email)
      .then(() => {
        alert(
          "Password reset email has been sent successfully to your email address!",
        );
      })
      .catch((e) => {
        alert("Something went wrong!");
      });
  }
}
