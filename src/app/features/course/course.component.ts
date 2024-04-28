import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { ChipsModule } from 'primeng/chips';
import { CalendarModule } from 'primeng/calendar';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { NotificationService } from '../../core/services/notification.service';
import { SpinnerService } from '../../core/services/spinner.service';
import { EditorModule } from 'primeng/editor';
import { FirestoreService } from '../../core/services/firestore.service';

@Component({
  selector: 'app-course',
  standalone: true,
  imports: [CommonModule, HeaderComponent, ChipsModule, CalendarModule, ReactiveFormsModule, ProgressSpinnerModule, EditorModule, RouterModule],
  templateUrl: './course.component.html',
  styleUrl: './course.component.scss'
})
export class CourseComponent {
  fileUrl!: string;
  profileImageFile: any;
  filePath!: string;
  urls: any = [];
  docId: any;
  
  courseForm!: FormGroup;
  allImages: any;
  isCourseCreated = false;
  uploasTask: any;
  loggedInUser: any = JSON.parse(sessionStorage.getItem("user") || "[]");
  existingDocData: any;

  constructor(
    private fb: FormBuilder,
    private storage: AngularFireStorage,
    private afs: AngularFirestore,
    private router: Router,
    private _notificationService: NotificationService,
    private _spinnerService: SpinnerService,
    private activatedRoute: ActivatedRoute,
    private _fsService: FirestoreService
  ){}

  ngOnInit() {
    this.initiateCourseForm();
    this.activatedRoute.params.subscribe(params => {
      this.docId = params['id'];
      // alert(this.docId);
    });

    if(this.docId) {
      this.getDocData();
    }
  }

  initiateCourseForm() {
    this.courseForm = this.fb.group({
      courseName: ['', Validators.required],
      courseDesc: ['', Validators.required],
      courseSub: [[], Validators.required],
      courseLevel: ['beginner', Validators.required],
      scheduledDates: [[], Validators.required],
      scheduledTime: ['', Validators.required],
      duration: ['1', Validators.required],
      coursePrice: ['1', Validators.required],
      courseType: ['online', Validators.required],
      studentsClass: ['class1-class4', Validators.required],
      courseSummary: ['', Validators.required]
    });
  }

  getDocData() {
    this._fsService.getCourseDetailsById(this.docId).then((doc: any) => {
      if (doc.exists) {
        this.existingDocData = doc.data();
        this.patchCourseForm();
      } else {
        console.log("There is no document!");
      }
    }).catch(function (error) {
      console.log("There was an error getting your document:", error);
    });
  }

  patchCourseForm() {
    console.log(Array.isArray(this.existingDocData.courseSub));
    const date1 = this.existingDocData.scheduledDates[0].toDate();
    const date2 = this.existingDocData.scheduledDates[1].toDate();
    date1.setHours(0);
    date1.setMinutes(0);
    date1.setSeconds(0);
    date2.setHours(0);
    date2.setMinutes(0);
    date2.setSeconds(0);
    setTimeout(()=> {
      this.courseForm.patchValue({
        courseName: this.existingDocData.courseName,
        courseDesc: this.existingDocData.courseDesc,
        courseLevel: this.existingDocData.courseLevel,
        duration: this.existingDocData.duration,
        coursePrice: this.existingDocData.coursePrice,
        courseType: this.existingDocData.courseType,
        studentsClass: this.existingDocData.studentsClass
      });
    }, 0)
    this.courseForm.controls['courseSub'].patchValue(this.existingDocData.courseSub);
    this.courseForm.controls['scheduledDates'].patchValue([date1,date2]);
    this.courseForm.controls['scheduledTime'].patchValue(this.existingDocData.scheduledTime.toDate());
    this.courseForm.controls['courseSummary'].patchValue(this.existingDocData.courseSummary);
    if(this.existingDocData.images) {
      this.urls = this.existingDocData.images;
    }
  }

  createCourse() {
    this._spinnerService.showSpinner();
    const dataToBeSaved = this.courseForm.value;
    dataToBeSaved.mentor = this.loggedInUser.email;
    this.afs.firestore
    .collection("courses")
    .add(dataToBeSaved)
    .then((res) => {
      this.uploadAllCourseImages(res.id);
      // this.router.navigate(["/my-courses"]);
    })
    .catch((e) => {
      this.isCourseCreated = false;
      this._spinnerService.hideSpinner();
    });
  }

  updateCourse() {
    console.log(this.courseForm.value);
    this._spinnerService.showSpinner();
    this.afs.doc(`courses/${this.docId}`).update(this.courseForm.value).then((res: any) => {
      if(this.deletedCourseImage?.length) {
        this.deleteCourseImageFromStore();
      }

      if(this.allImages?.length) {
        this.uploadAllCourseImages(this.docId);
      } else {
        this._spinnerService.hideSpinner();
        this._notificationService.success('Course has been updated!');
        this.router.navigate(['/my-courses']);
      }
      
    }).catch((e: any) => {
      this._spinnerService.hideSpinner();
      this._notificationService.error('Something went wrong!');
    });
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.allImages = event.target.files;
      var filesAmount = event.target.files.length;
      for (let i = 0; i < filesAmount; i++) {
        var reader = new FileReader();

        reader.onload = (event:any) => {
          console.log(event.target.result);
            this.urls.push(event.target.result); 
        }

        reader.readAsDataURL(event.target.files[i]);
      }
    }
  }

  uploadAllCourseImages(courseId: any) {
    // Upload all course images to Firestore storage
    Promise.all(
      // Array of "Promises"
      Array.from(this.allImages).map((item: any) => this.putStorageItem(courseId, item))
    )
    .then((snapshots) => {
      console.log(`All success`);
      let allImagesPath: any = this.docId ? this.urls.filter((el: any) => el.startsWith('https')) : [];
      snapshots.forEach((snap: any) => {
        snap.ref.getDownloadURL().then((url: any) => {
          allImagesPath.push(url);
          console.log(url);
          // All images url are pushed to allImagesPath array
          if(snapshots.length + this.urls.filter((el: any) => el.startsWith('https')).length === allImagesPath.length) {
            this.addImagesUrlToCourse(courseId, allImagesPath);
          }
        });
      });
    })
    .catch((error) => {
      console.log(`Some failed: `, error.message);
      this._spinnerService.hideSpinner();
    });
  }

  putStorageItem(courseId: any, image: any) {
    // the return value will be a Promise
    return new Promise((resolve, reject) => {
      const n = Date.now();
      // return this.storage.ref(`courseImages/${n}`).put("YourFile")
      this.uploasTask = this.storage.upload(
        `courseImages/${courseId}/${n}`,
        image,
      ).then((snapshot: any) => {
        console.log('One success:', image);
        resolve(snapshot);
      }).catch((error: any) => {
        console.log('One failed:', image, error.message);
        this._spinnerService.hideSpinner();
        reject(error);
      });
    });
  }

  addImagesUrlToCourse(courseId: any, allImagesPath: any) {
    this.afs.doc(`courses/${courseId}`).update({images: allImagesPath});
    this._spinnerService.hideSpinner();
    this._notificationService.success(`Course has been ${this.docId ? 'updated!' : 'created!'}`);
    this.router.navigate(['/my-courses'])
  }
  deletedCourseImage: any = [];
  deleteCourseImage(url: string, index: number) {
    // Delete existing profile image linked with the current user
    if (url && !url.startsWith('data')) {
      this.deletedCourseImage.push(url);
      this.urls = this.urls.filter((el: any) => el !== url);
    } else {
      this.allImages = [...this.allImages];
      this.allImages.splice(index, 1);
      this.urls.splice(index, 1);
    }
  }

  deleteCourseImageFromStore() {
    this.deletedCourseImage.forEach((url: string) => {
      this.storage.storage.refFromURL(url).delete();
      const _value = {
        images: this.urls
      }
      this.afs.doc(`courses/${this.docId}`).update(_value).then((res: any) => {
        // this._notificationService.success('Course image updated successfully!');
      }).catch((e: any) => {
        this._notificationService.error('Something went wrong!');
      });
    });
  }
  
}
