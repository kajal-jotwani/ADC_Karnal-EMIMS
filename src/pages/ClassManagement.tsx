import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSchool } from '../contexts/SchoolContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Plus, Users, BookOpen, UserCog, ChevronDown, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import Select from 'react-select';

interface CreateClassForm {
  name: string;
  grade: string;
  section: string;
}

const ClassManagement: React.FC = () => {
  const { user } = useAuth();
  const { classes, teachers, subjects, createClass, addSubjectToClass, assignTeacher, removeSubjectFromClass } = useSchool();
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

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

  const schoolClasses = classes.filter(cls => cls.schoolId === user.schoolId);

  const toggleClassExpansion = (classId: string) => {
    const newExpanded = new Set(expandedClasses);
    if (newExpanded.has(classId)) {
      newExpanded.delete(classId);
    } else {
      newExpanded.add(classId);
    }
    setExpandedClasses(newExpanded);
  };

  const onCreateClass = (data: CreateClassForm) => {
    createClass({
      ...data,
      schoolId: user.schoolId!
    });
    reset();
    setIsCreateDialogOpen(false);
  };

  const handleAddSubject = () => {
    if (selectedClass && selectedSubject) {
      addSubjectToClass(selectedClass, selectedSubject);
      setSelectedClass(null);
      setSelectedSubject(null);
    }
  };

  const handleAssignTeacher = (classId: string, subjectId: string, teacherId: string) => {
    assignTeacher(classId, subjectId, teacherId);
  };

  const subjectOptions = subjects.map(subject => ({
    value: subject.id,
    label: subject.name
  }));

  const teacherOptions = teachers.map(teacher => ({
    value: teacher.id,
    label: teacher.name
  }));

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
              onChange={(e) => setSelectedClass(e.target.value || null)}
            >
              <option value="">Choose a class</option>
              {schoolClasses.map(cls => (
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
        {schoolClasses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Created</h3>
            <p className="text-gray-600 mb-4">Start by creating your first class</p>
            <button onClick={() => setIsCreateDialogOpen(true)} className="btn btn-primary">
              Create First Class
            </button>
          </div>
        ) : (
          schoolClasses.map((classItem) => (
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
                      <span>{classItem.subjects.length} subjects</span>
                    </div>
                    <div className="flex items-center">
                      <UserCog size={16} className="mr-1" />
                      <span>{classItem.subjects.filter(s => s.teacherId).length} assigned</span>
                    </div>
                  </div>
                </div>
              </div>
              {expandedClasses.has(classItem.id) && (
                <div className="border-t border-gray-200 p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Subjects & Teachers</h4>
                  {classItem.subjects.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No subjects added yet</p>
                  ) : (
                    <div className="space-y-3">
                      {classItem.subjects.map((subject) => (
                        <div key={subject.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <BookOpen size={16} className="text-primary-600 mr-3" />
                            <div>
                              <h5 className="font-medium text-gray-900">{subject.subjectName}</h5>
                              <p className="text-sm text-gray-600">
                                {subject.teacherName ? `Assigned to: ${subject.teacherName}` : 'No teacher assigned'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Select
                              options={teacherOptions}
                              value={teacherOptions.find(opt => opt.value === subject.teacherId)}
                              onChange={(selected) => {
                                if (selected) {
                                  handleAssignTeacher(classItem.id, subject.subjectId, selected.value);
                                }
                              }}
                              placeholder="Assign teacher"
                              className="text-sm w-48"
                            />
                            <button
  className="p-2 text-gray-400 hover:text-error-600"
  onClick={() => removeSubjectFromClass(classItem.id, subject.subjectId)}
>
  <Trash2 size={16} />
</button>
                          </div>
                        </div>
                      ))}
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