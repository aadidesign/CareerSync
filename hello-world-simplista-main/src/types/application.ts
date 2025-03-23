
import { Database } from "@/integrations/supabase/types";

// Application note type
export interface ApplicationNote {
  id: string;
  application_id: string;
  content: string;
  created_at: string;
  created_by: string;
}

// Application status history type
export interface ApplicationStatus {
  id: string;
  application_id: string;
  status: string;
  date: string;
  updated_by: string;
}

// Webhook configuration type
export interface WebhookConfig {
  id?: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  headers?: Record<string, string>;
}

// Extended application type with job data
export interface ApplicationWithJob {
  id: string;
  job_id: string;
  user_id: string;
  status: string;
  applied_at: string;
  updated_at: string;
  notes?: string;
  jobs: {
    id: string;
    title: string;
    company: string;
    location?: string;
    salary?: string;
    description?: string;
    source: string;
    source_url: string;
    posted_at: string;
    created_at: string;
    logo_url?: string;
    is_remote?: boolean;
  };
}
