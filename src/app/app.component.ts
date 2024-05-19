import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterOutlet } from "@angular/router";
import { environment } from "../environments/environment";
import { getAnalytics } from "firebase/analytics";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NotificationComponent } from "./shared/notification/notification.component";
import { SpinnerService } from "./core/services/spinner.service";
import { SpinnerComponent } from "./shared/spinner/spinner.component";
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Database, getDatabase, ref, set, onValue  } from "firebase/database";
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import { Chat } from "./core/models/chat";

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, NotificationComponent, SpinnerComponent, 
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent {
  title = "e-tutors";
  showSpinner = false;

  app!: FirebaseApp;
  db!: Database;
  form!: FormGroup;
  username = '';
  message = '';
  chats: Chat[] = [];

  constructor(
    private _spinnerService: SpinnerService,
    private formBuilder: FormBuilder
  ) {
    this._spinnerService.spinner$.subscribe((data: boolean) => {
      setTimeout(() => {
        this.showSpinner = data ? data : false;
      });
      console.log(this.showSpinner);
    });

    this.app = initializeApp(environment.firebase);
    this.db = getDatabase(this.app);
    this.form = this.formBuilder.group({
      'message' : [],
      'username' : []
    });
  }

  ngOnInit() {
    const chatsRef = ref(this.db, 'chats');
    onValue(chatsRef, (snapshot: any) => {
      const data = snapshot.val();
      for(let id in data) {
        if (!this.chats.map(chat => chat.id).includes(id)) {
          this.chats.push(data[id])
        }
      }
    });
  }

  onChatSubmit(form: any) {
    const chat = form;
    chat.timestamp = new Date().toString();
    chat.id = uuidv4();
    set(ref(this.db, `chats/${chat.id}`), chat);
    this.form = this.formBuilder.group({
      'message' : [],
      'username' : [chat.username],
    });
  }
}
