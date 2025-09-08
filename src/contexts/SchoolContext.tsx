import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Class {
  id: string;
  name: string;
  grade: string;
  section: string;
  schoolId: string;
  subjects: ClassSubject[];
}

export interface ClassSubject {
  id: string;
  subjectId: string;
  subjectName: string;
  teacherId?: string;
  teacherName?: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  schoolId: string;
  subjects: string[];
}

export interface Subject {
  id: string;
  name: string;
}

export interface ClassStudent {
  id: string;
  name: string;
  rollNumber: string;
  classId: string;
  subjectId: string;
}

interface SchoolContextType {
  classes: Class[];
  teachers: Teacher[];
  subjects: Subject[];
  classStudents: ClassStudent[];
  createClass: (classData: Omit<Class, 'id' | 'subjects'>) => void;
  addSubjectToClass: (classId: string, subjectId: string) => void;
  assignTeacher: (classId: string, subjectId: string, teacherId: string) => void;
  getTeacherClasses: (teacherId: string) => Class[];
  addStudentToClass: (studentData: Omit<ClassStudent, 'id'>) => void;
  removeStudentFromClass: (studentId: string) => void;
  updateStudent: (studentId: string, data: Partial<ClassStudent>) => void;
  removeSubjectFromClass: (classId: string, subjectId: string) => void;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);


// Mock data
const mockSubjects: Subject[] = [
  { id: '1', name: 'Mathematics' },
  { id: '2', name: 'Science' },
  { id: '3', name: 'English' },
  { id: '4', name: 'History' },
  { id: '5', name: 'Geography' },
  { id: '6', name: 'Computer Science' },
  { id: '7', name: 'Physics' },
  { id: '8', name: 'Chemistry' },
  { id: '9', name: 'Biology' },
  { id: '10', name: 'Art' },
];

const mockTeachers: Teacher[] = [
  { id: '1', name: 'Jane Smith', email: 'jane.smith@school.edu', schoolId: '1', subjects: ['Mathematics', 'Physics'] },
  { id: '2', name: 'John Doe', email: 'john.doe@school.edu', schoolId: '1', subjects: ['English'] },
  { id: '3', name: 'Alice Johnson', email: 'alice.j@school.edu', schoolId: '1', subjects: ['Biology', 'Chemistry'] },
  { id: '4', name: 'Bob Wilson', email: 'bob.w@school.edu', schoolId: '1', subjects: ['History', 'Geography'] },
  { id: '5', name: 'Carol White', email: 'carol.w@school.edu', schoolId: '1', subjects: ['Computer Science'] },
];

export const SchoolProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [classes, setClasses] = useState<Class[]>([
    {
      id: '1',
      name: 'Class 10A',
      grade: '10',
      section: 'A',
      schoolId: '1',
      subjects: [
        { id: '1', subjectId: '1', subjectName: 'Mathematics', teacherId: '1', teacherName: 'Jane Smith' },
        { id: '2', subjectId: '2', subjectName: 'Science', teacherId: '3', teacherName: 'Alice Johnson' },
        { id: '3', subjectId: '3', subjectName: 'English', teacherId: '2', teacherName: 'John Doe' },
      ]
    }
  ]);
  
  const [teachers] = useState<Teacher[]>(mockTeachers);
  const [subjects] = useState<Subject[]>(mockSubjects);
  const [classStudents, setClassStudents] = useState<ClassStudent[]>([
    { id: '1', name: 'Amy Johnson', rollNumber: '001', classId: '1', subjectId: '1' },
    { id: '2', name: 'Brandon Smith', rollNumber: '002', classId: '1', subjectId: '1' },
    { id: '3', name: 'Chloe Williams', rollNumber: '003', classId: '1', subjectId: '2' },
  ]);

  const createClass = (classData: Omit<Class, 'id' | 'subjects'>) => {
    const newClass: Class = {
      ...classData,
      id: Date.now().toString(),
      subjects: []
    };
    setClasses(prev => [...prev, newClass]);
  };

  const addSubjectToClass = (classId: string, subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;

    setClasses(prev => prev.map(cls => {
      if (cls.id === classId) {
        const newSubject: ClassSubject = {
          id: Date.now().toString(),
          subjectId,
          subjectName: subject.name,
        };
        return {
          ...cls,
          subjects: [...cls.subjects, newSubject]
        };
      }
      return cls;
    }));
  };

  const assignTeacher = (classId: string, subjectId: string, teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher) return;

    setClasses(prev => prev.map(cls => {
      if (cls.id === classId) {
        return {
          ...cls,
          subjects: cls.subjects.map(subject => {
            if (subject.subjectId === subjectId) {
              return {
                ...subject,
                teacherId,
                teacherName: teacher.name
              };
            }
            return subject;
          })
        };
      }
      return cls;
    }));
  };

  const getTeacherClasses = (teacherId: string): Class[] => {
    return classes.filter(cls => 
      cls.subjects.some(subject => subject.teacherId === teacherId)
    ).map(cls => ({
      ...cls,
      subjects: cls.subjects.filter(subject => subject.teacherId === teacherId)
    }));
  };

  const addStudentToClass = (studentData: Omit<ClassStudent, 'id'>) => {
    const newStudent: ClassStudent = {
      ...studentData,
      id: Date.now().toString()
    };
    setClassStudents(prev => [...prev, newStudent]);
  };

  const removeStudentFromClass = (studentId: string) => {
    setClassStudents(prev => prev.filter(student => student.id !== studentId));
  };

  const updateStudent = (studentId: string, data: Partial<ClassStudent>) => {
    setClassStudents(prev => prev.map(student => 
      student.id === studentId ? { ...student, ...data } : student
    ));
  };

  const removeSubjectFromClass = (classId: string, subjectId: string) => {
    setClasses(prev =>
      prev.map(cls =>
        cls.id === classId
          ? { ...cls, subjects: cls.subjects.filter(subject => subject.subjectId !== subjectId) }
          : cls
      )
    );
  };
  


  return (
    <SchoolContext.Provider value={{
      classes,
      teachers,
      subjects,
      classStudents,
      createClass,
      addSubjectToClass,
      assignTeacher,
      getTeacherClasses,
      addStudentToClass,
      removeStudentFromClass,
      updateStudent,
      removeSubjectFromClass,
    }}>
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (context === undefined) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};