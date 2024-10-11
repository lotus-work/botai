import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from '@auth0/auth0-angular';
import { ServerModule } from '@angular/platform-server';
import { LoginComponent } from './components/login/login.component';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HomeComponent } from './components/home/home.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { BotComponent } from './components/bot/bot.component';
import { FormsModule } from '@angular/forms';
import { SettingsComponent } from './components/settings/settings.component';
import { SupportComponent } from './components/support/support.component';
import { CustomkbComponent } from './components/customkb/customkb.component';
import { WorkspaceComponent } from './components/workspace/workspace.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    NavbarComponent,
    BotComponent,
    SettingsComponent,
    SupportComponent,
    CustomkbComponent,
    WorkspaceComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ServerModule,
    FormsModule,
    AuthModule.forRoot({
      domain: 'dev-mb84z7eiijwz0uio.us.auth0.com',  // Replace with your Auth0 domain
      clientId: '2NuvcQlTmLBouOR96gGVy6e3pxNJgqZ8',
      cacheLocation: 'localstorage',
      useRefreshTokens: true, // Replace with your Auth0 client ID
      authorizationParams: {
        redirect_uri: "http://localhost:4200"
      } 
    })
  ],
  providers: [
    provideClientHydration()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
