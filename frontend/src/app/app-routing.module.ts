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

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'help', component: SupportComponent },
  { path: "customkb", component: CustomkbComponent },
  { path: "workspace", component: WorkspaceComponent },

  { path: "admin/login", component: AdLoginComponent },
  { path: "admin/settings", component: AdSettingsComponent },
  { path: "admin/home", component: AdHomeComponent },
  { path: "admin/users", component: AdUserComponent },
  { path: "admin/page/settings", component: AdPageSettingsComponent },
  { path: "admin/support-tickets", component: AdSupportTicketsComponent },
  { path: "admin/user/edit", component: AdEditUserComponent },
  { path: "admin/user/customkb", component: AdUserCustomKbComponent },
  { path: "admin/user/useage-stats", component: AdUserUsageStatsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
