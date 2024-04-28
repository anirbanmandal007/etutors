import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { ActivatedRoute } from '@angular/router';
import { FirestoreService } from '../../core/services/firestore.service';
import { CarouselModule } from 'primeng/carousel';
import { CommentBoxComponent } from '../comment-box/comment-box.component';
import { NotificationService } from '../../core/services/notification.service';
import { SpinnerService } from '../../core/services/spinner.service';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [HeaderComponent, CarouselModule, CommentBoxComponent],
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.scss'
})
export class CourseDetailComponent implements OnInit {
  courseId: any
  loggedInUser: any = JSON.parse(sessionStorage.getItem("user") || "[]");
  courseDetails: any;
  authorDetails: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private _fsService: FirestoreService,
    private _spinnerService: SpinnerService,
    private _notificationService: NotificationService
  ) {}

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
}
