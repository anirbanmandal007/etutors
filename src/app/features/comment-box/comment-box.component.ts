import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../core/services/firestore.service';
import { NotificationService } from '../../core/services/notification.service';
import { SpinnerService } from '../../core/services/spinner.service';

@Component({
  selector: 'app-comment-box',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './comment-box.component.html',
  styleUrl: './comment-box.component.scss'
})
export class CommentBoxComponent {
  replyMainComment = false;
  replySubComment = false;
  mainComment = '';
  @Input() courseId: any;
  courseDetails: any;
  loggedInUser: any = JSON.parse(sessionStorage.getItem("user") || "[]");
  replyComment = '';

  constructor(
    private _fsService: FirestoreService,
    private _notificationService: NotificationService,
    private _spinnerService: SpinnerService
  ) {}
  
  ngOnInit() {
    this.getCourseDetails();
    const comments = [
      {
        fullname: '',
        email: '',
        comment: '',
        courseId: '',
        userType: '',
        userPhoto: '',
        replies: [
          {
            fullname: '',
            email: '',
            comment: '',
            courseId: '',
            userType: '',
            userPhoto: ''
          }
        ]
      }
    ]
  }

  getCourseDetails() {
    this._spinnerService.showSpinner();
    this._fsService.getCourseDetailsById(this.courseId).then((doc: any) => {
      if (doc.exists) {
        this.courseDetails = doc.data();
        console.log(this.courseDetails);
      } else {
        this._notificationService.error("There is no document!");
      }
      this._spinnerService.hideSpinner();
    }).catch((error: any) => {
      this._notificationService.error("There was an error getting your document:");
      this._spinnerService.hideSpinner();
    });
  }

  addMainComment() {
    if(!this.courseDetails.comments || this.courseDetails.comments?.length === 0) {
      this.courseDetails.comments = [];
    }
    this.courseDetails.comments.push(
      {
        fullname: this.loggedInUser.name + ' ' + this.loggedInUser.lastname,
        email: this.loggedInUser.email,
        comment: this.mainComment,
        courseId: this.courseId,
        userType: this.loggedInUser.userType,
        userPhoto: this.loggedInUser.profileImage,
        replies: []
      }
    )
    this._spinnerService.showSpinner();
    this._fsService.updateCourseById(this.courseId, this.courseDetails).then((res: any) => {
      this.mainComment = '';
      this.getCourseDetails();
    }).catch(e => {
      this._spinnerService.hideSpinner();
    });
  }

  addRepliesToComment(comment: object, index: number) {
    if(!this.courseDetails.comments[index].replies || this.courseDetails.comments[index].replies?.length === 0) {
      this.courseDetails.comments[index].replies = [];
    }

    this.courseDetails.comments[index].replies.push({
      fullname: this.loggedInUser.name + ' ' + this.loggedInUser.lastname,
      email: this.loggedInUser.email,
      comment: this.replyComment,
      courseId: this.courseId,
      userType: this.loggedInUser.userType,
      userPhoto: this.loggedInUser.profileImage,
    });

    this._fsService.updateCourseById(this.courseId, this.courseDetails).then((res: any) => {
      this.replyComment = '';
      this.replyMainComment = false;
      this.getCourseDetails();
    }).catch(e => {
      this._spinnerService.hideSpinner();
    });
  }
}
