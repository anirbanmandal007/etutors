import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { TableModule } from 'primeng/table';
import { RatingModule } from 'primeng/rating';
import { TagModule } from 'primeng/tag';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Router, RouterModule } from '@angular/router';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [HeaderComponent, TableModule, RatingModule, TagModule, ButtonModule, FormsModule, CommonModule, RouterModule],
  templateUrl: './my-courses.component.html',
  styleUrl: './my-courses.component.scss'
})
export class MyCoursesComponent {
  allCourses: any[] = [];
  loggedInUser = JSON.parse(sessionStorage.getItem("user") || "[]");

  constructor(
    private afs: AngularFirestore,
    private storage: AngularFireStorage,
    private router: Router
  ) {}

  ngOnInit() {
    // this.products = [
      // {
      //   id: '1000',
      //   code: 'f230fh0g3',
      //   name: 'Bamboo Watch',
      //   description: 'Product Description',
      //   image: 'bamboo-watch.jpg',
      //   price: 65,
      //   category: 'Accessories',
      //   quantity: 24,
      //   inventoryStatus: 'INSTOCK',
      //   rating: 5
      // }
    // ]
    this.getAllCourses();
  }

  getAllCourses() {
    const allUserCourses = this.afs.collection('courses', ref => ref.where("mentor", '==', this.loggedInUser.email)).snapshotChanges();
    allUserCourses.subscribe((docs: any) => {
      this.allCourses = [];
      docs.forEach((doc: any) => {
        if(this.allCourses.filter((el: any) => el.docId === doc.payload.doc.id).length === 0) {
          this.allCourses.push(
            {docId: doc.payload.doc.id, ...doc.payload.doc.data()}
          )
          this.allCourses.map((course: any) => {
            course.scheduledDates[0] = typeof course.scheduledDates[0].getMonth !== 'function' ? course.scheduledDates[0].toDate() : course.scheduledDates[0];
            course.scheduledDates[1] = typeof course.scheduledDates[1].getMonth !== 'function' ? course.scheduledDates[1].toDate() : course.scheduledDates[1];
            // course.scheduledTime = course.scheduledTime.toDate();
            const imageObjs: any = [];
            course.images.map((image: string) => {
              imageObjs.push({
                name: image
              });
            });
            course.imageObjs = imageObjs;

            if(course.ratings) {
              course.ratingsAvg = Object.values(course.ratings).reduce((sum: number, item: any) => sum + item.rating, 0)  / course.ratings.length;
            }
          });
        }
      });
      console.log(this.allCourses);
    });

  }

  editCourse(e: any, docId: any) {
    e.stopPropagation();
    e.preventDefault();
    console.log(docId);
    this.router.navigate([`/course/${docId}`]);
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

  getSeverity(scheduleDate: any) {
      if(scheduleDate[0].getTime() > new Date().getTime())
        return 'primary';
      else if (scheduleDate[0].getTime() < new Date().getTime() &&  scheduleDate[1].getTime() > new Date().getTime())
        return 'warning';
      else if (scheduleDate[1].getTime() < new Date().getTime())
        return 'success';
    return;
  }
}
