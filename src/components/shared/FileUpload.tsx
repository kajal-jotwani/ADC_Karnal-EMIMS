import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { useData, StudentRecord, SchoolData } from '../../contexts/DataContext';

interface FileUploadProps {
  type: 'students' | 'schools';
  onUploadComplete?: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ type, onUploadComplete }) => {
  const { uploadStudentData, uploadSchoolData } = useData();

  const processFile = useCallback((file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        let jsonData: any[] = [];

        if (file.name.endsWith('.csv')) {
          // Parse CSV
          Papa.parse(data as string, {
            header: true,
            complete: (results) => {
              jsonData = results.data;
              processData(jsonData);
            },
            error: (error) => {
              console.error('CSV parsing error:', error);
              alert('Error parsing CSV file. Please check the format.');
            }
          });
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          // Parse Excel
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          jsonData = XLSX.utils.sheet_to_json(worksheet);
          processData(jsonData);
        }
      } catch (error) {
        console.error('File processing error:', error);
        alert('Error processing file. Please check the format.');
      }
    };

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  }, []);

  const processData = (jsonData: any[]) => {
    try {
      if (type === 'students') {
        const studentData: StudentRecord[] = jsonData.map((row, index) => ({
          id: row.id || `student_${index + 1}`,
          name: row.name || row.Name || '',
          grade: row.grade || row.Grade || '',
          section: row.section || row.Section || '',
          school: row.school || row.School || '',
          math: parseFloat(row.math || row.Math || row.Mathematics || 0) || undefined,
          science: parseFloat(row.science || row.Science || 0) || undefined,
          english: parseFloat(row.english || row.English || 0) || undefined,
          history: parseFloat(row.history || row.History || 0) || undefined,
          geography: parseFloat(row.geography || row.Geography || 0) || undefined,
          computer: parseFloat(row.computer || row['Computer Science'] || 0) || undefined,
          attendance: parseFloat(row.attendance || row.Attendance || 0) || undefined,
        }));
        
        uploadStudentData(studentData);
        alert(`Successfully uploaded ${studentData.length} student records!`);
      } else if (type === 'schools') {
        const schoolData: SchoolData[] = jsonData.map((row, index) => ({
          id: row.id || `school_${index + 1}`,
          name: row.name || row.Name || '',
          category: row.category || row.Category || '',
          location: row.location || row.Location || '',
          type: row.type || row.Type || 'Public',
          students: parseInt(row.students || row.Students || 0) || 0,
          teachers: parseInt(row.teachers || row.Teachers || 0) || 0,
          performance: parseFloat(row.performance || row.Performance || 0) || 0,
        }));
        
        uploadSchoolData(schoolData);
        alert(`Successfully uploaded ${schoolData.length} school records!`);
      }
      
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error('Data processing error:', error);
      alert('Error processing data. Please check the file format and column names.');
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      processFile(acceptedFiles[0]);
    }
  }, [processFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  });

  const expectedColumns = type === 'students' 
    ? ['name', 'grade', 'section', 'school', 'math', 'science', 'english', 'attendance']
    : ['name', 'category', 'location', 'type', 'students', 'teachers', 'performance'];

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload size={48} className="mx-auto mb-4 text-gray-400" />
        
        {isDragActive ? (
          <p className="text-primary-600 font-medium">Drop the file here...</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">
              Drag and drop a CSV or Excel file here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              Supports .csv, .xlsx, and .xls files
            </p>
          </div>
        )}
      </div>
      
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start">
          <AlertCircle size={20} className="text-blue-600 mr-2 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-800 mb-2">Expected Columns:</h4>
            <div className="flex flex-wrap gap-2">
              {expectedColumns.map(col => (
                <span key={col} className="badge bg-blue-100 text-blue-800 text-xs">
                  {col}
                </span>
              ))}
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Column names are case-insensitive. Missing columns will be set to default values.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;