import { Component, NgZone } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from "@angular/fire/compat/firestore";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Observable, map } from "rxjs";
import { BannerComponent } from "../../shared/banner/banner.component";
import { CommonModule } from "@angular/common";
import { AccountService } from "../../core/services/account.service";

@Component({
  selector: "app-signup",
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, BannerComponent],
  templateUrl: "./signup.component.html",
  styleUrl: "./signup.component.scss",
})
export class SignupComponent {
  signupForm: FormGroup;
  private userCollection!: AngularFirestoreCollection;
  users$!: Observable<any>;
  isUserCreated: any = undefined;
  userCreationSuccessMsg =
    "User created successfully! User your email and password to login";
  userCreationErrorMsg = "User creation failed! Something went wrong";
  userAlreadyExist: any;
  userAlreadyExistAlertMsg =
    "You are already registered with us! If you forgot your credentials please click on forgot password link.";

  constructor(
    public afs: AngularFirestore, // Inject Firestore service
    public afAuth: AngularFireAuth, // Inject Firebase auth service
    public router: Router,
    public ngZone: NgZone, // NgZone service to remove outside scope warning
    private fb: FormBuilder,
    private _accountService: AccountService
  ) {
    this.signupForm = this.fb.group({
      name: ["", Validators.required],
      lastname: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      phone: ["", Validators.required],
      userType: ["", Validators.required],
      password: ["", [Validators.required, Validators.minLength(6)]],
      confPass: ["", [Validators.required, Validators.minLength(6)]],
    });
  }

  // isUserAlreadyExists() {
  //   // let usersDoc = this.afs.firestore.collection(`users`);
  //   // usersDoc.get().then((querySnapshot) => {
  //   //   querySnapshot.forEach((doc) => {
  //   //     console.log(doc.id, "=>", doc.data());
  //   //   });
  //   // });

  //   const users = this.afs.collection('users', ref => ref.where("email", "==", this.signupForm.value.email)).valueChanges();
  //   users.subscribe((users: any) => {
  //     if(users.length === 0) {
  //       this.userAlreadyExist = false;
  //       this.signUp();
  //     } else {
  //       if(this.userAlreadyExist === undefined) {
  //         this.userAlreadyExist = true;
  //       }
  //     }
  //   });
  // }

  validateSignupForm() {
    this.userAlreadyExist = undefined;
    if (this.signupForm.value.password !== this.signupForm.value.confPass) {
      return alert("Password and confirm password should match!");
    }
    this.signUp();
    // this.isUserAlreadyExists();
  }

  signUp() {
    this.afAuth
      .createUserWithEmailAndPassword(
        this.signupForm.value.email,
        this.signupForm.value.password,
      )
      .then((res: any) => {
        sessionStorage.setItem("token", res.user.multiFactor.user.accessToken);
        this.afs.firestore
          .collection("users")
          .add({
            name: this.signupForm.value.name,
            lastname: this.signupForm.value.lastname,
            email: this.signupForm.value.email,
            phone: this.signupForm.value.phone,
            userType: this.signupForm.value.userType,
          })
          .then((user) => {
            this.isUserCreated = true;
            const loggedInUserEmail = res.user.multiFactor.user.email;

            // Set logged in user details in session storage
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

            this.router.navigate(["/home"]);
          })
          .catch((e) => {
            this.isUserCreated = false;
          });
      })
      .catch((e) => {
        if (e?.error?.errors[0]?.message === "EMAIL_EXISTS") {
          this.userAlreadyExist = true;
        } else {
          this.isUserCreated = false;
        }
      });
  }
}
