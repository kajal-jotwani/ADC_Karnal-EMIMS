import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSchool } from "../contexts/SchoolContext";
import { Users, BookOpen, Plus } from "lucide-react";
import { useForm } from "react-hook-form";

interface StudentForm {
  name: string;
  rollNo: string;
}

export interface Class {
  id: string;
  name: string;
  grade: number;
  section: string;
  subjects: Subject[];
  students: Student[]; 
}

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const { classes, addStudentToClass, classStudents } = useSchool();
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<StudentForm>();

  if (user?.role !== "teacher") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only teachers can access this dashboard.</p>
        </div>
      </div>
    );
  }

  // filter only classes where this teacher is assigned
  const assignedClasses = classes.filter(cls =>
    cls.subjects.some(subject => subject.teacherId === user.id)
  );

  const onAddStudent = (data: StudentForm) => {
    if (!selectedClass) return;
    addStudentToClass({
      classId: selectedClass,
      name: data.name,
      rollNo: data.rollNo,
    });
    reset();
  };

  const getStudentsForClass = (classId: string) =>
    classStudents.filter(stu => stu.classId === classId);

  return (
    <div className="fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Teacher Dashboard</h1>
      <p className="text-gray-600 mb-6">Welcome {user.name}, here are your classes:</p>

      {assignedClasses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Assigned</h3>
          <p className="text-gray-600">Please wait until the principal assigns you to a class.</p>
        </div>
      ) : (
        assignedClasses.map(cls => (
          <div key={cls.id} className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {cls.name} (Grade {cls.grade} • Section {cls.section})
            </h2>

            <div className="mt-3">
              <h3 className="font-medium text-gray-700 mb-2">Subjects Assigned:</h3>
              <ul className="list-disc ml-6 text-gray-600">
                {cls.subjects
                  .filter(sub => sub.teacherId === user.id)
                  .map(sub => (
                    <li key={sub.id}>{sub.subjectName}</li>
                  ))}
              </ul>
            </div>

            {/* Students List */}
            <div className="mt-6">
              <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                <Users size={16} className="mr-2" /> Students
              </h3>
              {getStudentsForClass(cls.id).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getStudentsForClass(cls.id).map(stu => (
                    <div
                      key={stu.id}
                      className="p-3 bg-gray-50 rounded-lg flex justify-between"
                    >
                      <span className="font-medium text-gray-800">
                        {stu.rollNumber} - {stu.name}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No students added yet</p>
              )}
            </div>

            {/* Add Student Form */}
            <form
              onSubmit={handleSubmit(onAddStudent)}
              className="mt-6 p-4 border rounded-md bg-gray-50"
            >
              <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                <Plus size={16} className="mr-2" /> Add Student
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <input
                  {...register("name", { required: true })}
                  placeholder="Student Name"
                  className="input"
                />
                <input
                  {...register("rollNo", { required: true })}
                  placeholder="Roll No"
                  className="input"
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary mt-3"
                onClick={() => setSelectedClass(cls.id)}
              >
                Add
              </button>
            </form>
          </div>
        ))
      )}
    </div>
  );
};

export default TeacherDashboard;