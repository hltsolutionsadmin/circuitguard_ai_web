import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-incidents-dashboard',
  standalone: false,
  templateUrl: './incidents-dashboard.html',
  styleUrls: ['./incidents-dashboard.scss']
})
export class IncidentsDashboard implements OnInit{

  projectNam: string = '';
  projectDesc: string = '';

 incidents = [
    {
      id: '#INC-2024-001',
      title: 'Payment Gateway Down',
      priority: 'Critical',
      status: 'In Progress',
      assignedTo: { name: 'Michael Rodriguez', avatar: 'https://i.pravatar.cc/100?img=1' },
      created: 'Oct 21, 2024 2:30 PM',
      dueDate: 'Oct 21, 2024 8:00 PM',
      dueOverdue: true,
      completed: false
    },
    {
      id: '#INC-2024-002',
      title: 'Database Connection Pool Exhausted',
      priority: 'Critical',
      status: 'Investigating',
      assignedTo: { name: 'Sarah Chen', avatar: 'https://i.pravatar.cc/100?img=2' },
      created: 'Oct 21, 2024 4:19 PM',
      dueDate: 'Oct 21, 2024 8:30 PM',
      dueOverdue: true,
      completed: false
    },
    {
      id: '#INC-2024-003',
      title: 'API Response Time Degradation',
      priority: 'High',
      status: 'Assigned',
      assignedTo: { name: 'David Kim', avatar: 'https://i.pravatar.cc/100?img=3' },
      created: 'Oct 21, 2024 1:45 PM',
      dueDate: 'Oct 22, 2024 2:00 PM',
      dueOverdue: false,
      completed: false
    },
    {
      id: '#INC-2024-004',
      title: 'SSL Certificate Expiring',
      priority: 'High',
      status: 'Resolved',
      assignedTo: { name: 'Tom Anderson', avatar: 'https://i.pravatar.cc/100?img=4' },
      created: 'Oct 20, 2024 10:30 AM',
      dueDate: 'Oct 21, 2024 11:00 AM',
      dueOverdue: false,
      completed: true
    },
    {
      id: '#INC-2024-005',
      title: 'User Authentication Failures',
      priority: 'High',
      status: 'In Progress',
      assignedTo: { name: 'Jennifer Lin', avatar: 'https://i.pravatar.cc/100?img=5' },
      created: 'Oct 21, 2024 9:00 AM',
      dueDate: 'Oct 21, 2024 5:00 PM',
      dueOverdue: false,
      completed: false
    }
  ];

  constructor() {}

  ngOnInit(): void {
   const projectName = this.route.snapshot.paramMap.get('name');
   const projectDescription = this.route.snapshot.paramMap.get('description');
   if (projectName && projectDescription) {
     this.projectNam = projectName;
     this.projectDesc = projectDescription;
   }
  }

  route = inject(ActivatedRoute)

  getProjectDetails() {
    
  }
  priorityClass(priority: string) {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-600';
      case 'High':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  statusClass(status: string) {
    const map: Record<string, string> = {
      'In Progress': 'bg-yellow-100 text-yellow-600',
      'Investigating': 'bg-yellow-50 text-yellow-700',
      'Assigned': 'bg-blue-100 text-blue-600',
      'Resolved': 'bg-green-100 text-green-600'
    };
    return map[status] || 'bg-gray-100 text-gray-600';
  }
}
