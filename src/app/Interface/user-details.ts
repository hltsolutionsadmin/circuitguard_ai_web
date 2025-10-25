export interface Role {
  id: number;
  name: string;
}

export interface Organization {
  id: number;
  name: string;
  description?: string | null;
  domainName?: string | null;
  active: boolean;
  adminFullName?: string | null;
  adminUsername?: string | null;
  adminPrimaryContact?: string | null;
  adminPassword?: string | null;
  email?: string | null;
}

export interface Media {
  // Define fields if needed later
  [key: string]: any;
}

export interface UserModel {
  id: number;
  fullName: string;
  username: string;
  email: string;
  roles: Role[];
  primaryContact: string;
  version: number;
  media: Media[];
  organization: Organization;
  password: string;
  registered: boolean;
}
