// User Types
export interface User {
  _id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole =
  | "SysAdmin"
  | "DistrictHead"
  | "CollegeAdmin"
  | "Teacher"
  | "Student";

// Profile Types
export interface SysAdminProfile {
  _id: string;
  name: string;
  contactNumber: string;
  email: string;
  image?: string;
  cnic: string;
  gender: "Male" | "Female" | "Other";
  userId: string;
  isActive: boolean;
}

export interface DistrictHeadProfile {
  _id: string;
  name: string;
  contactNumber: string;
  email: string;
  image?: string;
  cnic: string;
  gender: "Male" | "Female" | "Other";
  regionId?: string;
  userId: string;
  isActive: boolean;
}

export interface CollegeAdminProfile {
  _id: string;
  name: string;
  code: string;
  regionId:
    | string
    | {
        _id: string;
        name: string;
        code: string;
      };
  address: string;
  city: string;
  establishedYear?: number;
  userId: string;
  isActive: boolean;
}

export interface TeacherProfile {
  _id: string;
  name: string;
  fatherName: string;
  gender: "Male" | "Female" | "Other";
  cnic: string;
  dateOfBirth: string;
  maritalStatus: "Single" | "Married" | "Divorced" | "Widowed";
  religion: string;
  highestQualification: string;
  domicile: string;
  contactNumber: string;
  contactEmail: string;
  presentAddress: string;
  personalNumber: string;
  designation: string;
  bps: number;
  employmentStatus: "Regular" | "Contract";
  superannuation: string;
  joinedServiceAt: string;
  joinedCollegeAt: string;
  collegeId: string;
  userId: string;
  isActive: boolean;
}

export interface StudentProfile {
  _id: string;
  name: string;
  rollNumber: string;
  fatherName: string;
  contactNumber?: string;
  cnic?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: "Male" | "Female" | "Other";
  address?: string;
  collegeId: string;
  programId: string;
  sectionId: string;
  userId?: string;
  enrollmentDate: string;
  status: "Active" | "Inactive" | "Graduated" | "Dropped";
  isActive: boolean;
}

export type UserProfile =
  | SysAdminProfile
  | DistrictHeadProfile
  | CollegeAdminProfile
  | TeacherProfile
  | StudentProfile;

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  profile: UserProfile;
  token: string;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
}
