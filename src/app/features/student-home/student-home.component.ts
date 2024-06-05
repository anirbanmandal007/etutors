import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FirestoreService } from '../../core/services/firestore.service';
import { FormsModule } from '@angular/forms';
import { SpinnerService } from '../../core/services/spinner.service';
import { NotificationService } from '../../core/services/notification.service';
import { RouterModule } from '@angular/router';
import { getCourseStatus } from '../../core/utils/course-utils';
import { RatingModule } from 'primeng/rating';
declare var Razorpay: any;
@Component({
  selector: 'app-student-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RatingModule],
  templateUrl: './student-home.component.html',
  styleUrl: './student-home.component.scss'
})
export class StudentHomeComponent {

  courseSearch!: string;
  suggestedCourses: any = [];
  loggedInUser = JSON.parse(sessionStorage.getItem("user") || "[]");
  constructor(
    private _firestoreService: FirestoreService,
    private _spinnerService: SpinnerService,
    private _notificationService: NotificationService
  ) {}

  ngOnInit() {
    const searchArray = this.loggedInUser.subjectsToLearn || [''];
    this.searchCourses(searchArray);
  }

  searchCourses(searchArray?: object) {
    this.suggestedCourses = [];
    if(!searchArray) {
      searchArray = this.courseSearch.split(' ');
    }
    this._spinnerService.showSpinner();
    this._firestoreService.searchCourses(searchArray).subscribe((docs: any) => {
      docs.forEach((doc: any) => {
        if(this.suggestedCourses.filter((el: any) => el.docId === doc.payload.doc.id).length === 0) {
          this.suggestedCourses.push(
            {docId: doc.payload.doc.id, ...doc.payload.doc.data()}
          );
        }
      });
      this.suggestedCourses.map((course: any) => {
        course.scheduledDates[0] = typeof course.scheduledDates[0].getMonth !== 'function' ? course.scheduledDates[0].toDate() : course.scheduledDates[0];
        course.scheduledDates[1] = typeof course.scheduledDates[1].getMonth !== 'function' ? course.scheduledDates[1].toDate() : course.scheduledDates[1];
        if(course.ratings) {
          course.ratingsAvg = Object.values(course.ratings).reduce((sum: number, item: any) => sum + item.rating, 0) / course.ratings.length;
        }
      });
      this._spinnerService.hideSpinner();
      console.log(this.suggestedCourses);
    });
  }

  getCourseStatus(course: any) {
    return getCourseStatus(course);
  }

  bookCourse(course: any) {
    if(!course.bookedStudents || course.bookedStudents?.length === 0) {
      course.bookedStudents = {};
    }
    if(!course.bookedStudents?.booked) {
      
      course.bookedStudents.booked = []
    }
    const isAlreadyBooked = course.bookedStudents.booked.filter((el: any) => el.email === this.loggedInUser.email).length;
    if(isAlreadyBooked) return;
    course.bookedStudents.booked.push({
      name: this.loggedInUser.name + ' ' + this.loggedInUser.lastname,
      email: this.loggedInUser.email,
      profileImage: this.loggedInUser.profileImage || '',
      phone: this.loggedInUser.phone || ''
    });
    this._spinnerService.showSpinner();
    this._firestoreService.updateCourseById(course.docId, course).then((res: any) => {
      this._spinnerService.hideSpinner();
      this._notificationService.success('Booking request has been sent to the tutor. You can pay for this course once your request is approved', 10000);
    }).catch((e: any) => {
      this._spinnerService.hideSpinner();
      this._notificationService.error('Something went wrong');
    });
  }

  payForCourse(course: any) {
    const RozarpayOptions = {
      description: course.courseName,
      currency: 'INR',
      amount: course.coursePrice * 100,
      name: this.loggedInUser.name + ' ' + this.loggedInUser.lastname,
      key: 'rzp_test_yxkezuoOH6vmlh',
      prefill: {
        name: this.loggedInUser.name + ' ' + this.loggedInUser.lastname,
        email: this.loggedInUser.email,
        phone: this.loggedInUser.phone
      },
      theme: {
        color: '#6466e3'
      },
      modal: {
        ondismiss:  () => {
          console.log('dismissed')
        }
      }
    }

    const successCallback = (paymentid: any) => {
      console.log(paymentid);
      if(!course.bookedStudents?.subscribed) {
        course.bookedStudents.subscribed = []
      }

      course.bookedStudents.subscribed.push({
        name: this.loggedInUser.name + ' ' + this.loggedInUser.lastname,
        email: this.loggedInUser.email,
        profileImage: this.loggedInUser.profileImage || '',
        phone: this.loggedInUser.phone || ''
      });
      this._spinnerService.showSpinner();
      this._firestoreService.updateCourseById(course.docId, course).then((res: any) => {
        this._spinnerService.hideSpinner();
        this._notificationService.success('Payment received, you are succesfully enrolled for this course!', 10000);
      }).catch((e: any) => {
        this._spinnerService.hideSpinner();
        this._notificationService.error('Something went wrong');
      });
      
    }

    const failureCallback = (e: any) => {
      console.log(e);
    }

    Razorpay.open(RozarpayOptions,successCallback, failureCallback);
  }
}
