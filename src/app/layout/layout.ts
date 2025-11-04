import { Component, HostListener, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { GroupService } from '../Pages/services/group-service';
import { Auth } from '../auth/Services/auth';

interface NavItem {
  label: string;
  route?: string;
  active?: boolean;
  children?: NavItem[];
}


@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class Layout {
   isSidenavOpen = true;
   private authService = inject(Auth)
 navItems: NavItem[] = [
    { label: 'Projects', route: '/layout' },
    { label: 'Members', route: '/layout/team-setUp' },
    {
      label: 'Incident',
      children: [
        { label: 'Create New', route: '/layout/incidents-Form' },
        { label: 'Create Major Incident', route: '/incident/major' },
        { label: 'Assigned to me', route: '/incident/assigned' },
        { label: 'Open', route: '/incident/open' },
        { label: 'Open - Unassigned', route: '/incident/unassigned' },
        { label: 'Resolved', route: '/incident/resolved' },
        { label: 'All', route: '/incident/all' },
        { label: 'Overview', route: '/incident/overview' },
        { label: 'Critical Incident Map', route: '/incident/map' }
      ]
    },
    { label: 'Problem', route: '/problem' },
    { label: 'Change', route: '/change' },
    { label: 'Configuration', route: '/configuration' }
  ];

  isMobile = false;
  sidenavOpen = false;

 
  constructor(private router: Router, private layoutService: GroupService) {}

  ngOnInit() {
    // this.checkScreenSize();
    // this.listenToRouteChanges();
     this.layoutService.sidenavState$.subscribe(isOpen => {
      this.sidenavOpen = isOpen;
    });
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

  toggleSubmenu(selectedItem: NavItem) {
    if (selectedItem.children) {
      selectedItem.active = !selectedItem.active;
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

  private listenToRouteChanges() {
  this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      const currentUrl = event.urlAfterRedirects;

      // 🧠 Adjust this condition to your real route path
      const isIncidentDetails = currentUrl.includes('/layout/incident-details');

      if (isIncidentDetails) {
        // Close sidebar when opening incident details
        this.sidenavOpen = false;
      } else {
        // Restore sidebar open state on desktop
        if (!this.isMobile) {
          this.sidenavOpen = true;
        }
      }

      this.updateActiveStates();
    });
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
