import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(
    private afs: AngularFirestore
  ) { }

  getCourseDetailsById(courseId: string) {
    return this.afs.collection('courses').doc(courseId).ref.get();
  }

  updateCourseById(courseId: string, data: any) {
    return this.afs.collection('courses').doc(courseId).update(data);
  }

  getAllCourses() {
    
  }

  searchCourses(searchArray: object) {
    return this.afs.collection('courses', ref=> ref.where('courseSub', 'array-contains-any', searchArray )).snapshotChanges();
  }

  getUserByEmail(email: string) {
    return this.afs.collection('users', ref=> ref.where('email', '==', email )).snapshotChanges();
  }
}
