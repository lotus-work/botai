import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
import { AdLoginComponent } from './components/admin/ad-login/ad-login.component';
import { AdHomeComponent } from './components/admin/ad-home/ad-home.component';
import { AdNavbarComponent } from './components/admin/ad-navbar/ad-navbar.component';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { AdSettingsComponent } from './components/admin/ad-settings/ad-settings.component';
import { AdPageSettingsComponent } from './components/admin/ad-page-settings/ad-page-settings.component';
import { AdUserComponent } from './components/admin/ad-user/ad-user.component';
import { AdSupportTicketsComponent } from './components/admin/ad-support-tickets/ad-support-tickets.component';
import { AdEditUserComponent } from './components/admin/ad-edit-user/ad-edit-user.component';
import { AdUserUsageStatsComponent } from './components/admin/ad-user-usage-stats/ad-user-usage-stats.component';
import { AdUserCustomKbComponent } from './components/admin/ad-user-custom-kb/ad-user-custom-kb.component';
import { AdAddUserComponent } from './components/admin/ad-add-user/ad-add-user.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { IntegrateWebsiteComponent } from './components/integrate-website/integrate-website.component';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSpinnerModule } from "ngx-spinner";
import { NgToastModule } from 'ng-angular-popup';
import { SafePipe } from './pipe/safe.pipe';
import { LoadchatComponent } from './components/loadchat/loadchat.component';
import { ExportchatComponent } from './components/exportchat/exportchat.component';
import { TermsOfUseComponent } from './components/terms-of-use/terms-of-use.component';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';
import { MisNavbarComponent } from './components/mis-navbar/mis-navbar.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';

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
    WorkspaceComponent,
    AdLoginComponent,
    AdHomeComponent,
    AdNavbarComponent,
    AboutUsComponent,
    AdSettingsComponent,
    AdPageSettingsComponent,
    AdUserComponent,
    AdSupportTicketsComponent,
    AdEditUserComponent,
    AdUserUsageStatsComponent,
    AdUserCustomKbComponent,
    AdAddUserComponent,
    DashboardComponent,
    IntegrateWebsiteComponent,
    SafePipe,
    LoadchatComponent,
    ExportchatComponent,
    TermsOfUseComponent,
    PrivacyPolicyComponent,
    MisNavbarComponent,
    UnauthorizedComponent,
  ],
  imports: [
    NgToastModule,
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NgxSpinnerModule,
    FormsModule,
    AuthModule.forRoot({
      domain: 'dev-mb84z7eiijwz0uio.us.auth0.com',  // Replace with your Auth0 domain
      clientId: '2NuvcQlTmLBouOR96gGVy6e3pxNJgqZ8',
      cacheLocation: 'localstorage',
      useRefreshTokens: true, // Replace with your Auth0 client ID
      authorizationParams: {
        redirect_uri: "https://bclone.ai"
      } 
    })
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    provideClientHydration()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
