import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './auth/Components/login/login';
import { Layout } from './layout/layout';
import { ProjectDetailsForm } from './Pages/project-details-form/project-details-form';
import { Projects } from './Pages/projects/projects';
import { ProjectTicket } from './Pages/project-ticket/project-ticket';
import { ProjectById } from './Pages/project-by-id/project-by-id';
import { TeamSetup } from './Pages/team-setup/team-setup';
import { authGuard } from './Common/guards/auth-guard';
import { loginGuard } from './Common/guards/login-guard';

const routes: Routes = [
   { path: '', redirectTo: '/login', pathMatch: 'full' },
   { path: 'login', component: Login , canActivate: [loginGuard]},
   { path: 'layout', component: Layout,
    children: [
      { path: '', redirectTo: '/layout/project', pathMatch: 'full' },
      { path: 'project-details', component: ProjectDetailsForm },
      { path: 'project', component: Projects },
      { path: 'project-ticket', component: ProjectTicket },
      { path: 'team-setUp', component: TeamSetup },
      { path: 'project-details/:id', component: ProjectById}
    ],
    canActivate: [authGuard]
    },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
