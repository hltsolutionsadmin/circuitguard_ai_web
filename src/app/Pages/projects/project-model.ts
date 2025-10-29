export interface Pageable {
  pageNumber: number;
  pageSize: number;
  sort: any[];
  offset: number;
  paged: boolean;
  unpaged: boolean;
}


export interface ProjectResponse {
  message: string
  status: string
  data: Data
}
export interface Data {
  content: ProjectContent[]
  pageable: Pageable
  totalElements: number
  totalPages: number
  last: boolean
  size: number
  number: number
  sort: any[]
  numberOfElements: number
  first: boolean
  empty: boolean
}

export interface ProjectContent {
  id: number
  name: string
  description: string
  startDate: string
  endDate: string
  status: string
  type: string
  ownerOrganizationId: number
  progressPercentage: number
  archived: boolean
  projectMembers: ProjectMember[]
  technologyStack: any[]
}

export interface ProjectMember {
  userIds: number[]
  targetType: string
  roles: string[]
  targetId: number
  groupIds: number[]
  active: boolean
  username: string
  fullName: string
  primaryContact: string
  password: any
  email: any
}

// project group 

export interface projectGroupResponse {
  message: string
  status: string
  data: Data
}

export interface Data {
  content: ProjectContent[]
  pageable: Pageable
  last: boolean
  totalElements: number
  totalPages: number
  size: number
  number: number
  sort: any[]
  first: boolean
  numberOfElements: number
  empty: boolean
}

export interface Content {
  id: number
  groupName: string
  description: string
}

export interface Pageable {
  pageNumber: number
  pageSize: number
  sort: any[]
  offset: number
  paged: boolean
  unpaged: boolean
}
