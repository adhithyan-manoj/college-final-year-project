import axios from 'axios';
import { 
  Scheme, 
  UserProfile, 
  RecommendationResponse, 
  DynamicQuestionResponse, 
  AIChatResponse, 
  SavedSchemeItem, 
  ChecklistItem,
  AdminStats
} from '../types';

const API_BASE = '/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const api = {
  // Schemes
  getSchemes: async (params?: Record<string, any>): Promise<{ total: number; schemes: Scheme[] }> => {
    const res = await client.get('/schemes', { params });
    return res.data;
  },
  
  getSchemeById: async (id: string): Promise<Scheme> => {
    const res = await client.get(`/schemes/${id}`);
    return res.data;
  },

  reportScheme: async (id: string, data: { report_type: string; description: string; contact_email?: string }) => {
    const res = await client.post(`/schemes/${id}/report`, data);
    return res.data;
  },

  // Dynamic Questionnaire
  getNextQuestions: async (step: number, answers: Record<string, any>): Promise<DynamicQuestionResponse> => {
    const res = await client.post('/questions/next', { current_step: step, answers });
    return res.data;
  },

  // Recommendations
  getRecommendations: async (profile: UserProfile): Promise<RecommendationResponse> => {
    const res = await client.post('/recommendations', profile);
    return res.data;
  },

  // AI Chat
  chatWithAI: async (message: string, language: string = 'en', schemeId?: string): Promise<AIChatResponse> => {
    const res = await client.post('/ai/chat', {
      message,
      language,
      context_scheme_id: schemeId
    });
    return res.data;
  },

  // Saved Schemes & Checklist
  getSavedSchemes: async (userId: string): Promise<SavedSchemeItem[]> => {
    const res = await client.get('/saved-schemes', { params: { user_id: userId } });
    return res.data.saved_schemes || [];
  },

  saveScheme: async (userId: string, schemeId: string) => {
    const res = await client.post('/saved-schemes', { user_id: userId, scheme_id: schemeId });
    return res.data;
  },

  removeSavedScheme: async (userId: string, schemeId: string) => {
    const res = await client.delete(`/saved-schemes/${schemeId}`, { params: { user_id: userId } });
    return res.data;
  },

  getChecklist: async (userId: string): Promise<ChecklistItem[]> => {
    const res = await client.get('/checklist', { params: { user_id: userId } });
    return res.data.checklist || [];
  },

  updateChecklist: async (userId: string, schemeId: string, status: string, notes?: string) => {
    const res = await client.post('/checklist', {
      user_id: userId,
      scheme_id: schemeId,
      status,
      notes
    });
    return res.data;
  },

  // Admin
  getAdminStats: async (): Promise<AdminStats> => {
    const res = await client.get('/admin/stats');
    return res.data;
  },

  getAdminSchemes: async (status?: string): Promise<{ schemes: Scheme[]; total: number }> => {
    const res = await client.get('/admin/schemes', { params: { status } });
    return res.data;
  },

  updateAdminScheme: async (id: string, updates: Partial<Scheme>) => {
    const res = await client.patch(`/admin/schemes/${id}`, updates);
    return res.data;
  },

  createAdminScheme: async (scheme: Scheme) => {
    const res = await client.post('/admin/schemes', scheme);
    return res.data;
  },

  importDatasetFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await client.post('/admin/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  getAdminReports: async () => {
    const res = await client.get('/admin/reports');
    return res.data.reports || [];
  }
};
