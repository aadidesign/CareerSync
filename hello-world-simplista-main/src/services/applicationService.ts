
// This file now re-exports all application-related services from the api folder
export {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplicationStatus,
  getApplicationStatusHistoryForApplication,
  addApplicationNoteForApplication,
  getApplicationNotesForApplication,
  addNote,
  getNotes,
  getStatistics,
  addApplicationStatusHistory,
  getApplicationStatusHistory,
} from './api';
