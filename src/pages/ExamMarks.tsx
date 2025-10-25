import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Papa from "papaparse";
import {
  BookOpen,
  Plus,
  Save,
  FileText,
  Award,
  Download,
  Upload,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { examsAPI, classesApi, teacherAssignmentsApi } from "../services/api";
import type {
  Exam,
  ExamMarksCreate,
  TeacherAssignmentResponse,
} from "../types/api";

// Validation schemas
const examSchema = z.object({
  name: z.string().min(1, "Exam name is required"),
  subject_id: z.string().min(1, "Subject is required"),
  class_id: z.string().min(1, "Class is required"),
  max_marks: z.number().min(1, "Max marks must be greater than 0"),
  exam_date: z.string().optional(),
});

const marksSchema = z.object({
  marks: z.array(
    z.object({
      student_id: z.string(),
      marks_obtained: z.number().min(0, "Marks cannot be negative"),
    })
  ),
});

type ExamForm = z.infer<typeof examSchema>;
type MarksForm = z.infer<typeof marksSchema>;

interface StudentMark {
  student_id: string;
  student_name: string;
  roll_no: string;
  marks_obtained: number;
}

const ExamMarks: React.FC = () => {
  const { user } = useAuth();
  const [teacherAssignments, setTeacherAssignments] = useState<
    TeacherAssignmentResponse[]
  >([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [studentMarks, setStudentMarks] = useState<StudentMark[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [csvUploadMessage, setCsvUploadMessage] = useState<string>("");

  const examForm = useForm<ExamForm>({
    resolver: zodResolver(examSchema),
    defaultValues: { max_marks: 100 },
  });

  const marksForm = useForm<MarksForm>({
    resolver: zodResolver(marksSchema),
  });

  // Load teacher assignments (subjects and classes)
  useEffect(() => {
    const loadAssignments = async () => {
      if (!user?.id) return;
      try {
        console.log("Fetching assignments for current teacher");
        const data = await teacherAssignmentsApi.getMySubjectsAndClasses();
        console.log("Teacher assignments loaded:", data);
        setTeacherAssignments(data);

        if (data.length === 0) {
          setSubmitMessage(
            "No subjects/classes assigned. Please contact your principal."
          );
        }
      } catch (error: any) {
        console.error("Error loading assignments:", error);
        setSubmitMessage("Error loading your assignments. Please try again.");
        setTimeout(() => setSubmitMessage(""), 5000);
      }
    };
    loadAssignments();
  }, [user?.id]);

  // Load exams
  useEffect(() => {
    const loadExams = async () => {
      setIsLoading(true);
      try {
        const data = await examsAPI.getMyExams();
        console.log("Exams loaded:", data);
        setExams(data);
      } catch (error: any) {
        console.error("Error loading exams:", error);
        setSubmitMessage("Error loading exams. Please try again.");
        setTimeout(() => setSubmitMessage(""), 3000);
      } finally {
        setIsLoading(false);
      }
    };
    loadExams();
  }, []);

  const onCreateExam = async (data: ExamForm) => {
    setIsSubmitting(true);
    try {
      console.log("Creating exam with data:", data);
      const examData = {
        name: data.name,
        subject_id: parseInt(data.subject_id),
        class_id: parseInt(data.class_id),
        max_marks: data.max_marks,
        exam_date: data.exam_date || undefined,
      };
      const newExam = await examsAPI.createExam(examData);
      console.log("Exam created:", newExam);
      setExams((prev) => [...prev, newExam]);
      setIsCreateDialogOpen(false);
      examForm.reset({ max_marks: 100 });
      setSubmitMessage("Exam created successfully!");
      setTimeout(() => setSubmitMessage(""), 3000);
    } catch (error: any) {
      console.error("Error creating exam:", error);
      const errorMsg =
        error.response?.data?.detail || error.message || "Error creating exam.";
      setSubmitMessage(errorMsg);
      setTimeout(() => setSubmitMessage(""), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExamSelect = async (exam: Exam) => {
    setSelectedExam(exam);
    setIsLoading(true);
    try {
      console.log("Loading students for exam:", exam);
      const students = await classesApi.getStudents(exam.class_id);
      const existingMarks = await examsAPI.getExamMarks(exam.id);
      console.log("Students:", students, "Existing marks:", existingMarks);

      const studentsWithMarks: StudentMark[] = students.map((s) => {
        const mark = existingMarks.find((m) => m.student_id === s.id);
        return {
          student_id: s.id.toString(),
          student_name: s.name,
          roll_no: s.roll_no,
          marks_obtained: mark ? mark.marks_obtained : 0,
        };
      });

      setStudentMarks(studentsWithMarks);
      marksForm.setValue(
        "marks",
        studentsWithMarks.map((s) => ({
          student_id: s.student_id,
          marks_obtained: s.marks_obtained,
        }))
      );
    } catch (error: any) {
      console.error("Error loading exam data:", error);
      setSubmitMessage("Error loading exam data. Please try again.");
      setTimeout(() => setSubmitMessage(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStudentMarks = (studentId: string, marks: number) => {
    const updatedMarks = studentMarks.map((s) =>
      s.student_id === studentId ? { ...s, marks_obtained: marks } : s
    );
    setStudentMarks(updatedMarks);
    marksForm.setValue(
      "marks",
      updatedMarks.map((s) => ({
        student_id: s.student_id,
        marks_obtained: s.marks_obtained,
      }))
    );
  };

  const onSubmitMarks = async (data: MarksForm) => {
    if (!selectedExam) return;
    setIsSubmitting(true);

    try {
      for (const m of data.marks) {
        const value = Number(m.marks_obtained);

        // Basic validation
        if (
          !Number.isFinite(value) ||
          value < 0 ||
          value > selectedExam.max_marks
        ) {
          setSubmitMessage(
            `Marks must be between 0 and ${selectedExam.max_marks} for student ${m.student_id}`
          );
          setIsSubmitting(false);
          return; // Stop submission early
        }
      }

      // Build validated data only after checks
      const marksData: ExamMarksCreate[] = data.marks.map((m) => ({
        exam_id: selectedExam.id,
        student_id: parseInt(m.student_id),
        marks_obtained: Number(m.marks_obtained),
      }));

      console.log("Submitting marks:", marksData);
      await examsAPI.submitExamMarks(marksData);
      setSubmitMessage("Marks saved successfully!");
      setTimeout(() => setSubmitMessage(""), 3000);
    } catch (error: any) {
      console.error("Error saving marks:", error);
      const errorMsg =
        error.response?.data?.detail || error.message || "Error saving marks.";
      setSubmitMessage(errorMsg);
      setTimeout(() => setSubmitMessage(""), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle CSV upload
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!selectedExam) {
      setCsvUploadMessage("Error: No exam selected");
      return;
    }

    setCsvUploadMessage("Processing CSV...");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        try {
          const parsedData = results.data as any[];
          console.log("CSV parsed:", parsedData);

          let matchedCount = 0;
          let invalidCount = 0;

          const updatedMarks = studentMarks.map((student) => {
            // Try to match by roll_no (trim whitespace)
            const csvRow = parsedData.find(
              (row) =>
                String(row.roll_no || "").trim() ===
                String(student.roll_no).trim()
            );

            if (csvRow && csvRow.marks_obtained !== undefined) {
              // Convert to number, defaulting to 0 if NaN
              const marks = Number(csvRow.marks_obtained);
              
              // Validate the marks are within bounds
              if (isNaN(marks) || marks < 0 || marks > selectedExam.max_marks) {
                invalidCount++;
                console.warn(`Invalid marks for roll no ${student.roll_no}: ${csvRow.marks_obtained} (must be 0-${selectedExam.max_marks})`);
                return student;
              }
              
              matchedCount++;
              return {
                ...student,
                marks_obtained: marks,
              };
            }
            return student;
          });

          setStudentMarks(updatedMarks);
          marksForm.setValue(
            "marks",
            updatedMarks.map((s) => ({
              student_id: s.student_id,
              marks_obtained: s.marks_obtained,
            }))
          );

          setCsvUploadMessage(
           `✓ CSV uploaded! Matched ${matchedCount} of ${studentMarks.length} students.${
              invalidCount > 0 ? ` ${invalidCount} invalid marks skipped (must be 0-${selectedExam.max_marks}).` : ''
            }`
          );
          setTimeout(() => setCsvUploadMessage(""), 5000);
        } catch (err) {
          console.error("Error processing CSV:", err);
          setCsvUploadMessage("Error processing CSV. Check format.");
          setTimeout(() => setCsvUploadMessage(""), 5000);
        }
      },
      error: (error) => {
        console.error("CSV parse error:", error);
        setCsvUploadMessage("Error reading CSV file.");
        setTimeout(() => setCsvUploadMessage(""), 5000);
      },
    });

    // Reset input
    e.target.value = "";
  };

  // Handle CSV download
  const handleCsvDownload = () => {
    try {
      const csvData = studentMarks.map((s) => ({
        roll_no: s.roll_no,
        student_name: s.student_name,
        marks_obtained: s.marks_obtained,
      }));

      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${selectedExam?.name || "marks"}_${
          new Date().toISOString().split("T")[0]
        }.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setCsvUploadMessage("✓ CSV downloaded successfully!");
      setTimeout(() => setCsvUploadMessage(""), 3000);
    } catch (error) {
      console.error("Error downloading CSV:", error);
      setCsvUploadMessage("Error downloading CSV.");
      setTimeout(() => setCsvUploadMessage(""), 3000);
    }
  };

  const getSubjectOptions = () => {
    const subjectsMap = new Map<number, string>();
    teacherAssignments.forEach((a) => {
      subjectsMap.set(a.subject_id, a.subject_name);
    });
    return Array.from(subjectsMap.entries()).map(([id, name]) => ({
      id,
      name,
    }));
  };

  const getClassOptions = () => {
    const classesMap = new Map<number, string>();
    teacherAssignments.forEach((a) => {
      classesMap.set(a.class_id, a.class_name);
    });
    return Array.from(classesMap.entries()).map(([id, name]) => ({
      id,
      name,
    }));
  };

  // Loading state
  if (isLoading && exams.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exams...</p>
        </div>
      </div>
    );
  }

  // Only allow teachers
  if (user?.role !== "teacher") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            Only teachers can access exam marks entry.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-gray-900">
              Exam & Marks Entry
            </h1>
            <p className="text-gray-600 mt-1">
              Create exams and enter student marks
            </p>
          </div>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <button className="btn btn-primary flex items-center whitespace-nowrap">
                <Plus size={16} className="mr-2" />
                Create Exam
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-white">
              <DialogHeader>
                <DialogTitle>Create New Exam</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={examForm.handleSubmit(onCreateExam)}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam Name *
                  </label>
                  <input
                    {...examForm.register("name")}
                    className="input w-full"
                    placeholder="e.g., Midterm Math Test"
                  />
                  {examForm.formState.errors.name && (
                    <p className="text-sm text-red-600 mt-1">
                      {examForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select
                      {...examForm.register("subject_id")}
                      className="select w-full"
                    >
                      <option value="">Select Subject</option>
                      {getSubjectOptions().map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                    {examForm.formState.errors.subject_id && (
                      <p className="text-sm text-red-600 mt-1">
                        {examForm.formState.errors.subject_id.message}
                      </p>
                    )}
                    {getSubjectOptions().length === 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        No subjects assigned
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Class *
                    </label>
                    <select
                      {...examForm.register("class_id")}
                      className="select w-full"
                    >
                      <option value="">Select Class</option>
                      {getClassOptions().map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                    {examForm.formState.errors.class_id && (
                      <p className="text-sm text-red-600 mt-1">
                        {examForm.formState.errors.class_id.message}
                      </p>
                    )}
                    {getClassOptions().length === 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        No classes assigned
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Marks *
                    </label>
                    <input
                      type="number"
                      {...examForm.register("max_marks", {
                        valueAsNumber: true,
                      })}
                      className="input w-full"
                      min="1"
                    />
                    {examForm.formState.errors.max_marks && (
                      <p className="text-sm text-red-600 mt-1">
                        {examForm.formState.errors.max_marks.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exam Date
                    </label>
                    <input
                      type="date"
                      {...examForm.register("exam_date")}
                      className="input w-full"
                    />
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="btn btn-outline w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      getSubjectOptions().length === 0 ||
                      getClassOptions().length === 0
                    }
                    className="btn btn-primary w-full sm:w-auto"
                  >
                    {isSubmitting ? "Creating..." : "Create Exam"}
                  </button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {submitMessage && (
        <div
          className={`mb-4 p-3 rounded-md text-sm font-medium ${
            submitMessage.includes("Error") || submitMessage.includes("error")
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-green-50 text-green-700 border border-green-200"
          }`}
        >
          {submitMessage}
        </div>
      )}

      {!selectedExam ? (
        /* Exams List */
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900">Your Exams</h2>

          {exams.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Exams Created
              </h3>
              <p className="text-gray-600 mb-4">
                Start by creating your first exam
              </p>
              <button
                onClick={() => setIsCreateDialogOpen(true)}
                className="btn btn-primary"
                disabled={teacherAssignments.length === 0}
              >
                Create First Exam
              </button>
              {teacherAssignments.length === 0 && (
                <p className="text-sm text-gray-500 mt-3">
                  Please contact your principal to get subject/class assignments
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleExamSelect(exam)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-primary-50 rounded-lg text-primary-700">
                      <BookOpen size={20} />
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(exam.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-medium text-gray-900 mb-2">
                    {exam.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    {exam.subject_name}
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    {exam.class_name}
                  </p>

                  <div className="flex items-center justify-between text-sm flex-wrap gap-2">
                    <span className="text-gray-500">
                      Max Marks: {exam.max_marks}
                    </span>
                    {exam.exam_date && (
                      <span className="text-gray-500">
                        {new Date(exam.exam_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Marks Entry Form */
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center mb-6 gap-4">
            <button
              onClick={() => setSelectedExam(null)}
              className="text-primary-600 hover:text-primary-700 text-left sm:mr-4 flex items-center"
            >
              ← Back to Exams
            </button>
            <div className="flex-1">
              <h2 className="text-xl font-medium text-gray-900">
                {selectedExam.name}
              </h2>
              <p className="text-gray-600 text-sm">
                {selectedExam.subject_name} • {selectedExam.class_name} • Max
                Marks: {selectedExam.max_marks}
              </p>
            </div>
          </div>

          {csvUploadMessage && (
            <div
              className={`mb-4 p-3 rounded-md text-sm font-medium ${
                csvUploadMessage.includes("Error") ||
                csvUploadMessage.includes("error")
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}
            >
              {csvUploadMessage}
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-3">
            <div className="flex flex-wrap gap-2">
              <label className="btn btn-outline cursor-pointer flex items-center">
                <Upload size={16} className="mr-2" />
                Upload CSV
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleCsvUpload}
                />
              </label>

              <button
                type="button"
                className="btn btn-outline flex items-center"
                onClick={handleCsvDownload}
              >
                <Download size={16} className="mr-2" />
                Download CSV
              </button>
            </div>
            <p className="text-xs text-gray-500">
              CSV format: roll_no, student_name, marks_obtained
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <form onSubmit={marksForm.handleSubmit(onSubmitMarks)}>
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Award size={20} className="inline mr-2" />
                    Enter Student Marks
                  </h3>
                  <div className="text-sm text-gray-500">
                    Total Students: {studentMarks.length}
                  </div>
                </div>

                <div className="space-y-3">
                  {studentMarks.map((student) => (
                    <div
                      key={student.student_id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg gap-3"
                    >
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="font-medium text-gray-900 w-12 shrink-0 text-sm">
                          {student.roll_no}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-900 truncate">
                            {student.student_name}
                          </div>
                          <div className="text-xs text-gray-500 sm:hidden">
                            Roll: {student.roll_no}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 sm:ml-auto shrink-0">
                        <input
                          type="number"
                          min="0"
                          max={selectedExam.max_marks}
                          step="0.5"
                          value={student.marks_obtained}
                          onChange={(e) =>
                            updateStudentMarks(
                              student.student_id,
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="input w-20 text-center text-sm"
                          placeholder="0"
                        />
                        <span className="text-gray-500 whitespace-nowrap text-sm">
                          / {selectedExam.max_marks}
                        </span>
                        <div className="w-14 text-right">
                          <span
                            className={`text-sm font-medium ${
                              (student.marks_obtained /
                                selectedExam.max_marks) *
                                100 >=
                              60
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {(
                              (student.marks_obtained /
                                selectedExam.max_marks) *
                              100
                            ).toFixed(0)}
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary flex items-center w-full sm:w-auto"
                  >
                    <Save size={16} className="mr-2" />
                    {isSubmitting ? "Saving..." : "Save Marks"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default ExamMarks;
