
import { User, UserRole, Class, Student, Post, Message, AcademicOrEventItem, PostType, Conversation, ParentTeacherReminder, UserCreationResponse, CalendarDisplayItem, RoleCodeHistoryEntry } from '../types';
import { DEFAULT_AVATAR_PLACEHOLDER, MOCK_ROLE_CODES } from '../constants';

// --- Special Class ID ---
export const MASTER_CLASS_ID = 'master-class-global';

// --- Mock Data ---
let mockUsers: User[] = [
  { id: 'admin001', name: 'Dr. Admin Smith', email: 'admin@school.com', role: UserRole.ADMIN, avatarUrl: 'https://picsum.photos/seed/admin/100/100', password: 'adminpassword', hasSetPassword: true },
  { id: 'teacher001', name: 'Ms. Emily Davis', email: 'emily.davis@school.com', role: UserRole.TEACHER, classIds: ['class101', 'class102'], avatarUrl: 'https://picsum.photos/seed/teacher1/100/100', hasSetPassword: false },
  { id: 'teacher002', name: 'Mr. John Brown', email: 'john.brown@school.com', role: UserRole.TEACHER, classIds: ['class103', 'class101'], avatarUrl: 'https://picsum.photos/seed/teacher2/100/100', hasSetPassword: false },
  { id: 'parent001', name: 'Alice Johnson', email: 'alice.j@email.com', role: UserRole.PARENT, childStudentIds: ['student001', 'student002'], avatarUrl: 'https://picsum.photos/seed/parent1/100/100', hasSetPassword: false },
  { id: 'parent002', name: 'Bob Williams', email: 'bob.w@email.com', role: UserRole.PARENT, childStudentIds: ['student003'], avatarUrl: 'https://picsum.photos/seed/parent2/100/100', hasSetPassword: false },
  { id: 'parent003', name: 'Carol White', email: 'carol.w@email.com', role: UserRole.PARENT, childStudentIds: ['student001'], avatarUrl: 'https://picsum.photos/seed/parent3/100/100', hasSetPassword: false }
];

let mockStudents: Student[] = [
  { id: 'student001', name: 'Charlie Johnson', classId: 'class101', parentIds: ['parent001', 'parent003'], avatarUrl: 'https://picsum.photos/seed/student1/100/100', hasUserProfile: false },
  { id: 'student002', name: 'Olivia Johnson', classId: 'class102', parentIds: ['parent001'], avatarUrl: 'https://picsum.photos/seed/student2/100/100', hasUserProfile: false },
  { id: 'student003', name: 'David Williams', classId: 'class103', parentIds: ['parent002'], avatarUrl: 'https://picsum.photos/seed/student3/100/100', hasUserProfile: false },
  { id: 'student004', name: 'Sophia Miller', classId: 'class101', parentIds: [], avatarUrl: 'https://picsum.photos/seed/student4/100/100', hasUserProfile: false }, 
];

let mockClasses: Class[] = [
  { 
    id: MASTER_CLASS_ID, 
    name: 'All School (Global Feed)', 
    teacherIds: [], // Not directly managed by teachers in the typical sense
    studentIds: []  // Not for typical enrollment display
  },
  { id: 'class101', name: 'Grade 5 Math', teacherIds: ['teacher001', 'teacher002'], studentIds: ['student001', 'student004'] },
  { id: 'class102', name: 'Grade 5 Science', teacherIds: ['teacher001'], studentIds: ['student002'] },
  { id: 'class103', name: 'Grade 6 History', teacherIds: ['teacher002'], studentIds: ['student003'] },
];

let mockPosts: Post[] = [
  { id: 'post001', authorId: 'teacher001', authorName: 'Ms. Emily Davis', authorAvatarUrl: mockUsers[1].avatarUrl, title: 'Math Homework Update', content: 'Please ensure students complete exercises 1-5 from Chapter 3 for tomorrow.', createdAt: new Date(Date.now() - 86400000).toISOString(), type: PostType.CLASS_UPDATE, targetClassId: 'class101', mediaUrl: 'https://picsum.photos/seed/mathpost/600/400', mediaType: 'image', isCalendarEvent: false, privacyLevel: 'PUBLIC_CLASS' },
  { id: 'post002', authorId: 'teacher001', authorName: 'Ms. Emily Davis', authorAvatarUrl: mockUsers[1].avatarUrl, title: 'Science Fair Project Ideas', content: 'Start thinking about your science fair projects! We will discuss ideas next week.', createdAt: new Date(Date.now() - 172800000).toISOString(), type: PostType.CLASS_UPDATE, targetClassId: 'class102', isCalendarEvent: false, privacyLevel: 'PUBLIC_CLASS' },
  { id: 'post003', authorId: 'admin001', authorName: 'Dr. Admin Smith', authorAvatarUrl: mockUsers[0].avatarUrl, title: 'School Holiday Announcement', content: 'The school will be closed next Monday for a public holiday.', createdAt: new Date(Date.now() - 259200000).toISOString(), type: PostType.ACADEMIC_ANNOUNCEMENT, isCalendarEvent: true, eventDate: new Date(Date.now() + 86400000 * 5).toISOString(), targetClassId: MASTER_CLASS_ID }, // Admin post is calendar event, now targets MASTER_CLASS_ID
  { id: 'post004', authorId: 'teacher002', authorName: 'Mr. John Brown', authorAvatarUrl: mockUsers[2].avatarUrl, title: 'History Museum Trip', content: 'Reminder about our trip to the history museum next Friday. Permission slips are due!', createdAt: new Date().toISOString(), type: PostType.CLASS_UPDATE, targetClassId: 'class103', mediaUrl: 'https://picsum.photos/seed/historypost/600/400', mediaType: 'image', isCalendarEvent: true, eventDate: new Date(Date.now() + 86400000 * 7).toISOString(), privacyLevel: 'PUBLIC_CLASS'},
  { id: 'post005', authorId: 'teacher001', authorName: 'Ms. Emily Davis', authorAvatarUrl: mockUsers[1].avatarUrl, title: 'Parent-Teacher Meeting (Charlie J.)', content: 'Reminder for meeting regarding Charlie Johnson.', createdAt: new Date(Date.now() - 36000000).toISOString(), type: PostType.CLASS_UPDATE, targetClassId: 'class101', isCalendarEvent: true, eventDate: new Date(Date.now() + 86400000 * 3).toISOString(), privacyLevel: 'SPECIFIC_RECIPIENTS', targetStudentIdsForPost: ['student001']},
  { id: 'post006', authorId: 'teacher001', authorName: 'Ms. Emily Davis', authorAvatarUrl: mockUsers[1].avatarUrl, title: 'Reading Group Reminder (Olivia & Sophia)', content: 'Special reading group session tomorrow for Olivia Johnson and Sophia Miller.', createdAt: new Date(Date.now() - 72000000).toISOString(), type: PostType.CLASS_UPDATE, targetClassId: 'class101', isCalendarEvent: true, eventDate: new Date(Date.now() + 86400000 * 1).toISOString(), privacyLevel: 'SPECIFIC_RECIPIENTS', targetStudentIdsForPost: ['student002', 'student004'], targetUserIdsForPost:['parent001']}, // Example with student & user target
];

let mockMessages: Message[] = [
  { id: 'msg001', senderId: 'parent001', receiverId: 'teacher001', senderName: 'Alice Johnson', content: 'Hi Ms. Davis, quick question about Charlie\'s homework.', timestamp: new Date(Date.now() - 3600000).toISOString(), read: false, senderAvatarUrl: mockUsers[3].avatarUrl },
  { id: 'msg002', senderId: 'teacher001', receiverId: 'parent001', senderName: 'Ms. Emily Davis', content: 'Hi Alice, sure, what is it?', timestamp: new Date(Date.now() - 3500000).toISOString(), read: true, senderAvatarUrl: mockUsers[1].avatarUrl },
];

let mockAcademicOrEventItems: AcademicOrEventItem[] = [
    { id: 'acad001', title: 'Mid-Term Exams', description: 'Mid-term exams for all grades.', date: new Date(Date.now() + 86400000 * 14).toISOString(), type: 'academic' },
    { id: 'event001', title: 'Spring Fair', description: 'Annual school spring fair. All are welcome!', date: new Date(Date.now() + 86400000 * 30).toISOString(), type: 'event' },
];

let mockParentTeacherReminders: ParentTeacherReminder[] = [
    { id: 'ptr001', parentId: 'parent001', teacherId: 'teacher001', studentId: 'student001', studentName: 'Charlie Johnson', title: 'Dentist Appointment (Parent Reminder)', description: 'Charlie has a dentist appointment at 2 PM on Wednesday.', eventDate: new Date(Date.now() + 86400000 * 2).toISOString(), createdAt: new Date().toISOString(), acknowledged: false},
];

// --- Role Code History ---
// Initialize history with existing MOCK_ROLE_CODES
let mockRoleCodeHistory: RoleCodeHistoryEntry[] = Object.entries(MOCK_ROLE_CODES).map(([code, details]) => ({
  code,
  userId: details.userId,
  role: details.role,
  createdAt: new Date(0).toISOString(), // Use a very old date for pre-defined ones
}));


// --- API Functions ---
const delay = <T,>(data: T, ms = 200): Promise<T> => new Promise(resolve => setTimeout(() => resolve(data), ms));

// --- User Functions ---
export const fetchUserById = async (userId: string): Promise<User | undefined> => {
  return delay(mockUsers.find(u => u.id === userId));
};

export const fetchAllUsers = async (): Promise<User[]> => {
  return delay([...mockUsers]); // Return a copy
};

// Helper function to get parent User objects from student IDs
export const getUsersFromStudentIds = async (studentIds: string[]): Promise<User[]> => {
    const parentUserIds = new Set<string>();
    studentIds.forEach(studentId => {
        const student = mockStudents.find(s => s.id === studentId);
        if (student && student.parentIds) {
            student.parentIds.forEach(pid => parentUserIds.add(pid));
        }
    });
    const parentUsers = mockUsers.filter(u => parentUserIds.has(u.id));
    return delay(parentUsers);
};


const _generateAndStoreInvitationCode = (userId: string, role: UserRole): string => {
    const prefix = role.substring(0,4).toUpperCase();
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const newCode = `${prefix}-${randomSuffix}`;
    // Store in MOCK_ROLE_CODES for login validation
    (MOCK_ROLE_CODES as Record<string, { userId: string, role: UserRole }>) [newCode] = { userId, role };
    
    // Add to history, ensuring not to duplicate if it somehow was pre-existing
    if (!mockRoleCodeHistory.find(entry => entry.code === newCode)) {
        mockRoleCodeHistory.push({
            code: newCode,
            userId,
            role,
            createdAt: new Date().toISOString()
        });
    }
    return newCode;
};

export const createUser = async (userData: Omit<User, 'id' | 'hasSetPassword' | 'password'>): Promise<UserCreationResponse> => {
    const newUser: User = { 
        id: `user${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, 
        name: userData.name,
        email: userData.email,
        role: userData.role,
        avatarUrl: userData.avatarUrl || DEFAULT_AVATAR_PLACEHOLDER,
        classIds: userData.role === UserRole.TEACHER ? (userData.classIds || []) : undefined,
        childStudentIds: userData.role === UserRole.PARENT ? (userData.childStudentIds || []) : undefined,
        studentId: userData.role === UserRole.STUDENT_USER ? userData.studentId : undefined,
        hasSetPassword: false, // New users must set their password
        password: undefined,  // Password not set initially
    };
    mockUsers.push(newUser);

    let invitationCode: string | undefined = undefined;
    // Generate codes for Admin, Teacher, Parent, or Student_User roles on CREATION.
    if (newUser.role === UserRole.ADMIN || newUser.role === UserRole.TEACHER || newUser.role === UserRole.PARENT || newUser.role === UserRole.STUDENT_USER) {
        invitationCode = _generateAndStoreInvitationCode(newUser.id, newUser.role);
    }
    
    if (newUser.role === UserRole.TEACHER && newUser.classIds) {
        newUser.classIds.forEach(classId => {
            const classIdx = mockClasses.findIndex(c => c.id === classId);
            if (classIdx !== -1) {
                if(!mockClasses[classIdx].teacherIds.includes(newUser.id)) {
                   mockClasses[classIdx].teacherIds.push(newUser.id);
                }
            }
        });
    }
    if (newUser.role === UserRole.PARENT && newUser.childStudentIds) {
        newUser.childStudentIds.forEach(studentId => {
            const studentIdx = mockStudents.findIndex(s => s.id === studentId);
            if (studentIdx !== -1) {
                mockStudents[studentIdx].parentIds = mockStudents[studentIdx].parentIds || [];
                if(!mockStudents[studentIdx].parentIds?.includes(newUser.id)) {
                    mockStudents[studentIdx].parentIds?.push(newUser.id);
                }
            }
        });
    }
    return delay({ user: newUser, invitationCode });
};

export const updateUser = async (userId: string, updates: Partial<User>): Promise<User | undefined> => {
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) return delay(undefined);

    const oldUserData = { ...mockUsers[userIndex] }; 
    const updatedUser = { ...mockUsers[userIndex], ...updates };
    
    if (updates.avatarUrl === '') { 
         updatedUser.avatarUrl = DEFAULT_AVATAR_PLACEHOLDER;
    } else if (updates.avatarUrl === undefined && !oldUserData.avatarUrl) {
        updatedUser.avatarUrl = DEFAULT_AVATAR_PLACEHOLDER;
    }
    mockUsers[userIndex] = updatedUser;

    if (updatedUser.role === UserRole.TEACHER && updates.classIds !== undefined) {
        const oldClassIdsSet = new Set(oldUserData.classIds || []);
        const newClassIdsSet = new Set(updatedUser.classIds || []);

        oldClassIdsSet.forEach(classId => {
            if (!newClassIdsSet.has(classId)) {
                const classIdx = mockClasses.findIndex(c => c.id === classId);
                if (classIdx !== -1) {
                    mockClasses[classIdx].teacherIds = mockClasses[classIdx].teacherIds.filter(tid => tid !== userId);
                }
            }
        });
        newClassIdsSet.forEach(classId => {
            if (!oldClassIdsSet.has(classId)) {
                 const classIdx = mockClasses.findIndex(c => c.id === classId);
                 if (classIdx !== -1 && !mockClasses[classIdx].teacherIds.includes(userId)) {
                     mockClasses[classIdx].teacherIds.push(userId);
                 }
            }
        });
    }

    if (updatedUser.role === UserRole.PARENT && updates.childStudentIds !== undefined) {
        const oldChildIds = new Set(oldUserData.childStudentIds || []);
        const newChildIds = new Set(updates.childStudentIds || []);

        oldChildIds.forEach(studentId => {
            if (!newChildIds.has(studentId)) { 
                const studentIndex = mockStudents.findIndex(s => s.id === studentId);
                if (studentIndex !== -1) {
                    mockStudents[studentIndex].parentIds = mockStudents[studentIndex].parentIds?.filter(pid => pid !== userId);
                }
            }
        });
        newChildIds.forEach(studentId => {
            const studentIndex = mockStudents.findIndex(s => s.id === studentId);
            if (studentIndex !== -1) {
                mockStudents[studentIndex].parentIds = mockStudents[studentIndex].parentIds || [];
                if (!mockStudents[studentIndex].parentIds?.includes(userId)) {
                    mockStudents[studentIndex].parentIds?.push(userId);
                }
            }
        });
    }
    return delay(updatedUser);
};

export const setUserPassword = async (userId: string, passwordToSet: string): Promise<User | undefined> => {
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) return delay(undefined);

    mockUsers[userIndex].password = passwordToSet; // In real app, hash this password
    mockUsers[userIndex].hasSetPassword = true;
    return delay({ ...mockUsers[userIndex] }); // Return a copy
};

export const deleteUser = async (userId: string): Promise<boolean> => {
    const initialLength = mockUsers.length;
    const userToDelete = mockUsers.find(u => u.id === userId);
    if (!userToDelete) return delay(false);

    if (userToDelete.role === UserRole.TEACHER) {
        mockClasses.forEach(c => { 
            c.teacherIds = c.teacherIds.filter(tid => tid !== userId);
        });
    } else if (userToDelete.role === UserRole.PARENT) {
        mockStudents.forEach(s => { 
            if (s.parentIds?.includes(userId)) {
                s.parentIds = s.parentIds.filter(pid => pid !== userId);
            }
        });
    } else if (userToDelete.role === UserRole.STUDENT_USER && userToDelete.studentId) {
        // If a student user is deleted, update the corresponding student record
        const studentIdx = mockStudents.findIndex(s => s.id === userToDelete.studentId);
        if (studentIdx !== -1) {
            mockStudents[studentIdx].userId = undefined;
            mockStudents[studentIdx].hasUserProfile = false;
        }
    }
    
    // Remove from MOCK_ROLE_CODES (used for login)
    for (const code in MOCK_ROLE_CODES) {
        if (MOCK_ROLE_CODES[code].userId === userId) {
            delete (MOCK_ROLE_CODES as Record<string, any>)[code];
            break;
        }
    }
    // Remove from history
    mockRoleCodeHistory = mockRoleCodeHistory.filter(entry => entry.userId !== userId);
    
    mockUsers = mockUsers.filter(u => u.id !== userId);
    return delay(mockUsers.length < initialLength);
};


// --- Class Functions ---
export const fetchAllClasses = async (): Promise<Class[]> => {
    return delay([...mockClasses]);
};
export const fetchClassById = async (classId: string): Promise<Class | undefined> => {
  return delay(mockClasses.find(c => c.id === classId));
};

export const fetchClassesByTeacherId = async (teacherId: string): Promise<Class[]> => {
  return delay(mockClasses.filter(c => c.teacherIds.includes(teacherId) && c.id !== MASTER_CLASS_ID)); // Exclude master class from teacher's list
};

export const createClass = async (classData: Omit<Class, 'id' | 'studentIds' | 'teacherIds'> & { teacherIds?: string[] }): Promise<Class> => {
    const newClass: Class = {
        name: classData.name,
        id: `class${Date.now()}`,
        teacherIds: classData.teacherIds || [], 
        studentIds: [], 
    };
    mockClasses.push(newClass);
    if (newClass.teacherIds.length > 0) {
        newClass.teacherIds.forEach(teacherId => {
            const teacher = mockUsers.find(u => u.id === teacherId && u.role === UserRole.TEACHER);
            if (teacher) {
                if (!teacher.classIds?.includes(newClass.id)) {
                     teacher.classIds = [...(teacher.classIds || []), newClass.id];
                }
            }
        });
    }
    return delay(newClass);
};

export const updateClass = async (classId: string, updates: Partial<Omit<Class, 'teacherIds'>> & { teacherIds?: string[] }): Promise<Class | undefined> => {
    const classIndex = mockClasses.findIndex(c => c.id === classId);
    if (classIndex === -1) return delay(undefined);
    
    // Prevent changing the name of the Master Class to something unidentifiable, or allow only minor edits
    if (classId === MASTER_CLASS_ID && updates.name && !updates.name.toLowerCase().includes("all school") && !updates.name.toLowerCase().includes("global")) {
        console.warn("Attempt to drastically change Master Class name was blocked/modified.");
        // updates.name = mockClasses[classIndex].name; // Or a moderated version
        // For now, let's allow name changes but log it. The ID is the key.
    }

    const oldClassData = { ...mockClasses[classIndex] };
    const updatedClass = { ...mockClasses[classIndex], ...updates }; 
    
    if (updates.teacherIds !== undefined) {
        const oldTeacherIdsSet = new Set(oldClassData.teacherIds || []);
        const newTeacherIdsSet = new Set(updates.teacherIds || []);

        oldTeacherIdsSet.forEach(teacherId => {
            if (!newTeacherIdsSet.has(teacherId)) {
                const teacherIdx = mockUsers.findIndex(u => u.id === teacherId && u.role === UserRole.TEACHER);
                if (teacherIdx !== -1) {
                    mockUsers[teacherIdx].classIds = mockUsers[teacherIdx].classIds?.filter(id => id !== classId);
                }
            }
        });
        newTeacherIdsSet.forEach(teacherId => {
            if (!oldTeacherIdsSet.has(teacherId)) {
                const teacherIdx = mockUsers.findIndex(u => u.id === teacherId && u.role === UserRole.TEACHER);
                if (teacherIdx !== -1) {
                     mockUsers[teacherIdx].classIds = [...(mockUsers[teacherIdx].classIds || []), classId];
                     mockUsers[teacherIdx].classIds = Array.from(new Set(mockUsers[teacherIdx].classIds)); 
                }
            }
        });
        updatedClass.teacherIds = [...newTeacherIdsSet]; 
    }
    mockClasses[classIndex] = updatedClass;

    if(updates.studentIds !== undefined) {
        const oldStudentIds = new Set(oldClassData.studentIds || []);
        const newStudentIds = new Set(updates.studentIds || []);

        oldStudentIds.forEach(studentId => {
            if(!newStudentIds.has(studentId)) {
                const studentIdx = mockStudents.findIndex(s => s.id === studentId);
                if(studentIdx !== -1 && mockStudents[studentIdx].classId === classId) {
                    mockStudents[studentIdx].classId = '';
                }
            }
        });
        newStudentIds.forEach(studentId => {
             const studentIdx = mockStudents.findIndex(s => s.id === studentId);
             if(studentIdx !== -1 && mockStudents[studentIdx].classId !== classId) {
                 if(mockStudents[studentIdx].classId){ 
                     const oldClsIdx = mockClasses.findIndex(c => c.id === mockStudents[studentIdx].classId);
                     if(oldClsIdx !== -1){
                         mockClasses[oldClsIdx].studentIds = mockClasses[oldClsIdx].studentIds.filter(id => id !== studentId);
                     }
                 }
                 mockStudents[studentIdx].classId = classId;
             }
        });
        updatedClass.studentIds = [...newStudentIds];
    }
    mockClasses[classIndex] = updatedClass; 

    return delay(updatedClass);
};

export const deleteClass = async (classId: string): Promise<boolean> => {
    if (classId === MASTER_CLASS_ID) {
        console.warn("Attempted to delete the Master Class. Operation blocked.");
        return delay(false); // Prevent deletion
    }
    const initialLength = mockClasses.length;
    const clsToDelete = mockClasses.find(c => c.id === classId);
    if (!clsToDelete) return delay(false);

    mockStudents.forEach(s => { if (s.classId === classId) s.classId = ''; });
    
    if (clsToDelete.teacherIds) {
        clsToDelete.teacherIds.forEach(teacherId => {
            const teacherIdx = mockUsers.findIndex(u => u.id === teacherId && u.role === UserRole.TEACHER);
            if (teacherIdx !== -1) {
                mockUsers[teacherIdx].classIds = mockUsers[teacherIdx].classIds?.filter(id => id !== classId);
            }
        });
    }
    
    mockClasses = mockClasses.filter(c => c.id !== classId);
    return delay(mockClasses.length < initialLength);
};


// --- Student Functions ---
export interface CreateStudentPayload extends Omit<Student, 'id' | 'userId' | 'hasUserProfile'> {
  createProfile?: boolean;
  email?: string; // Required if createProfile is true
}
export interface CreateStudentResponse {
  student: Student;
  userCreationResponse?: UserCreationResponse;
}

export const fetchAllStudents = async (): Promise<Student[]> => {
    return delay([...mockStudents]);
};

export const fetchClassesByStudentId = async (studentId: string): Promise<Class[]> => {
  const student = mockStudents.find(s => s.id === studentId);
  if (!student || !student.classId) return delay([]); 
  const classObj = mockClasses.find(c => c.id === student.classId);
  return delay(classObj ? [classObj] : []);
};

export const fetchStudentsByClassId = async (classId: string): Promise<Student[]> => {
    if (classId === MASTER_CLASS_ID) return delay([]); // Master class doesn't have "enrolled" students in this context
    return delay(mockStudents.filter(s => s.classId === classId));
};

export const fetchStudentsByParentId = async (parentId: string): Promise<Student[]> => {
    return delay(mockStudents.filter(s => s.parentIds?.includes(parentId)));
};

export const fetchStudentById = async (studentId: string): Promise<Student | undefined> => {
    return delay(mockStudents.find(s => s.id === studentId));
};

export const createStudent = async (studentData: CreateStudentPayload): Promise<CreateStudentResponse> => {
    const newStudent: Student = {
        id: `student${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name: studentData.name,
        avatarUrl: studentData.avatarUrl || DEFAULT_AVATAR_PLACEHOLDER,
        classId: studentData.classId || '',
        parentIds: studentData.parentIds || [],
        hasUserProfile: studentData.createProfile || false,
        // userId will be set if profile is created
    };

    let userCreationResp: UserCreationResponse | undefined = undefined;

    if (studentData.createProfile) {
        if (!studentData.email || !studentData.email.trim()) {
            throw new Error("Email is required to create a user profile for a student.");
        }
        // User created here will also have hasSetPassword: false by default from createUser
        const userForStudent: Omit<User, 'id' | 'hasSetPassword' | 'password'> = {
            name: newStudent.name,
            email: studentData.email,
            role: UserRole.STUDENT_USER,
            avatarUrl: newStudent.avatarUrl,
            studentId: newStudent.id, 
        };
        userCreationResp = await createUser(userForStudent);
        newStudent.userId = userCreationResp.user.id; 
    }

    mockStudents.push(newStudent);

    if (newStudent.classId && newStudent.classId !== MASTER_CLASS_ID) { // Don't add students to master class this way
        const classIdx = mockClasses.findIndex(c => c.id === newStudent.classId);
        if (classIdx !== -1 && !mockClasses[classIdx].studentIds.includes(newStudent.id)) {
            mockClasses[classIdx].studentIds.push(newStudent.id);
        }
    }
    if (newStudent.parentIds) {
        newStudent.parentIds.forEach(parentId => {
            const parentIdx = mockUsers.findIndex(u => u.id === parentId && u.role === UserRole.PARENT);
            if (parentIdx !== -1) {
                 if (!mockUsers[parentIdx].childStudentIds?.includes(newStudent.id)) {
                    mockUsers[parentIdx].childStudentIds = [...(mockUsers[parentIdx].childStudentIds || []), newStudent.id];
                }
            }
        });
    }
    return delay({ student: newStudent, userCreationResponse: userCreationResp });
};

export const updateStudent = async (studentId: string, updates: Partial<Student>): Promise<Student | undefined> => {
    const studentIndex = mockStudents.findIndex(s => s.id === studentId);
    if (studentIndex === -1) return delay(undefined);

    const oldStudentData = { ...mockStudents[studentIndex] };
    const updatedStudent = { 
        ...mockStudents[studentIndex], 
        ...updates, 
        avatarUrl: updates.avatarUrl === '' ? DEFAULT_AVATAR_PLACEHOLDER : (updates.avatarUrl || oldStudentData.avatarUrl || DEFAULT_AVATAR_PLACEHOLDER)
    };
    mockStudents[studentIndex] = updatedStudent;

    // TODO: Handle hasUserProfile changes - if it's toggled, create/delete User record. For now, assume it's set at creation.

    if (updates.classId !== undefined && updates.classId !== oldStudentData.classId) {
        // Disenroll from old class (if not master class)
        if (oldStudentData.classId && oldStudentData.classId !== MASTER_CLASS_ID) { 
            const oldClassIndex = mockClasses.findIndex(c => c.id === oldStudentData.classId);
            if (oldClassIndex !== -1) {
                mockClasses[oldClassIndex].studentIds = mockClasses[oldClassIndex].studentIds.filter(id => id !== studentId);
            }
        }
        // Enroll in new class (if not master class)
        if (updates.classId && updates.classId !== MASTER_CLASS_ID) { 
            const newClassIndex = mockClasses.findIndex(c => c.id === updates.classId);
            if (newClassIndex !== -1) {
                if (!mockClasses[newClassIndex].studentIds.includes(studentId)) {
                    mockClasses[newClassIndex].studentIds.push(studentId);
                }
            }
        }
    }


    if (updates.parentIds !== undefined) {
        const oldParentIds = new Set(oldStudentData.parentIds || []);
        const newParentIds = new Set(updates.parentIds || []);

        oldParentIds.forEach(parentId => {
            if (!newParentIds.has(parentId)) {
                const parentIndex = mockUsers.findIndex(u => u.id === parentId && u.role === UserRole.PARENT);
                if (parentIndex !== -1) {
                    mockUsers[parentIndex].childStudentIds = mockUsers[parentIndex].childStudentIds?.filter(id => id !== studentId);
                }
            }
        });
        newParentIds.forEach(parentId => {
            if (!oldParentIds.has(parentId)) {
                const parentIndex = mockUsers.findIndex(u => u.id === parentId && u.role === UserRole.PARENT);
                if (parentIndex !== -1) {
                    mockUsers[parentIndex].childStudentIds = [...(mockUsers[parentIndex].childStudentIds || []), studentId];
                    mockUsers[parentIndex].childStudentIds = Array.from(new Set(mockUsers[parentIndex].childStudentIds));
                }
            }
        });
    }
    return delay(updatedStudent);
};

export const deleteStudent = async (studentId: string): Promise<boolean> => {
    const initialLength = mockStudents.length;
    const student = mockStudents.find(s => s.id === studentId);
    if (!student) return delay(false);

    // If student has a user profile, delete it too
    if (student.userId && student.hasUserProfile) {
        await deleteUser(student.userId); // This will also remove the MOCK_ROLE_CODE entry and history entry.
    }

    if (student.classId && student.classId !== MASTER_CLASS_ID) {
        const classIdx = mockClasses.findIndex(c => c.id === student.classId);
        if (classIdx !== -1) mockClasses[classIdx].studentIds = mockClasses[classIdx].studentIds.filter(id => id !== studentId);
    }
    if (student.parentIds) {
        student.parentIds.forEach(parentId => {
            const parentIdx = mockUsers.findIndex(u => u.id === parentId && u.role === UserRole.PARENT);
            if (parentIdx !== -1) mockUsers[parentIdx].childStudentIds = mockUsers[parentIdx].childStudentIds?.filter(id => id !== studentId);
        });
    }
    
    mockStudents = mockStudents.filter(s => s.id !== studentId);
    return delay(mockStudents.length < initialLength);
};


// --- Post Functions ---
export const fetchPostsByClassId = async (classId: string, currentUser?: User): Promise<Post[]> => {
    let posts = mockPosts.filter(p => p.targetClassId === classId || (classId === MASTER_CLASS_ID && (p.type === PostType.ACADEMIC_ANNOUNCEMENT || p.type === PostType.EVENT_ANNOUNCEMENT) ) )
        .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (currentUser && currentUser.role !== UserRole.ADMIN && classId !== MASTER_CLASS_ID) { // MASTER_CLASS_ID posts are already broadly filtered by fetchCalendarItemsForUser or implicitly global
        posts = posts.filter(p => {
            if (p.privacyLevel === 'SPECIFIC_RECIPIENTS') {
                if (currentUser.role === UserRole.PARENT) {
                    const parent = currentUser;
                    return (p.targetUserIdsForPost?.includes(parent.id) || 
                           (parent.childStudentIds && p.targetStudentIdsForPost?.some(sid => parent.childStudentIds!.includes(sid)))
                           );
                } else if (currentUser.role === UserRole.STUDENT_USER) {
                    const studentUser = currentUser;
                     return (p.targetUserIdsForPost?.includes(studentUser.id) || 
                            (studentUser.studentId && p.targetStudentIdsForPost?.includes(studentUser.studentId))
                            );
                }
                return false; 
            }
            return true; 
        });
    }
    return delay(posts);
};


export const fetchGlobalPosts = async (): Promise<Post[]> => {
  // Global posts are those targeted to MASTER_CLASS_ID OR admin announcements
  return delay(mockPosts.filter(p => p.targetClassId === MASTER_CLASS_ID && (p.type === PostType.ACADEMIC_ANNOUNCEMENT || p.type === PostType.EVENT_ANNOUNCEMENT || p.type === PostType.CLASS_UPDATE) )
    .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
};

export const createPost = async (
    postData: Omit<Post, 'id' | 'createdAt' | 'authorName' | 'authorAvatarUrl'>, 
    author: User
): Promise<Post> => {
  const newPost: Post = {
    id: `post${Date.now()}`,
    createdAt: new Date().toISOString(),
    authorName: author.name,
    authorAvatarUrl: author.avatarUrl || DEFAULT_AVATAR_PLACEHOLDER,
    eventDate: postData.isCalendarEvent ? postData.eventDate : undefined,
    isCalendarEvent: postData.isCalendarEvent || false,
    privacyLevel: postData.isCalendarEvent 
                    ? (postData.privacyLevel || 'PUBLIC_CLASS') 
                    : undefined, 
    targetUserIdsForPost: postData.privacyLevel === 'SPECIFIC_RECIPIENTS' ? (postData.targetUserIdsForPost || []) : undefined,
    targetStudentIdsForPost: postData.privacyLevel === 'SPECIFIC_RECIPIENTS' ? (postData.targetStudentIdsForPost || []) : undefined,
    ...postData, 
  };
  
  // If Admin is creating a global type post, ensure it targets the MASTER_CLASS_ID
  if (author.role === UserRole.ADMIN && (newPost.type === PostType.ACADEMIC_ANNOUNCEMENT || newPost.type === PostType.EVENT_ANNOUNCEMENT)) {
    newPost.targetClassId = MASTER_CLASS_ID;
  }
  // If it's not a specific recipients post, ensure target arrays are undefined.
  if (newPost.privacyLevel !== 'SPECIFIC_RECIPIENTS') {
    newPost.targetUserIdsForPost = undefined;
    newPost.targetStudentIdsForPost = undefined;
  }

  mockPosts.unshift(newPost);
  return delay(newPost);
};

// --- Message Functions ---
export const fetchMessages = async (userId1: string, userId2: string): Promise<Message[]> => {
  return delay(
    mockMessages.filter(
      m => (m.senderId === userId1 && m.receiverId === userId2) || (m.senderId === userId2 && m.receiverId === userId1)
    ).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  );
};

export const sendMessage = async (messageData: Omit<Message, 'id' | 'timestamp' | 'read' | 'senderName' | 'senderAvatarUrl'>, sender: User): Promise<Message> => {
  const newMessage: Message = {
    ...messageData,
    id: `msg${Date.now()}`,
    timestamp: new Date().toISOString(),
    read: false,
    senderName: sender.name,
    senderAvatarUrl: sender.avatarUrl || DEFAULT_AVATAR_PLACEHOLDER,
  };
  mockMessages.push(newMessage);
  return delay(newMessage);
};

export const fetchConversationsForUser = async (userId: string): Promise<Conversation[]> => {
    const relevantMessages = mockMessages.filter(m => m.senderId === userId || m.receiverId === userId);
    const participantIds = new Set<string>();
    relevantMessages.forEach(m => {
        if (m.senderId !== userId) participantIds.add(m.senderId);
        if (m.receiverId !== userId) participantIds.add(m.receiverId);
    });

    const conversations: Conversation[] = [];
    for (const pId of participantIds) {
        const participant = await fetchUserById(pId); 
        if (participant) {
            const userMessagesWithParticipant = relevantMessages.filter(
                m => (m.senderId === pId && m.receiverId === userId) || (m.senderId === userId && m.receiverId === pId)
            ).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            
            if (userMessagesWithParticipant.length > 0) {
                const ids = [userId, pId].sort();
                const conversationId = ids.join('_');

                conversations.push({
                    id: conversationId,
                    participant,
                    lastMessage: userMessagesWithParticipant[0],
                    unreadCount: userMessagesWithParticipant.filter(m => m.receiverId === userId && !m.read).length,
                });
            }
        }
    }
    const uniqueConversations = Array.from(new Map(conversations.map(c => [c.id, c])).values());
    return delay(uniqueConversations.sort((a,b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()));
};

// --- Calendar/Event Functions ---
export const fetchAcademicAndEventItems = async (): Promise<AcademicOrEventItem[]> => {
    return delay([...mockAcademicOrEventItems].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
};

export const createAcademicOrEventItem = async (itemData: Omit<AcademicOrEventItem, 'id'>): Promise<AcademicOrEventItem> => {
    const newItem: AcademicOrEventItem = { ...itemData, id: `${itemData.type}${Date.now()}` };
    mockAcademicOrEventItems.push(newItem);
    mockAcademicOrEventItems.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return delay(newItem);
};

// --- Role Code Generation & History ---
// Deprecated, use _generateAndStoreInvitationCode and fetchRoleCodeHistory
export const generateRoleCode = async (userId: string, role: UserRole): Promise<string> => {
    const code = _generateAndStoreInvitationCode(userId, role);
    return delay(code);
};

export const fetchRoleCodeHistory = async (): Promise<RoleCodeHistoryEntry[]> => {
    // Return a copy sorted by creation date, most recent first
    return delay([...mockRoleCodeHistory].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
};


// --- ParentTeacherReminder API Functions ---
export const createParentTeacherReminder = async (data: Omit<ParentTeacherReminder, 'id' | 'createdAt' | 'acknowledged' | 'studentName'>): Promise<ParentTeacherReminder> => {
    const student = await fetchStudentById(data.studentId);
    if (!student) throw new Error("Student not found for reminder.");
    
    const newReminder: ParentTeacherReminder = {
        ...data,
        id: `ptr${Date.now()}`,
        studentName: student.name,
        createdAt: new Date().toISOString(),
        acknowledged: false,
    };
    mockParentTeacherReminders.push(newReminder);
    return delay(newReminder);
};

export const fetchParentTeacherRemindersByTeacherId = async (teacherId: string): Promise<ParentTeacherReminder[]> => {
    return delay(mockParentTeacherReminders.filter(r => r.teacherId === teacherId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
};

export const fetchParentTeacherRemindersByParentAndStudentId = async (parentId: string, studentId: string): Promise<ParentTeacherReminder[]> => {
    return delay(mockParentTeacherReminders.filter(r => r.parentId === parentId && r.studentId === studentId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
};

export const acknowledgeParentTeacherReminder = async (reminderId: string): Promise<ParentTeacherReminder | undefined> => {
    const reminderIndex = mockParentTeacherReminders.findIndex(r => r.id === reminderId);
    if (reminderIndex === -1) return delay(undefined);
    mockParentTeacherReminders[reminderIndex].acknowledged = true;
    return delay(mockParentTeacherReminders[reminderIndex]);
};

// --- Unified Calendar Fetching (New Function - Phase 2) ---
export const fetchCalendarItemsForUser = async (
    userId: string, 
    userRole: UserRole, 
    userChildStudentIds?: string[], // For parents
    userTeacherClassIds?: string[] // For teachers
): Promise<CalendarDisplayItem[]> => {
    const allCalendarItems: CalendarDisplayItem[] = [];

    // 1. Fetch Admin-created School-wide Academic/Event Items
    const schoolItems = await fetchAcademicAndEventItems();
    schoolItems.forEach(item => {
        allCalendarItems.push({
            id: `sch-${item.id}`,
            originalId: item.id,
            title: item.title,
            description: item.description,
            date: item.date,
            sourceType: 'school_item',
            isPrivateToUser: false, 
            item: item,
        });
    });

    // 2. Determine relevant class IDs for the current user
    const relevantClassIds = new Set<string>();
    relevantClassIds.add(MASTER_CLASS_ID); // Always include MASTER_CLASS_ID for everyone

    if (userRole === UserRole.ADMIN) {
        mockClasses.forEach(c => relevantClassIds.add(c.id)); // Admin sees all classes
    } else if (userRole === UserRole.TEACHER && userTeacherClassIds) {
        userTeacherClassIds.forEach(id => relevantClassIds.add(id));
    } else if (userRole === UserRole.PARENT && userChildStudentIds) {
        userChildStudentIds.forEach(studentId => {
            const student = mockStudents.find(s => s.id === studentId);
            if (student && student.classId) {
                relevantClassIds.add(student.classId);
            }
        });
    } else if (userRole === UserRole.STUDENT_USER) {
        const studentProfile = mockUsers.find(u => u.id === userId && u.role === UserRole.STUDENT_USER);
        if (studentProfile && studentProfile.studentId) {
            const studentRecord = mockStudents.find(s => s.id === studentProfile.studentId);
            if (studentRecord && studentRecord.classId) {
                relevantClassIds.add(studentRecord.classId);
            }
        }
    }
    
    // 3. Fetch Posts that are calendar events and relevant
    const postsToConsider = mockPosts.filter(p => p.isCalendarEvent && p.targetClassId && relevantClassIds.has(p.targetClassId));

    postsToConsider.forEach(post => {
        let isVisible = false;
        let isPrivateTargeted = false;
        
        // Posts in MASTER_CLASS_ID are generally visible (global announcements, events)
        if (post.targetClassId === MASTER_CLASS_ID) {
            isVisible = true;
        } else if (userRole === UserRole.ADMIN || (userRole === UserRole.TEACHER && post.authorId === userId)) { 
            isVisible = true;
            isPrivateTargeted = post.privacyLevel === 'SPECIFIC_RECIPIENTS';
        } else if (userRole === UserRole.TEACHER && userTeacherClassIds?.includes(post.targetClassId!)) { 
             if (post.privacyLevel === 'PUBLIC_CLASS') isVisible = true;
        }
        else if (post.privacyLevel === 'PUBLIC_CLASS') {
            isVisible = true;
        } else if (post.privacyLevel === 'SPECIFIC_RECIPIENTS') {
            if (userRole === UserRole.PARENT && userChildStudentIds) {
                if (post.targetUserIdsForPost?.includes(userId) || post.targetStudentIdsForPost?.some(sid => userChildStudentIds.includes(sid))) {
                    isVisible = true;
                    isPrivateTargeted = true;
                }
            } else if (userRole === UserRole.STUDENT_USER) {
                const studentUser = mockUsers.find(u => u.id === userId && u.role === UserRole.STUDENT_USER);
                if (studentUser) {
                    if (post.targetUserIdsForPost?.includes(userId) || (studentUser.studentId && post.targetStudentIdsForPost?.includes(studentUser.studentId))) {
                        isVisible = true;
                        isPrivateTargeted = true;
                    }
                }
            }
        }

        if (isVisible) {
            const classInfo = mockClasses.find(c => c.id === post.targetClassId);
            allCalendarItems.push({
                id: `post-${post.id}`,
                originalId: post.id,
                title: post.title,
                description: post.content,
                date: post.eventDate!,
                sourceType: 'class_post',
                authorName: post.authorName,
                className: classInfo?.name === 'All School (Global Feed)' && post.type !== PostType.CLASS_UPDATE ? 'School-Wide' : classInfo?.name, // Adjust display for global items
                isPrivateToUser: isPrivateTargeted,
                item: post,
            });
        }
    });

    // 4. Fetch Parent-to-Teacher Reminders (Only for Teachers)
    if (userRole === UserRole.TEACHER) {
        const parentReminders = await fetchParentTeacherRemindersByTeacherId(userId);
        parentReminders.forEach(reminder => {
            const classInfo = mockClasses.find(c => c.studentIds.includes(reminder.studentId)); 
            allCalendarItems.push({
                id: `ptr-${reminder.id}`,
                originalId: reminder.id,
                title: `Reminder: ${reminder.title} (for ${reminder.studentName})`,
                description: reminder.description,
                date: reminder.eventDate,
                sourceType: 'parent_reminder',
                authorName: mockUsers.find(u => u.id === reminder.parentId)?.name,
                className: classInfo?.name,
                studentName: reminder.studentName,
                isPrivateToUser: true, 
                item: reminder,
            });
        });
    }

    // Sort all items by date
    return delay(allCalendarItems.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
};
