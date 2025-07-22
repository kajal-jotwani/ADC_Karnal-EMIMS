import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface StudentRecord {
  id: string;
  name: string;
  grade: string;
  section: string;
  school: string;
  math?: number;
  science?: number;
  english?: number;
  history?: number;
  geography?: number;
  computer?: number;
  term1Math?: number;
  term1Science?: number;
  term1English?: number;
  term2Math?: number;
  term2Science?: number;
  term2English?: number;
  term3Math?: number;
  term3Science?: number;
  term3English?: number;
  attendance?: number;
}

export interface SchoolData {
  id: string;
  name: string;
  category: string;
  location: string;
  type: string;
  students: number;
  teachers: number;
  performance: number;
}

export interface SubjectPerformance {
  subject: string;
  average: number;
  district: number;
  state: number;
}

interface DataContextType {
  studentData: StudentRecord[];
  schoolData: SchoolData[];
  subjectPerformance: SubjectPerformance[];
  uploadStudentData: (data: StudentRecord[]) => void;
  uploadSchoolData: (data: SchoolData[]) => void;
  exportData: (type: 'students' | 'schools' | 'performance', format: 'csv' | 'excel') => void;
  getFilteredData: (filters: any) => StudentRecord[];
  calculateSubjectPerformance: () => SubjectPerformance[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Default data
const defaultStudentData: StudentRecord[] = [
  { id: '1', name: 'Amy Johnson', grade: '10', section: 'A', school: 'Lincoln High School', math: 85, science: 78, english: 92, attendance: 92 },
  { id: '2', name: 'Brandon Smith', grade: '10', section: 'A', school: 'Lincoln High School', math: 75, science: 82, english: 79, attendance: 88 },
  { id: '3', name: 'Chloe Williams', grade: '9', section: 'B', school: 'Lincoln High School', math: 92, science: 88, english: 85, attendance: 95 },
  { id: '4', name: 'Daniel Brown', grade: '11', section: 'A', school: 'Lincoln High School', math: 80, science: 75, english: 85, attendance: 90 },
  { id: '5', name: 'Emma Davis', grade: '9', section: 'A', school: 'Washington Middle School', math: 95, science: 92, english: 90, attendance: 97 },
];

const defaultSchoolData: SchoolData[] = [
  { id: '1', name: 'Lincoln High School', category: 'High School', location: 'North District', type: 'Public', students: 1245, teachers: 87, performance: 82 },
  { id: '2', name: 'Washington Middle School', category: 'Middle School', location: 'North District', type: 'Public', students: 870, teachers: 56, performance: 78 },
  { id: '3', name: 'Roosevelt Elementary', category: 'Elementary', location: 'South District', type: 'Public', students: 620, teachers: 42, performance: 85 },
];

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [studentData, setStudentData] = useState<StudentRecord[]>(defaultStudentData);
  const [schoolData, setSchoolData] = useState<SchoolData[]>(defaultSchoolData);
  const [subjectPerformance, setSubjectPerformance] = useState<SubjectPerformance[]>([]);

  const uploadStudentData = (data: StudentRecord[]) => {
    setStudentData(data);
    // Recalculate subject performance when new data is uploaded
    calculateSubjectPerformance();
  };

  const uploadSchoolData = (data: SchoolData[]) => {
    setSchoolData(data);
  };

  const calculateSubjectPerformance = (): SubjectPerformance[] => {
    const subjects = ['math', 'science', 'english', 'history', 'geography', 'computer'];
    const performance: SubjectPerformance[] = [];

    subjects.forEach(subject => {
      const scores = studentData
        .map(student => student[subject as keyof StudentRecord] as number)
        .filter(score => score !== undefined && score !== null);

      if (scores.length > 0) {
        const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        performance.push({
          subject: subject.charAt(0).toUpperCase() + subject.slice(1),
          average: Math.round(average),
          district: Math.round(average - 3 + Math.random() * 6), // Simulated district average
          state: Math.round(average - 5 + Math.random() * 6), // Simulated state average
        });
      }
    });

    setSubjectPerformance(performance);
    return performance;
  };

  const exportData = async (type: 'students' | 'schools' | 'performance', format: 'csv' | 'excel') => {
    const { saveAs } = await import('file-saver');
    
    let data: any[] = [];
    let filename = '';

    switch (type) {
      case 'students':
        data = studentData;
        filename = `students_data.${format}`;
        break;
      case 'schools':
        data = schoolData;
        filename = `schools_data.${format}`;
        break;
      case 'performance':
        data = subjectPerformance;
        filename = `performance_data.${format}`;
        break;
    }

    if (format === 'csv') {
      const Papa = await import('papaparse');
      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, filename);
    } else if (format === 'excel') {
      const XLSX = await import('xlsx');
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data');
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
      saveAs(blob, filename);
    }
  };

  const getFilteredData = (filters: any): StudentRecord[] => {
    return studentData.filter(student => {
      if (filters.school && student.school !== filters.school) return false;
      if (filters.grade && student.grade !== filters.grade) return false;
      if (filters.section && student.section !== filters.section) return false;
      return true;
    });
  };

  return (
    <DataContext.Provider value={{
      studentData,
      schoolData,
      subjectPerformance: subjectPerformance.length > 0 ? subjectPerformance : calculateSubjectPerformance(),
      uploadStudentData,
      uploadSchoolData,
      exportData,
      getFilteredData,
      calculateSubjectPerformance,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};