// export interface Project {
//   id: number;
//   name: string;
//   description: string;
//   clientId: number;
//   projectManagerId: number;
//   startDate: string;
//   endDate: string;
//   targetEndDate: string;
//   dueDate: string;
//   status: string;
//   type: string;
//   ownerOrganizationId: number;
//   clientOrganizationId: number;
//   progressPercentage: number;
//   budgetRange: string | null;
//   expectedTeamSize: string;
//   archived: boolean;
//   projectMembers: any[];
//   technologyStack: any[];
// }

export interface Pageable {
  pageNumber: number;
  pageSize: number;
  sort: any[];
  offset: number;
  paged: boolean;
  unpaged: boolean;
}


export interface ProjectResponse {
  message: string;
  status: string;
  data: Project; 
}

export interface Project {
  id: number;
  name: string;
  description: string;
  clientId: number;
  projectManagerId: number;
  startDate: string;
  endDate: string;
  targetEndDate: string;
  dueDate: string;
  status: string;
  type: string;
  ownerOrganizationId: number;
  clientOrganizationId: number;
  progressPercentage: number;
  budgetRange?: string | null;
  expectedTeamSize?: string;
  archived: boolean;
  projectMembers: ProjectMember[];
  technologyStack: any[];
}

export interface ProjectMember {
  id: number;
  userId: number;
  targetType: string;
  targetId: number;
  role: string | null;
  active: boolean;
  username: string | null;
  fullName: string | null;
  primaryContact: string | null;
  password: string | null;
  email: string | null;
}

