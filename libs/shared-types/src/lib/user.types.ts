export interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;

  // Student specific fields
  bio?: string;
  learningGoals?: string;
  interests?: string;

  // Instructor specific fields
  headline?: string;
  biography?: string;
  website?: string;
  socialLinks?: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  role?: string;

  // Student specific fields
  bio?: string;
  learningGoals?: string;
  interests?: string;

  // Instructor specific fields
  headline?: string;
  biography?: string;
  website?: string;
  socialLinks?: string;
}
