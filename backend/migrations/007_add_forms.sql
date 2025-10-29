-- Create forms table
CREATE TABLE IF NOT EXISTS forms (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  token TEXT NOT NULL UNIQUE,
  created_by TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(username) ON DELETE CASCADE
);

-- Create form_questions table
CREATE TABLE IF NOT EXISTS form_questions (
  id TEXT PRIMARY KEY,
  form_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  question_order INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
);

-- Create form_responses table
CREATE TABLE IF NOT EXISTS form_responses (
  id TEXT PRIMARY KEY,
  form_id TEXT NOT NULL,
  respondent_name TEXT,
  submitted_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
);

-- Create form_answers table
CREATE TABLE IF NOT EXISTS form_answers (
  id TEXT PRIMARY KEY,
  response_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (response_id) REFERENCES form_responses(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES form_questions(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_forms_created_by ON forms(created_by);
CREATE INDEX IF NOT EXISTS idx_forms_token ON forms(token);
CREATE INDEX IF NOT EXISTS idx_form_questions_form_id ON form_questions(form_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_form_id ON form_responses(form_id);
CREATE INDEX IF NOT EXISTS idx_form_answers_response_id ON form_answers(response_id);
CREATE INDEX IF NOT EXISTS idx_form_answers_question_id ON form_answers(question_id);
