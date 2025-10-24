import { inject, NgModule, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Login } from './auth/Components/login/login';
import { MaterialModule } from './Common/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { Layout } from './layout/layout';
import { BannerCard } from './Common/sharedComponents/banner-card/banner-card';
import { ProjectDetailsForm } from './Pages/project-details-form/project-details-form';
import { provideNativeDateAdapter } from '@angular/material/core';
import { TeamSetup } from './Pages/team-setup/team-setup';
import { MatNavList } from '@angular/material/list';
import { Projects } from './Pages/projects/projects';
import { ProjectTicket } from './Pages/project-ticket/project-ticket';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { ProjectById } from './Pages/project-by-id/project-by-id';
import { AddTeamMember } from './Pages/team-setup/add-team-member/add-team-member';
import { CommonService } from './Common/services/common-service';
import { TokenInterceptor } from './Common/interceptor/token-interceptor';

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
    AddTeamMember
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    MatNavList,
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
