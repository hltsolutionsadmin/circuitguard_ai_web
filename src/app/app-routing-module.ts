import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './auth/Components/login/login';
import { Layout } from './layout/layout';
import { Projects } from './Pages/projects/projects';
import { ProjectById } from './Pages/projects/project-by-id/project-by-id';
import { TeamSetup } from './Pages/team-setup/team-setup';
import { authGuard } from './Common/guards/auth-guard';
import { loginGuard } from './Common/guards/login-guard';
import { IncidentsDashboard } from './Pages/incidents-dashboard/incidents-dashboard';
import { ProjectDetailsForm } from './Pages/projects/project-details-form/project-details-form';
import { ProjectTicket } from './Pages/incidents-dashboard/incident-form/project-ticket';
import { GroupsComponent } from './Pages/groups-component/groups-component';
import { ClientComponent } from './Pages/client-component/client-component';
import { GroupMembersComponent } from './Pages/groups-component/group-members-component/group-members-component';

const routes: Routes = [
   { path: '', redirectTo: '/login', pathMatch: 'full' },
   { path: 'login', component: Login , canActivate: [loginGuard]},
   { path: 'layout', component: Layout,
    children: [
      { path: '', redirectTo: '/layout/project', pathMatch: 'full' },
      { path: 'project-details', component: ProjectDetailsForm },
      { path: 'project', component: Projects },
      { path: 'incidents-dashboard/:id', component: IncidentsDashboard },
      { path: 'incidents-Form/:id', component: ProjectTicket },
      { path: 'team-setUp', component: TeamSetup },
      { path: 'project-details/:id', component: ProjectById},
      { path: 'project-client', component: ClientComponent},
      { path: 'members-list/:groupId/:groupName/:description/:projectId',
         component: GroupMembersComponent },
         { path: 'project-groups/:id', component: GroupsComponent},
    ],
    canActivate: [authGuard]
    },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
