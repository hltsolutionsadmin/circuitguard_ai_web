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
  budgetRange: string | null;
  expectedTeamSize: string;
  archived: boolean;
  projectMembers: any[];
  technologyStack: any[];
}

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
  data: {
    content: Project[];
    pageable: Pageable;
    last: boolean;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    sort: any[];
    numberOfElements: number;
    first: boolean;
    empty: boolean;
  };
}

export interface ProjectResponse {
  message: string;
  status: string;
  data: {
    content: Project[];
    pageable: Pageable;
    last: boolean;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    sort: any[];
    numberOfElements: number;
    first: boolean;
    empty: boolean;
  };
}