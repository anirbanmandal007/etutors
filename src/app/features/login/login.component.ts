import { Component, inject } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { AccountService } from "../../core/services/account.service";
import { NotificationService } from "../../core/services/notification.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
})
export class LoginComponent {
  loginForm: FormGroup;
  userSubsctiption: any;

  constructor(
    public afAuth: AngularFireAuth, // Inject Firebase auth service
    public afs: AngularFirestore,
    private fb: FormBuilder,
    private router: Router,
    private _accountService: AccountService,
    private _notificationService: NotificationService
  ) {
    this.loginForm = this.fb.group({
      email: ["", Validators.required],
      authPass: ["", Validators.required],
    });
    sessionStorage.clear();

    // Playground
    let a = [32, 44, 30, 4, 9, 34, 87, 56, 56, 22, 11, 33, 56];

    // a.sort((a, b) => {return a - b});

    // console.log(a[1])
    let swap;
    for (let i = 0; i < a.length; i++) {
      for(let j = 0; j<a.length;j++) {
        if (a[i] < a[j]) { // 32 < 44
          swap = a[i]; // swap = 32
          a[i] = a[j];
          a[j] = swap;
        }
      }
    }

    console.log(a);

  }

  signInWithEmailAndPassword() {
    this.afAuth
      .signInWithEmailAndPassword(
        this.loginForm.value.email,
        this.loginForm.value.authPass,
      )
      .then((userCredential: any) => {
        // Signed in
        sessionStorage.setItem(
          "token",
          userCredential.user.multiFactor.user.accessToken,
        );
        const loggedInUserEmail = userCredential.user.multiFactor.user.email;

        // Set logged in user details in session storage
        sessionStorage.removeItem("user");
        const users = this.afs
          .collection("users", (ref) =>
            ref.where("email", "==", loggedInUserEmail),
          )
          .valueChanges();
          users.subscribe((users: any) => {
          if (users.length === 0) {
            sessionStorage.setItem("user", "[]");
          } else {
            sessionStorage.setItem("user", JSON.stringify(users[0]));
            this._accountService.accountDetailsUpdated.next(Date.now());
          }
        });

        const user = userCredential.user;
        this._notificationService.success("Login successfull!");
        this.router.navigate(["/home"]);
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        this._notificationService.error("Bad credentials, please try again!");
      });
  }

  ngOnDestroy() {
    // this.userSubsctiption.unsubscribe();
  }
}
