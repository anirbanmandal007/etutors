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
import { map } from 'rxjs';

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
      docs.forEach((doc: any) => {
        this.allCourses.push(
          {docId: doc.payload.doc.id, ...doc.payload.doc.data()}
        )
        this.allCourses.map((course: any) => {
          course.scheduledDates[0] = course.scheduledDates[0].toDate();
          course.scheduledDates[1] = course.scheduledDates[1].toDate();
          course.scheduledTime = course.scheduledTime.toDate();
        })
      });
      console.log(this.allCourses);
    });

    // const allUserCourses = this.afs.collection('courses');
    // // .snapshotChanges() returns a DocumentChangeAction[], which contains
    // // a lot of information about "what happened" with each change. If you want to
    // // get the data and the id use the map operator.
    // this.allCourses = allUserCourses.snapshotChanges().pipe(
    //   map(actions => {
    //   return actions.map(a => {
    //       const data: any = a.payload.doc.data();
    //       const id = a.payload.doc.id;
    //       return { id, ...data };
    //   });
    //   })
    // );

  }

  editCourse(docId: any) {
    console.log(docId);
    this.router.navigate([`/course/${docId}`]);
  }

  getSeverity(status: string) {
    switch (status) {
      case 'INSTOCK':
        return 'success';
      case 'LOWSTOCK':
        return 'warning';
      case 'OUTOFSTOCK':
        return 'danger';
    }
    return;
  }
}
