import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { HeaderComponent } from "../header/header.component";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { AngularFireStorage } from "@angular/fire/compat/storage";
import { Observable, debounceTime, finalize, map, of } from "rxjs";
import { BannerComponent } from "../../shared/banner/banner.component";
import { ChipsModule } from 'primeng/chips';
import { AccountService } from "../../core/services/account.service";
import { NotificationService } from "../../core/services/notification.service";
import { SpinnerService } from "../../core/services/spinner.service";

@Component({
  selector: "app-account",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    HeaderComponent,
    BannerComponent,
    ChipsModule,
    FormsModule,
  ],
  templateUrl: "./account.component.html",
  styleUrl: "./account.component.scss",
})
export class AccountComponent {
  accountForm!: FormGroup;
  loggedInUser = JSON.parse(sessionStorage.getItem("user") || "[]");
  downloadURL!: Observable<string>;
  fileUrl!: string;
  profileImageFile: any;
  filePath!: string;
  type!: string;
  successMessage = "All details saved successfully!";
  errorMessage = "Something went wrong!";
  userDetails: any;
  previewUrl: any;
  constructor(
    private fb: FormBuilder,
    private afs: AngularFirestore,
    private storage: AngularFireStorage,
    private _accountService: AccountService,
    private _notificationService: NotificationService,
    private _spinnerService: SpinnerService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initializeAccountForm();
    this.patchAccountForm();
  }

  initializeAccountForm() {
    this.accountForm = this.fb.group({
      name: ["", Validators.required],
      lastname: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      phone: ["", Validators.required],
      age: [""],
      degree: [""],
      subjects: [[]],
      subjectsToLearn: [[]],
    });
  }

  patchAccountForm() {
    const users = this.afs
      .collection("users", (ref) =>
        ref.where("email", "==", this.loggedInUser.email),
      )
      .valueChanges();
    users.subscribe((users: any) => {
      this.userDetails = users[0];
      this.accountForm.patchValue({
        name: users[0].name,
        lastname: users[0].lastname,
        email: users[0].email,
        phone: users[0].phone,
        age: users[0].age,
        degree: users[0].degree,
        subjects: users[0].subjects,
        subjectsToLearn: users[0].subjectsToLearn,
      });
      this.fileUrl = users[0].profileImage;
      this.previewUrl = users[0].profileImage;
      sessionStorage.setItem('user', JSON.stringify(users[0]));
    });
  }

  updateAccount() {
    this._spinnerService.showSpinner();
    if (this.profileImageFile) {
      if (this.fileUrl) {
        this.deleteExistingImage();
      }
      this.uploadNewProfileImage();
    } else {
      // No changes in profile picture
      this.saveAllAccountData();
    }
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.profileImageFile = event.target.files[0];
      var reader = new FileReader();

      reader.readAsDataURL(event.target.files[0]); // read file as data url

      reader.onload = (event: any) => { // called once readAsDataURL is completed
        this.previewUrl = event.target.result;
      }
    }
  }

  deleteExistingImage() {
    // Delete existing profile image linked with the current user
    if (this.fileUrl) {
      this.storage.storage.refFromURL(this.fileUrl).delete();
    }
  }

  uploadNewProfileImage() {
    // Upload new profile image to Firestore storage
    const n = Date.now();
    this.filePath = `profileImages/${n}`;
    const fileRef = this.storage.ref(this.filePath);
    const task = this.storage.upload(
      `profileImages/${n}`,
      this.profileImageFile,
    );
    task
      .snapshotChanges()
      .pipe(
        finalize(() => {
          this.downloadURL = fileRef.getDownloadURL();
          this.downloadURL.subscribe((url) => {
            if (url) {
              this.fileUrl = url;
              this.previewUrl = url;
              this.saveAllAccountData();
            }
          });
        }),
      )
      .subscribe((url) => {
        if (url) {
          console.log(url);
        }
      });
  }

  saveAllAccountData() {
    let doc = this.afs.collection("users", (ref) =>
      ref.where("email", "==", this.loggedInUser.email),
    );
    let subscribe = doc
      .snapshotChanges()
      .pipe(
        // debounceTime(2000),
        map((actions) =>
          actions.map((a) => {
            const data: any = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id, ...data };
          }),
        ),
      )
      .subscribe((_doc: any) => {
        let id = _doc[0].id; //first result of query [0]

        // Save Account details with reference of profile image url

        const _value: any = {
          name: this.accountForm.value.name,
          lastname: this.accountForm.value.lastname,
          phone: this.accountForm.value.phone,
          age: this.accountForm.value.age,
          degree: this.accountForm.value.degree
        };
        if(this.loggedInUser.userType === 'tutor') {
          _value.subjects = this.accountForm.value.subjects;
        }
        if(this.loggedInUser.userType === 'student') {
          _value.subjectsToLearn = this.accountForm.value.subjectsToLearn;
        }
        if (this.fileUrl) {
          _value.profileImage = this.fileUrl;
        }
        let updateCallbackCount = 0;
        this.afs.doc(`users/${id}`).update(_value).then((res: any) => {
          // updateCallbackCount++;
          // if(updateCallbackCount === 1) { // Since update always return callback twice
          //   return;
          // }
          this._spinnerService.hideSpinner();
          this._notificationService.success('Account updated successfully!');
          this.patchAccountForm();
          this._accountService.accountDetailsUpdated.next(Date.now());
          this.router.navigate(['/home']);
        }).catch((e: any) => {
          this._spinnerService.hideSpinner();
          this._notificationService.error('Something went wrong!');
        });
        // this.type = "success";
        subscribe.unsubscribe();
      });
  }
}
