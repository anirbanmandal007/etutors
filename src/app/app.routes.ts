import { Routes } from "@angular/router";
import { LoginComponent } from "./features/login/login.component";
import { SignupComponent } from "./features/signup/signup.component";
import { HomeComponent } from "./features/home/home.component";
import { authGuard } from "./core/guards/auth.guard";
import { ForgotPasswordComponent } from "./features/forgot-password/forgot-password.component";
import { AccountComponent } from "./features/account/account.component";
import { MyCoursesComponent } from "./features/my-courses/my-courses.component";
import { CourseComponent } from "./features/course/course.component";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "login",
    pathMatch: "full",
  },
  {
    path: "login",
    component: LoginComponent,
  },
  {
    path: "forgot-password",
    component: ForgotPasswordComponent,
  },
  {
    path: "register",
    component: SignupComponent,
  },
  {
    path: "home",
    component: HomeComponent,
    canActivate: [authGuard],
  },
  {
    path: "account",
    component: AccountComponent,
    canActivate: [authGuard],
  },
  {
    path: "my-courses",
    component: MyCoursesComponent,
    canActivate: [authGuard],
  },
  {
    path: "course",
    component: CourseComponent,
    canActivate: [authGuard],
  },
  {
    path: "course/:id",
    component: CourseComponent,
    canActivate: [authGuard],
  }
];
