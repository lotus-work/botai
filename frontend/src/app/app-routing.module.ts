import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { SettingsComponent } from './components/settings/settings.component';
import { SupportComponent } from './components/support/support.component';
import { CustomkbComponent } from './components/customkb/customkb.component';
import { WorkspaceComponent } from './components/workspace/workspace.component';
import { AdLoginComponent } from './components/admin/ad-login/ad-login.component';
import { AdSettingsComponent } from './components/admin/ad-settings/ad-settings.component';
import { AdHomeComponent } from './components/admin/ad-home/ad-home.component';
import { AdPageSettingsComponent } from './components/admin/ad-page-settings/ad-page-settings.component';
import { AdUserComponent } from './components/admin/ad-user/ad-user.component';
import { AdSupportTicketsComponent } from './components/admin/ad-support-tickets/ad-support-tickets.component';
import { AdEditUserComponent } from './components/admin/ad-edit-user/ad-edit-user.component';
import { AdUserCustomKbComponent } from './components/admin/ad-user-custom-kb/ad-user-custom-kb.component';
import { AdUserUsageStatsComponent } from './components/admin/ad-user-usage-stats/ad-user-usage-stats.component';
import { AdAddUserComponent } from './components/admin/ad-add-user/ad-add-user.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { IntegrateWebsiteComponent } from './components/integrate-website/integrate-website.component';
import { AdAuthGuardService } from './services/admin/ad-auth-guard-service/ad-auth-guard.service';
import { ExportchatComponent } from './components/exportchat/exportchat.component';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { TermsOfUseComponent } from './components/terms-of-use/terms-of-use.component';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'help', component: SupportComponent },
  { path: "customkb", component: CustomkbComponent },
  { path: "workspace/:id", component: WorkspaceComponent },
  { path: "dashboard", component: DashboardComponent },
  { path: "integrate-website", component: IntegrateWebsiteComponent },
  { path: "exportchats", component: ExportchatComponent },
  { path: "aboutus", component: AboutUsComponent },
  { path: "termsofuse", component: TermsOfUseComponent },
  { path: "privacypolicy", component: PrivacyPolicyComponent },

  { path: "admin/login", component: AdLoginComponent },
  { path: "admin/settings", component: AdSettingsComponent , canActivate:[AdAuthGuardService]},
  { path: "admin/home", component: AdHomeComponent , canActivate:[AdAuthGuardService]},
  { path: "admin/users", component: AdUserComponent , canActivate:[AdAuthGuardService]},
  { path: "admin/page/settings", component: AdPageSettingsComponent , canActivate:[AdAuthGuardService]},
  { path: "admin/support-tickets", component: AdSupportTicketsComponent , canActivate:[AdAuthGuardService]},
  { path: "admin/user/add", component: AdAddUserComponent , canActivate:[AdAuthGuardService]},
  { path: "admin/user/edit/:id", component: AdEditUserComponent , canActivate:[AdAuthGuardService]},
  { path: "admin/user/customkb", component: AdUserCustomKbComponent , canActivate:[AdAuthGuardService]},
  { path: "admin/user/useage-stats/:id/:orgid", component: AdUserUsageStatsComponent , canActivate:[AdAuthGuardService]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
