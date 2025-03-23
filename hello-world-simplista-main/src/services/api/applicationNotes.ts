
import { supabase } from '@/integrations/supabase/client';
import { RPCResponse } from '@/types/supabase';

export const addApplicationNoteForApplication = async (applicationId: string, content: string) => {
  const { data, error } = await supabase.rpc('add_application_note', {
    application_id: applicationId,
    note_content: content
  }) as RPCResponse<unknown>;
  
  if (error) throw error;
  
  return data;
};

export const getApplicationNotesForApplication = async (applicationId: string) => {
  const { data, error } = await supabase.rpc('get_application_notes', {
    application_id: applicationId
  }) as RPCResponse<Array<{
    id: string;
    content: string;
    created_at: string;
    created_by: string;
  }>>;
  
  if (error) throw error;
  
  return data || [];
};

export const addNote = async (applicationId: string, content: string) => {
  return addApplicationNoteForApplication(applicationId, content);
};

export const getNotes = async (applicationId: string) => {
  return getApplicationNotesForApplication(applicationId);
};
