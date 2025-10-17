import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Plus, Users, BookOpen, UserCog, ChevronDown, ChevronRight, Trash2, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import Select from 'react-select';
import { classesApi, teachersApi, subjectsApi, teacherAssignmentsApi } from '../services/api';
import type { ClassItem, ClassCreateRequest, Teacher, Subject, TeacherAssignment } from '../types/api';

interface CreateClassForm {
  name: string;
  grade: string;
  section: string;
  teacher_id: string;
}

interface ClassWithAssignments extends ClassItem {
  assignments: TeacherAssignment[];
}

const ClassManagement: React.FC = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassWithAssignments[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [expandedClasses, setExpandedClasses] = useState<Set<number>>(new Set());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // For adding subjects to class
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateClassForm>();

  // Only allow principals to access this page
  if (user?.role !== 'principal') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only principals can access class management.</p>
        </div>
      </div>
    );
  }

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [classesData, teachersData, subjectsData] = await Promise.all([
        classesApi.getClasses(user?.school_id),
        teachersApi.getTeachers(user?.school_id),
        subjectsApi.getSubjects()
      ]);

      // Load assignments for each class
      const classesWithAssignments = await Promise.all(
        classesData.map(async (cls) => {
          try {
            const assignments = await teacherAssignmentsApi.getClassAssignments(cls.id);
            return { ...cls, assignments };
          } catch {
            return { ...cls, assignments: [] };
          }
        })
      );

      setClasses(classesWithAssignments);
      setTeachers(teachersData);
      setSubjects(subjectsData);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleClassExpansion = (classId: number) => {
    const newExpanded = new Set(expandedClasses);
    if (newExpanded.has(classId)) {
      newExpanded.delete(classId);
    } else {
      newExpanded.add(classId);
    }
    setExpandedClasses(newExpanded);
  };

  const onCreateClass = async (data: CreateClassForm) => {
    try {
      const classData: ClassCreateRequest = {
        name: data.name,
        grade: data.grade,
        section: data.section,
        school_id: user.school_id!,
        teacher_id: parseInt(data.teacher_id)
      };
      const newClass = await classesApi.createClass(classData);
      setClasses([...classes, { ...newClass, assignments: [] }]);
      reset();
      setIsCreateDialogOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create class');
      console.error('Error creating class:', err);
    }
  };

  const handleAddSubject = async () => {
    if (!selectedClass || !selectedSubject) return;

    try {
      // Check if subject already exists for this class
      const classItem = classes.find(c => c.id === selectedClass);
      const subjectExists = classItem?.assignments.some(a => a.subject_id === selectedSubject);
      
      if (subjectExists) {
        alert('This subject is already added to the class');
        return;
      }

      // Get the class teacher as default teacher for the subject
      const classTeacherId = classItem?.teacher_id;
      
      if (!classTeacherId) {
        alert('Please assign a class teacher first before adding subjects');
        return;
      }

      // Create assignment with class teacher as default
      await teacherAssignmentsApi.createAssignment(selectedClass, selectedSubject, classTeacherId);
      
      // Reload data to show the new assignment
      await loadData();
      
      setSelectedClass(null);
      setSelectedSubject(null);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to add subject');
      console.error('Error adding subject:', err);
    }
  };

  const handleAssignTeacher = async (classId: number, subjectId: number, teacherId: number) => {
    try {
      // Check if assignment already exists
      const classItem = classes.find(c => c.id === classId);
      const existingAssignment = classItem?.assignments.find(
        a => a.subject_id === subjectId
      );

      if (existingAssignment) {
        // Delete old assignment first
        await teacherAssignmentsApi.deleteAssignment(existingAssignment.id);
      }

      // Create new assignment
      await teacherAssignmentsApi.createAssignment(classId, subjectId, teacherId);
      
      // Reload data
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to assign teacher');
      console.error('Error assigning teacher:', err);
    }
  };

  const handleRemoveSubject = async (classId: number, subjectId: number) => {
    const confirmDelete = window.confirm('Are you sure you want to remove this subject from the class?');
    if (!confirmDelete) return;

    try {
      const classItem = classes.find(c => c.id === classId);
      const assignment = classItem?.assignments.find(a => a.subject_id === subjectId);
      
      if (assignment) {
        await teacherAssignmentsApi.deleteAssignment(assignment.id);
        await loadData();
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to remove subject');
      console.error('Error removing subject:', err);
    }
  };

  const handleAssignClassTeacher = async (classId: number, teacherId: number) => {
    try {
      await teachersApi.assignTeacherToClass(classId, teacherId);
      const updatedClasses = await classesApi.getClasses(user?.school_id);
      
      // Preserve assignments
      const classesWithAssignments = await Promise.all(
        updatedClasses.map(async (cls) => {
          const existing = classes.find(c => c.id === cls.id);
          return { ...cls, assignments: existing?.assignments || [] };
        })
      );
      
      setClasses(classesWithAssignments);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to assign class teacher');
      console.error('Error assigning class teacher:', err);
    }
  };

  const handleDeleteClass = async (classId: number) => {
    const classItem = classes.find(c => c.id === classId);
    if (!classItem) return;

    const confirmDelete = window.confirm(
      classItem.student_count > 0
        ? `This class has ${classItem.student_count} students. Are you sure you want to delete it? All students will be removed.`
        : 'Are you sure you want to delete this class?'
    );

    if (!confirmDelete) return;

    try {
      await classesApi.deleteClass(classId, classItem.student_count > 0);
      setClasses(classes.filter(c => c.id !== classId));
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete class');
      console.error('Error deleting class:', err);
    }
  };

  const teacherOptions = teachers.map(teacher => ({
    value: teacher.id,
    label: teacher.name
  }));

  const subjectOptions = subjects.map(subject => ({
    value: subject.id,
    label: subject.name
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-error-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={loadData} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-gray-900">Class & Subject Management</h1>
            <p className="text-gray-600 mt-1">Manage classes, subjects, and teacher assignments</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <button className="btn btn-primary flex items-center">
                <Plus size={16} className="mr-2" />
                Create Class
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Class</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onCreateClass)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class Name</label>
                  <input
                    {...register('name', { required: 'Class name is required' })}
                    className="input"
                    placeholder="e.g., Class 10A"
                  />
                  {errors.name && <p className="text-sm text-error-600 mt-1">{errors.name.message}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
                    <select {...register('grade', { required: 'Grade is required' })} className="select">
                      <option value="">Select Grade</option>
                      {[6, 7, 8, 9, 10, 11, 12].map(grade => (
                        <option key={grade} value={grade.toString()}>{grade}</option>
                      ))}
                    </select>
                    {errors.grade && <p className="text-sm text-error-600 mt-1">{errors.grade.message}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
                    <select {...register('section', { required: 'Section is required' })} className="select">
                      <option value="">Select Section</option>
                      {['A', 'B', 'C', 'D'].map(section => (
                        <option key={section} value={section}>{section}</option>
                      ))}
                    </select>
                    {errors.section && <p className="text-sm text-error-600 mt-1">{errors.section.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class Teacher</label>
                  <select {...register('teacher_id', { required: 'Class teacher is required' })} className="select">
                    <option value="">Select Teacher</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id.toString()}>{teacher.name}</option>
                    ))}
                  </select>
                  {errors.teacher_id && <p className="text-sm text-error-600 mt-1">{errors.teacher_id.message}</p>}
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Class
                  </button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Add Subject to Class */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add Subject to Class</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
            <select
              className="select"
              value={selectedClass || ''}
              onChange={(e) => setSelectedClass(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">Choose a class</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Subject</label>
            <Select
              options={subjectOptions}
              value={subjectOptions.find(opt => opt.value === selectedSubject)}
              onChange={(selected) => setSelectedSubject(selected?.value || null)}
              placeholder="Choose a subject"
              className="text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAddSubject}
              disabled={!selectedClass || !selectedSubject}
              className="btn btn-primary w-full disabled:opacity-50"
            >
              Add Subject
            </button>
          </div>
        </div>
      </div>
      
      {/* Classes List */}
      <div className="space-y-4">
        {classes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Created</h3>
            <p className="text-gray-600 mb-4">Start by creating your first class</p>
            <button onClick={() => setIsCreateDialogOpen(true)} className="btn btn-primary">
              Create First Class
            </button>
          </div>
        ) : (
          classes.map((classItem) => (
            <div key={classItem.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleClassExpansion(classItem.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {expandedClasses.has(classItem.id) ? (
                      <ChevronDown size={20} className="text-gray-400 mr-3" />
                    ) : (
                      <ChevronRight size={20} className="text-gray-400 mr-3" />
                    )}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{classItem.name}</h3>
                      <p className="text-sm text-gray-600">
                        Grade {classItem.grade} • Section {classItem.section}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <BookOpen size={16} className="mr-1" />
                      <span>{classItem.assignments.length} subjects</span>
                    </div>
                    <div className="flex items-center">
                      <UserCog size={16} className="mr-1" />
                      <span>{classItem.assignments.filter(a => a.teacher_id).length} assigned</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClass(classItem.id);
                      }}
                      className="p-2 text-gray-400 hover:text-error-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
              {expandedClasses.has(classItem.id) && (
                <div className="border-t border-gray-200 p-6">
                  {/* Class Teacher Assignment */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-4">Class Teacher</h4>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <Select
                          options={teacherOptions}
                          value={teacherOptions.find(opt => opt.value === classItem.teacher_id)}
                          onChange={(selected) => {
                            if (selected) {
                              handleAssignClassTeacher(classItem.id, selected.value);
                            }
                          }}
                          placeholder="Select class teacher"
                          className="text-sm"
                        />
                      </div>
                      {classItem.teacher_name && (
                        <div className="text-sm text-gray-600">
                          Currently assigned: <span className="font-medium">{classItem.teacher_name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subject Teachers */}
                  <h4 className="font-medium text-gray-900 mb-4">Subjects & Teachers</h4>
                  {classItem.assignments.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No subjects added yet</p>
                  ) : (
                    <div className="space-y-3">
                      {classItem.assignments.map((assignment) => {
                        const subject = subjects.find(s => s.id === assignment.subject_id);
                        const teacher = teachers.find(t => t.id === assignment.teacher_id);
                        
                        return (
                          <div key={assignment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              <BookOpen size={16} className="text-primary-600 mr-3" />
                              <div>
                                <h5 className="font-medium text-gray-900">{subject?.name || 'Unknown Subject'}</h5>
                                <p className="text-sm text-gray-600">
                                  {teacher ? `Assigned to: ${teacher.name}` : 'No teacher assigned'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Select
                                options={teacherOptions}
                                value={teacherOptions.find(opt => opt.value === assignment.teacher_id)}
                                onChange={(selected) => {
                                  if (selected) {
                                    handleAssignTeacher(classItem.id, assignment.subject_id, selected.value);
                                  }
                                }}
                                placeholder="Assign teacher"
                                className="text-sm w-48"
                              />
                              <button
                                className="p-2 text-gray-400 hover:text-error-600"
                                onClick={() => handleRemoveSubject(classItem.id, assignment.subject_id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClassManagement;