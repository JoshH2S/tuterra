
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';

// Pages
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import Auth from '@/pages/Auth';
import UpdatePassword from '@/pages/UpdatePassword';
import ProfileSettings from '@/pages/ProfileSettings';
import StudentDashboard from '@/pages/StudentDashboard';
import Courses from '@/pages/Courses';
import CourseDetail from '@/pages/CourseDetail';
import CourseTutor from '@/pages/CourseTutor';
import CourseGrades from '@/pages/CourseGrades';
import QuizGeneration from '@/pages/QuizGeneration';
import Quizzes from '@/pages/Quizzes';
import TakeQuiz from '@/pages/TakeQuiz';
import QuizResults from '@/pages/QuizResults';
import SkillAssessments from '@/pages/SkillAssessments';
import TakeSkillAssessment from '@/pages/TakeSkillAssessment';
import SkillAssessmentResults from '@/pages/SkillAssessmentResults';
import CourseTemplates from '@/pages/CourseTemplates';
import LessonPlanning from '@/pages/LessonPlanning';
import CaseStudyQuizGeneration from '@/pages/CaseStudyQuizGeneration';
import InterviewSimulator from '@/pages/InterviewSimulator';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/update-password" element={<UpdatePassword />} />
      
      <Route element={<MainLayout />}>
        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfileSettings />
            </ProtectedRoute>
          }
        />
        
        {/* Courses */}
        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <Courses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:id"
          element={
            <ProtectedRoute>
              <CourseDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:id/tutor"
          element={
            <ProtectedRoute>
              <CourseTutor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:id/grades"
          element={
            <ProtectedRoute>
              <CourseGrades />
            </ProtectedRoute>
          }
        />
        <Route
          path="/course-templates"
          element={
            <ProtectedRoute>
              <CourseTemplates />
            </ProtectedRoute>
          }
        />
        
        {/* Lesson Planning */}
        <Route
          path="/lesson-planning"
          element={
            <ProtectedRoute>
              <LessonPlanning />
            </ProtectedRoute>
          }
        />
        
        {/* Quizzes */}
        <Route
          path="/quiz-generation"
          element={
            <ProtectedRoute>
              <QuizGeneration />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quizzes"
          element={
            <ProtectedRoute>
              <Quizzes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quizzes/:id"
          element={
            <ProtectedRoute>
              <TakeQuiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz-results/:id"
          element={
            <ProtectedRoute>
              <QuizResults />
            </ProtectedRoute>
          }
        />
        <Route
          path="/case-study-quiz"
          element={
            <ProtectedRoute>
              <CaseStudyQuizGeneration />
            </ProtectedRoute>
          }
        />
        
        {/* Skill Assessments */}
        <Route
          path="/skill-assessments"
          element={
            <ProtectedRoute>
              <SkillAssessments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/skill-assessments/:id"
          element={
            <ProtectedRoute>
              <TakeSkillAssessment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/skill-assessment-results/:id"
          element={
            <ProtectedRoute>
              <SkillAssessmentResults />
            </ProtectedRoute>
          }
        />
        
        {/* Interview Simulator */}
        <Route
          path="/interview-simulator"
          element={
            <ProtectedRoute>
              <InterviewSimulator />
            </ProtectedRoute>
          }
        />
      </Route>
      
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
