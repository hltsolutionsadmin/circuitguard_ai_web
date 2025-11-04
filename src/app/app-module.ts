import { inject, NgModule, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Login } from './auth/Components/login/login';
import { MaterialModule } from './Common/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Layout } from './layout/layout';
import { BannerCard } from './Common/sharedComponents/banner-card/banner-card';
import { provideNativeDateAdapter } from '@angular/material/core';
import { TeamSetup } from './Pages/team-setup/team-setup';
import { MatNavList } from '@angular/material/list';
import { Projects } from './Pages/projects/projects';
import { ProjectTicket } from './Pages/incidents-dashboard/incident-form/project-ticket';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { ProjectById } from './Pages/projects/project-by-id/project-by-id';
import { AddTeamMember } from './Pages/team-setup/add-team-member/add-team-member';
import { CommonService } from './Common/services/common-service';
import { TokenInterceptor } from './Common/interceptor/token-interceptor';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IncidentsDashboard } from './Pages/incidents-dashboard/incidents-dashboard';
import { ProjectDetailsForm } from './Pages/projects/project-details-form/project-details-form';
import { GroupFormComponent } from './Pages/groups-component/group-form-component/group-form-component';
import { GroupsComponent } from './Pages/groups-component/groups-component';
import { ClientComponent } from './Pages/client-component/client-component';
import { GroupMembersComponent } from './Pages/groups-component/group-members-component/group-members-component';
import { IncidentDetailPanelComponent } from './Pages/incidents-dashboard/incident-detail-panel-component/incident-detail-panel-component';
import { SlicePipe } from '@angular/common';
import { MatMenu } from "@angular/material/menu";
import { Register } from './auth/Components/register/register';

export function initializeApiConfig(apiConfigService: CommonService) {
  return () => apiConfigService.loadConfig();
}

@NgModule({
  declarations: [
    App,
    Login,
    Layout,
    BannerCard,
    ProjectDetailsForm,
    TeamSetup,
    Projects,
    ProjectTicket,
    ProjectById,
    AddTeamMember,
    IncidentsDashboard,
    GroupMembersComponent,
    GroupFormComponent,
    GroupsComponent,
    ClientComponent,
    IncidentDetailPanelComponent,
    Register
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    MatNavList,
    RouterOutlet,
    CommonModule,
    SlicePipe,
    FormsModule,
    MatMenu,    
],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideNativeDateAdapter(),
    provideHttpClient(withFetch(),withInterceptorsFromDi()),
     provideAppInitializer(() => inject(CommonService).loadConfig()),
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
   
  ],
  bootstrap: [App]
})
export class AppModule { }
