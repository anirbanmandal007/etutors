import { Component } from '@angular/core';
import { FirestoreService } from '../../core/services/firestore.service';
import { SpinnerService } from '../../core/services/spinner.service';
import { NotificationService } from '../../core/services/notification.service';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tutor-home',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './tutor-home.component.html',
  styleUrl: './tutor-home.component.scss'
})
export class TutorHomeComponent {
  courseSearch = '';
  suggestedCourses: any = [];
  loggedInUser = JSON.parse(sessionStorage.getItem("user") || "[]");

  constructor(
    private _firestoreService: FirestoreService,
    private _spinnerService: SpinnerService,
    private _notificationService: NotificationService
  ) {}

  ngOnInit() {
    const searchArray = this.loggedInUser.subjects || [''];
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
      });
      this._spinnerService.hideSpinner();
    });
  }

  getCourseStatus(scheduleDate: any) {
    if(scheduleDate[0].getTime() > new Date().getTime())
      return 'Upcoming';
    else if (scheduleDate[0].getTime() < new Date().getTime() &&  scheduleDate[1].getTime() > new Date().getTime())
      return 'In Progress';
    else if (scheduleDate[1].getTime() < new Date().getTime())
      return 'Completed';
    return;
  }
}
