import { ApplicationConfig, importProvidersFrom } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideAnimations } from "@angular/platform-browser/animations";
import { routes } from "./app.routes";
import { initializeApp, provideFirebaseApp } from "@angular/fire/app";
import { environment } from "../environments/environment";
import { getFirestore, provideFirestore } from "@angular/fire/firestore";
import { FIREBASE_OPTIONS } from "@angular/fire/compat";
import { provideNgxStripe } from "ngx-stripe";
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    { provide: FIREBASE_OPTIONS, useValue: environment.firebase },
    provideAnimations(),
    importProvidersFrom([
      provideFirebaseApp(() => initializeApp(environment.firebase)),
      provideFirestore(() => getFirestore()),
    ]),
    provideNgxStripe(environment.stripePublishableKey), provideAnimationsAsync()
  ],
};
