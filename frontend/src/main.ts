import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAuth0 } from '@auth0/auth0-angular';

platformBrowserDynamic().bootstrapModule(AppModule, {
  ngZoneEventCoalescing: true,
  providers: [
    provideAuth0({
      domain: 'dev-mb84z7eiijwz0uio.us.auth0.com',
      clientId: '2NuvcQlTmLBouOR96gGVy6e3pxNJgqZ8',
      authorizationParams: {
        redirect_uri: window.location.origin
      }
    }),
  ]
})
  .catch(err => console.error(err));
