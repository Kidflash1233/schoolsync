import { BellAlertIcon, ClipboardDocumentCheckIcon, CalendarIcon as SolidCalendarIcon, CubeTransparentIcon } from '@heroicons/react/24/solid'; 
import { ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react';


export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  PARENT = 'PARENT',
  STUDENT_USER = 'STUDENT_USER', // Added new role for students with profiles
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  password?: string; // User's password (in a real app, this would be a hash)
  hasSetPassword?: boolean; // True if the user has set their password at least once
  // Admin specific
  // Teacher specific
  classIds?: string[]; // IDs of classes the teacher teaches
  // Parent specific
  childStudentIds?: string[]; // IDs of their children (Student objects)
  // Student_User specific
  studentId?: string; // ID of the associated Student object if this user is a student profile
}

export interface UserCreationResponse {
  user: User;
  invitationCode?: string; // Only present for Teacher/Parent/Student_User roles
}

export interface Student {
  id:string;
  name: string;
  classId: string; // ID of the primary class the student belongs to
  parentIds?: string[]; // User IDs of the parents
  avatarUrl?: string;
  userId?: string; // ID of the associated User object, if a profile exists
  hasUserProfile?: boolean; // True if this student has a user profile for login
}

export interface Class {
  id: string;
  name: string;
  teacherIds: string[]; // User IDs of the teachers - CHANGED from teacherId: string
  studentIds: string[]; // IDs of Student objects enrolled in this class
}

export enum PostType {
  CLASS_UPDATE = 'CLASS_UPDATE',
  ACADEMIC_ANNOUNCEMENT = 'ACADEMIC_ANNOUNCEMENT',
  EVENT_ANNOUNCEMENT = 'EVENT_ANNOUNCEMENT',
  // Consider if PRIVATE_REMINDER should be a PostType or handled by privacyLevel + isCalendarEvent
}

export interface Post {
  id: string;
  authorId: string; // User ID of Admin or Teacher
  authorName: string;
  authorAvatarUrl?: string;
  title: string;
  content: string;
  mediaUrl?: string; // URL for image/video
  mediaType?: 'image' | 'video' | 'document';
  createdAt: string; // ISO date string
  type: PostType;
  targetClassId?: string; // For CLASS_UPDATE and teacher-created calendar events
  targetRole?: UserRole; // For global announcements (less used now with privacyLevel)
  
  // Calendar specific fields
  eventDate?: string; // ISO date string, if this post is a calendar event
  isCalendarEvent?: boolean; // True if this post should appear in calendars

  // New fields for enhanced calendar/reminder system by Teachers
  privacyLevel?: 'PUBLIC_CLASS' | 'SPECIFIC_RECIPIENTS'; // For teacher posts, esp. calendar events
  targetUserIdsForPost?: string[]; // User IDs of specific Parents or Student_Users targeted by a teacher's private post
  targetStudentIdsForPost?: string[]; // Student IDs targeted by a teacher's private post (parents of these students also see it)
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  senderAvatarUrl?: string;
  content: string;
  timestamp: string; // ISO date string
  read: boolean;
}

export interface Conversation {
  id: string; // Could be a composite key like user1Id_user2Id
  participant: User; // The other person in the chat
  lastMessage: Message;
  unreadCount: number;
}

export interface AcademicOrEventItem {
  id:string;
  title: string;
  description: string;
  date: string; // ISO date string
  type: 'academic' | 'event'; // Admin created school-wide items
  targetAudience?: UserRole[]; // Who this is for
}

export interface ParentTeacherReminder { // Parent-to-Teacher reminders
  id: string;
  parentId: string;    // User ID of parent
  teacherId: string;   // User ID of teacher (primary teacher for context, though class might have multiple)
  studentId: string;   // Student ID this reminder is about
  studentName: string; // For display on teacher's side
  title: string;
  description: string;
  eventDate: string;   // ISO date string for the reminder
  createdAt: string;   // ISO date string of submission
  acknowledged: boolean; // Teacher marks if seen/handled
}

// For unified calendar display
export interface CalendarDisplayItem {
  id: string; // Unique ID for the list (can be originalId + type prefix)
  originalId: string; // ID of the source entity (Post, AcademicOrEventItem, ParentTeacherReminder)
  title: string;
  description?: string;
  date: string; // ISO date string (eventDate or date)
  sourceType: 'school_item' | 'class_post' | 'parent_reminder';
  authorName?: string;
  className?: string; // If applicable
  studentName?: string; // If applicable (e.g. for ParentTeacherReminder)
  isPrivateToUser: boolean; // True if it's a targeted reminder for the current user
  item: Post | AcademicOrEventItem | ParentTeacherReminder; // The original item for more details
}

// New type for Role Code History
export interface RoleCodeHistoryEntry {
  code: string;
  userId: string;
  role: UserRole;
  createdAt: string; // ISO date string when the code was generated
}


// For Sidebar and Tabs
// Updated Icon type to be more flexible with HeroIcons
type HeroIconType = ForwardRefExoticComponent<Omit<SVGProps<SVGSVGElement>, "ref"> & { title?: string | undefined; titleId?: string | undefined; } & RefAttributes<SVGSVGElement>>;
export interface NavItemConfig {
  to: string;
  label:string;
  icon?: HeroIconType | React.ElementType; // Accept more specific HeroIcon type
  end?: boolean;
  children?: NavItemConfig[]; // For nested navigation if needed
}

// Export new icons for use in components
export { BellAlertIcon, ClipboardDocumentCheckIcon, SolidCalendarIcon, CubeTransparentIcon };