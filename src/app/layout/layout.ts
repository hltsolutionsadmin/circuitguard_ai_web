import { Component, HostListener, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, take } from 'rxjs';
import { GroupService } from '../Pages/services/group-service';
import { Auth } from '../auth/Services/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Project } from '../Pages/services/project';
import { ProjectResponse } from '../Pages/projects/project-model';
import { FormControl, FormGroup } from '@angular/forms';

interface NavItem {
  label: string;
  route?: string;
  active?: boolean;
  children?: NavItem[];
  customClick?: boolean;
}


@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class Layout {
   isSidenavOpen = true;
   private authService = inject(Auth);
   private snackBar = inject(MatSnackBar);
   private projectService = inject(Project);
   projectForm!: FormGroup;
   private projectId : any;

     constructor(private router: Router, private layoutService: GroupService) {
      this.projectForm = new FormGroup({
      projectId: new FormControl('')  // 👈 Define form control
    });
   this.projectForm.get('projectId')?.valueChanges.subscribe((value) => {
  if (value) {
    this.projectId = value;
    this.updateNavRoutes(value);

    // Get the current route path (example: /layout/project-groups/3)
    const currentUrl = this.router.url;

    // Replace the last segment (old id) with the new one
    const newUrl = currentUrl.replace(/\/\d+$/, `/${value}`);

    // If the route doesn’t yet have an ID (like /layout/project-groups),
    // just append it:
    const finalUrl = newUrl.includes(`/${value}`) ? newUrl : `${newUrl}/${value}`;

    this.router.navigateByUrl(finalUrl);
  }
});
  }

   
 navItems: NavItem[] = [
    { label: 'Projects', route: '/layout' },
    { label: 'Clients', route: '/layout/project-client' },
    { label: 'Users',
      children: [
        { label: 'User Groups', route: `/layout/project-groups/` },
        { label: 'User', route: '/layout/team-setUp' },
      ]
     },
    {
      label: 'Incident',
      children: [
        { label: 'Create New', route: '/layout/incidents-Form', customClick: true },
        // { label: 'Create Major Incident', route: '/incident/major' },
        { label: 'Assigned to me', route: '/layout/incidents-dashboard/' },
        { label: 'Open', route: `/layout/all/` },
        // { label: 'Open - Unassigned', route: '/layout/incidents-dashboard/' },
        { label: 'Resolved', route: '/layout/incidents-dashboard/' },
        { label: 'All', route: '/layout/incidents-dashboard/' },
        // { label: 'Overview', route: '/layout/incidents-dashboard/' },
        // { label: 'Critical Incident Map', route: '/incident/map' }
      ]
    },
    { label: 'Problem', route: '/problem' },
    { label: 'Change', route: '/change' },
    { label: 'Configuration', route: '/configuration' }
  ];

  isMobile = false;
  sidenavOpen = false;
   user: any;
   projectsLoading = true;
   projectNames: any[] = [];


  ngOnInit() {
    // this.checkScreenSize();
    // this.listenToRouteChanges();
     this.layoutService.sidenavState$.subscribe(isOpen => {
      this.sidenavOpen = isOpen;
    });

    this.authService.user$.pipe(filter(user => !!user),
  take(1)).subscribe({
    next: (user) => {
      this.user = user
      this,this.loadProjects();
    }
  })
  }


  updateNavRoutes(projectId: string) {
  this.navItems.forEach((item) => {
    if (item.children) {
      item.children.forEach((child) => {
        if (child.label === 'User Groups') {
          child.route = `/layout/project-groups/${projectId}`;
        }
         if( child.label === 'Open') {
          child.route = `/layout/all/${projectId}`;
        }
        if (child.label === 'All') {
          child.route = `/layout/incidents-dashboard/${projectId}`;
        }
        if(child.label === 'Create New'){
          child.route = `/layout/incidents-Form/${projectId}`;
        } 
        if(child.label === 'Assigned to me'){
          child.route = `/layout/assigned-to-me/${projectId}`;
        } 
        if (child.label === 'Resolved'){
          child.route = `/layout/resolved/${projectId}`;
        }
       
      });
    } else {
      // Add handling for top-level routes like "Clients"
      if (item.label === 'Clients') {
        item.route = `/layout/project-client/${projectId}`;
      }
    }
  });
}


   loadProjects(): void {
    const userDetails = this.user.organization
      if (!userDetails) {
        this.showError('Organization not found.');
        this.projectsLoading = false;
        return;
      }
  
      this.projectsLoading = true;
      this.projectService.getProjects(0, 100, userDetails.id).subscribe({
        next: (response: ProjectResponse) => {
          this.projectNames = response?.data?.content || [];
          this.projectsLoading = false;
           if (this.projectNames.length > 0) {
        const firstProject = this.projectNames[0];
        this.projectForm.patchValue({ projectId: firstProject.id });
        this.projectId = firstProject.id;

        // Update the Incident → Open route dynamically
        this.updateIncidentOpenRoute(firstProject.id);
      }
        },
        error: (error) => {
          this.showError('Error loading projects. Please try again.');
          this.projectsLoading = false;
        }
      });
    }

     private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['bg-red-500', 'text-white']
    });
  }

   getInitials(): string {
    if (!this.user.fullName) return 'NA';
    const userName = this.user.fullName;
    const words = userName.trim().split(' ');
    return words.length > 1
      ? (words[0][0] + words[1][0]).toUpperCase()
      : userName.substring(0, 2).toUpperCase();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 1024;
    this.sidenavOpen = !this.isMobile; // open by default on desktop
  }

  // toggleSidenav() {
  //   this.sidenavOpen = !this.sidenavOpen;
  // }

 toggleSubmenu(selectedItem: any) {
  if (selectedItem.children) {
    selectedItem.active = !selectedItem.active;
  } else if (selectedItem.customClick && selectedItem.label === 'Create New') {
    if (this.projectId) {
      this.router.navigate(['/layout/incidents-Form'], {
        queryParams: { projectId: this.projectId }
      });
    } else {
      this.showError('Please select a project first.');
    }
  }
}

   toggleSidenav() {
    this.isSidenavOpen = !this.isSidenavOpen;
    if (this.isSidenavOpen) {
      this.layoutService.openSidenav();
    } else {
      this.layoutService.closeSidenav();
    }
  }

  isActive(item: NavItem): boolean {
    if (item.route && this.router.isActive(item.route, { paths: 'exact', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored' })) {
      return true;
    }

    if (item.children) {
      return item.children.some(child => this.router.isActive(child.route!, { paths: 'exact', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored' }));
    }

    return false;
  }

  private updateIncidentOpenRoute(projectId: string | number): void {
  const incidentMenu = this.navItems.find(i => i.label === 'Incident');
  if (incidentMenu && incidentMenu.children) {
    const openItem = incidentMenu.children.find(c => c.label === 'All');
    if (openItem) {
      openItem.route = `/layout/incidents-dashboard/${projectId}`;
      this.router.navigate([`/layout/incidents-dashboard/${projectId}`]);

    }
  }
}



  private updateActiveStates() {
    this.navItems.forEach(item => {
      if (item.children) {
        const anyChildActive = item.children.some(child =>
          this.router.isActive(child.route!, { paths: 'exact', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored' })
        );
        item.active = anyChildActive;
      } else {
        item.active = this.router.isActive(item.route ?? '', {
          paths: 'exact',
          queryParams: 'ignored',
          fragment: 'ignored',
          matrixParams: 'ignored'
        });
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}
