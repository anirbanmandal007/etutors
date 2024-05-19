import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Database, getDatabase, ref, set, onValue, orderByChild, query } from "firebase/database";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import { Chat } from '../../core/models/chat';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs';
import { SpinnerComponent } from '../spinner/spinner.component';
import { SpinnerService } from '../../core/services/spinner.service';
@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.scss'
})
export class ChatWindowComponent {
  @Input() courseId!: string;
  @Input() courseName!: string;
  @Input() mentorEmail!: string;
  loggedInUser = JSON.parse(sessionStorage.getItem("user") || "[]");
  app!: FirebaseApp;
  db!: Database;
  form!: FormGroup;
  username = '';
  message = '';
  chats: Chat[] = [];
  isNotMinimized = true;
  attachmentFile: any;
  @Input() isChatWindowClosed!: boolean;
  @ViewChild('file') file!: ElementRef;
  constructor(
    private formBuilder: FormBuilder, 
    private storage: AngularFireStorage,
    private _spinnerService: SpinnerService) {
      this.app = initializeApp(environment.firebase);
      this.db = getDatabase(this.app);
      this.form = this.formBuilder.group({
        'message' : ['', Validators.required],
        'email' : [this.loggedInUser.email, Validators.required],
        'name': [this.loggedInUser.name + ' ' + this.loggedInUser.lastname, Validators.required],
        'profImg': [this.loggedInUser.profileImage],
      });
  }

  ngOnInit() {
    const chatsRef = ref(this.db, `chats/${this.courseId}`);
    onValue(chatsRef, (snapshot: any) => {
      this.chats = [];
      const data = snapshot.val();
      for(let id in data) {
        if (!this.chats.map(chat => chat.id).includes(id)) {
          this.chats.push(data[id])
        }
      }
      setTimeout(this.updateScroll, 100);
    });
  }

  ngOnChanges() {
    console.log('chat window value changes');
    setTimeout(this.updateScroll, 100);
  }

  onChatSubmit(form: any) {
    if(this.attachmentFile) {
      this.uploadAttachment();
    }
    if(!form.message) {return}
    const chat = form;
    chat.timestamp = new Date().toString();
    // chat.id = uuidv4();
    set(ref(this.db, `chats/${this.courseId}/${this.chats.length + 1}`), chat);
    this.form = this.formBuilder.group({
      'message' : [],
      'email' : [chat.email],
      'name' : [chat.name],
      'profImg' : [chat.profImg],
    });
    setTimeout(this.updateScroll, 100);
  }

  updateScroll() {
    const element: any = document.querySelector(".msg-page");
    if(!element) return;
    element.scrollTop = element.scrollHeight;
  }


  onFileSelected(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.attachmentFile = event.target.files[0];
      var reader = new FileReader();

      reader.readAsDataURL(event.target.files[0]); // read file as data url

      reader.onload = (event: any) => { // called once readAsDataURL is completed
        console.log(event.target.result);
      }
    }
  }

  downloadURL: any;
  uploadAttachment() {
  // Upload attachment image to Firestore storage
  this._spinnerService.showSpinner();
  const n = Date.now();
  const filePath = `chatroom/${this.courseId}/${this.attachmentFile.name}`;
  const fileRef = this.storage.ref(filePath);
  const task = this.storage.upload(
    filePath,
    this.attachmentFile,
  );
  task
    .snapshotChanges()
    .pipe(
      finalize(() => {
        this.downloadURL = fileRef.getDownloadURL();
        this.downloadURL.subscribe((url: any) => {
          if (url) {
            this.form.controls['message'].setValue(`<a href=${url}>${this.attachmentFile?.name}</a>`);
            this.onChatSubmit(this.form.value);
            this.resetAttachment();
            this._spinnerService.hideSpinner();
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

  resetAttachment() {
    this.attachmentFile = undefined;
    this.file.nativeElement.value = '';
  }


}
