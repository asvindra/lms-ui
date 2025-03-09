// lib/context/StudentContext.tsx (unchanged from last update)
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface Student {
  id: string;
  name: string;
  batch: string;
  feesPaid: number;
  totalFees: number;
  status: "active" | "left";
}

interface StudentContextType {
  students: Student[];
  addStudent: (student: Omit<Student, "id">) => void;
  deleteStudent: (id: string) => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export function StudentProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);

  const addStudent = (student: Omit<Student, "id">) => {
    setStudents([...students, { ...student, id: Date.now().toString() }]);
  };

  const deleteStudent = (id: string) => {
    setStudents(students.filter((student) => student.id !== id));
  };

  return (
    <StudentContext.Provider value={{ students, addStudent, deleteStudent }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudents() {
  const context = useContext(StudentContext);
  if (!context)
    throw new Error("useStudents must be used within a StudentProvider");
  return context;
}
