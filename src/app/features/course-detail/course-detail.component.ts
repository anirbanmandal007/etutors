import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { ActivatedRoute } from '@angular/router';
import { FirestoreService } from '../../core/services/firestore.service';
import { CarouselModule } from 'primeng/carousel';
import { CommentBoxComponent } from '../comment-box/comment-box.component';
import { NotificationService } from '../../core/services/notification.service';
import { SpinnerService } from '../../core/services/spinner.service';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { RatingModule } from 'primeng/rating';
import { ChatWindowComponent } from '../../shared/chat-window/chat-window.component';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [FormsModule, HeaderComponent, ChatWindowComponent, CarouselModule, CommentBoxComponent, DialogModule, CheckboxModule, RatingModule],
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.scss'
})
export class CourseDetailComponent implements OnInit {
  courseId: any
  loggedInUser: any = JSON.parse(sessionStorage.getItem("user") || "[]");
  courseDetails: any;
  authorDetails: any;
  showBookingRequestsDialogVisible: boolean = false;
  showConfirmedStudentsDialogVisible: boolean = false;
  selectedBookingRequests: any[] = [];
  visible: boolean = false;
  ratingValue!: number;
  userProvidedRating!: number
  reviewComment = "";
  isChatWindowClosed = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private _fsService: FirestoreService,
    private _spinnerService: SpinnerService,
    private _notificationService: NotificationService
  ) {}
  

  showBookingRequestsDialog() {
    this.showBookingRequestsDialogVisible = true;
  }

  showConfirmedStudentsDialog() {
    this.showConfirmedStudentsDialogVisible = true;
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.courseId = params['id'];
      // alert(this.docId);
    });
    this.getCourseDetail();
  }

  getCourseDetail() {
    this._spinnerService.showSpinner();
    this._fsService.getCourseDetailsById(this.courseId).then((doc: any) => {
      if (doc.exists) {
        this.courseDetails = doc.data();
        this.courseDetails.scheduledDates[0] = this.courseDetails.scheduledDates[0].toDate();
        this.courseDetails.scheduledDates[1] = this.courseDetails.scheduledDates[1].toDate();
        this.courseDetails.scheduledTime = this.courseDetails.scheduledTime.toDate();

        if(this.courseDetails.ratings) {
          this.courseDetails.ratingsAvg = Object.values(this.courseDetails.ratings).reduce((sum: number, item: any) => sum + item.rating, 0) / this.courseDetails.ratings.length;
        }

        // map current user's rating to top
        if(this.courseDetails.ratings?.length > 0) {
          let index = this.courseDetails.ratings.findIndex((el: any) => el.email === this.loggedInUser.email);
          if(index > -1) {
            this.courseDetails.ratings.unshift(this.courseDetails.ratings.splice(index, 1)[0]);
          }
        } else {
          this.courseDetails.ratings = [];
        }
        this.getTutorDetails();
      } else {
        this._notificationService.error("There is no document!");
      }
      this._spinnerService.hideSpinner();
    }).catch((error: any) => {
      this._spinnerService.hideSpinner();
      this._notificationService.error("There was an error getting your document:");
    });

  }

  getTutorDetails() {
    this._spinnerService.showSpinner();
    this._fsService.getUserByEmail(this.courseDetails.mentor).subscribe((docs: any) => {
      docs.forEach((doc: any) => {
        this.authorDetails = doc.payload.doc.data();
        console.log(this.authorDetails)
      });
      this._spinnerService.hideSpinner();
    });
  }

  acceptBookingRequest(student: any) {
    const allBookedStudents = this.courseDetails.bookedStudents.booked;
    const updatedBookedStudents = allBookedStudents.filter((el: any) => el.email !== student.email);
    const approvedStudents = this.courseDetails?.bookedStudents?.confirmed || [];
    approvedStudents.push(student);
    this.courseDetails.bookedStudents.booked = updatedBookedStudents;
    this.courseDetails.bookedStudents.confirmed = approvedStudents;
    this._fsService.updateCourseById(this.courseId, this.courseDetails).then((res: any) => {
      this._notificationService.success('Booking accepted successfully!');
    }).catch((e: any) => {
      this._notificationService.error('Something went wrong!');
    });
  }

  rejectBookingRequest(student: any) {
    const allBookedStudents = this.courseDetails.bookedStudents.booked;
    const updatedBookedStudents = allBookedStudents.filter((el: any) => el.email !== student.email);
    this.courseDetails.bookedStudents.booked = updatedBookedStudents;
    this._fsService.updateCourseById(this.courseId, this.courseDetails).then((res: any) => {
      this._notificationService.success('Booking rejected successfully!');
    }).catch((e: any) => {
      this._notificationService.error('Something went wrong!');
    });
  }

  submitRating() {
    if(!this.ratingValue) {
      this._notificationService.error('Please select rating!');
      return;
    }
    const ratings = this.courseDetails.ratings?.length ?  this.courseDetails.ratings : [];
    ratings.push({
      rating: this.ratingValue,
      comment: this.reviewComment,
      userPhoto: this.loggedInUser.profileImage,
      fullName: this.loggedInUser.name + ' ' + this.loggedInUser.lastname,
      email: this.loggedInUser.email
    });
    this.courseDetails.ratings = ratings;
    this._fsService.updateCourseById(this.courseId, this.courseDetails).then((res: any) => {
      this._notificationService.success('Rating submitted successfully!');
      this.getCourseDetail();
    }).catch((e: any) => {
      this._notificationService.error('Something went wrong!');
    })
  }

  openChatroom() {
    this.isChatWindowClosed = true;
    setTimeout(() => {
      this.isChatWindowClosed = false;
    }, 100);
  }
}
