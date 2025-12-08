-- Add missing indexes for better query performance
-- These indexes improve query performance for frequently accessed columns

-- Index for anonymous_messages sender_id (used in queries filtering by sender)
CREATE INDEX IF NOT EXISTS idx_anonymous_messages_sender ON anonymous_messages(sender_id);

-- Index for conversations user columns (used in getUserConversations queries)
CREATE INDEX IF NOT EXISTS idx_conversations_user1 ON conversations(user1_username);
CREATE INDEX IF NOT EXISTS idx_conversations_user2 ON conversations(user2_username);

-- Index for tasks owner (used in getMemberStats and task filtering)
CREATE INDEX IF NOT EXISTS idx_tasks_owner ON tasks(owner);

-- Index for articles owner (used in getMemberStats and article filtering)
CREATE INDEX IF NOT EXISTS idx_articles_owner ON articles(owner);

-- Index for articles published status (used in listing published articles)
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published);

-- Index for event_attendees to optimize lookups
CREATE INDEX IF NOT EXISTS idx_event_attendees_event ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user ON event_attendees(user_username);
CREATE INDEX IF NOT EXISTS idx_event_attendees_token ON event_attendees(attendance_token);

-- Index for event_admins
CREATE INDEX IF NOT EXISTS idx_event_admins_event ON event_admins(event_id);
CREATE INDEX IF NOT EXISTS idx_event_admins_user ON event_admins(user_username);

-- Index for attendance_scans
CREATE INDEX IF NOT EXISTS idx_attendance_scans_attendee ON attendance_scans(attendee_id);

-- Index for ticket comments
CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket ON ticket_comments(ticket_id);

-- Index for ticket assignments
CREATE INDEX IF NOT EXISTS idx_ticket_assignments_ticket ON ticket_assignments(ticket_id);

-- Index for form responses
CREATE INDEX IF NOT EXISTS idx_form_responses_form ON form_responses(form_id);

-- Index for form answers
CREATE INDEX IF NOT EXISTS idx_form_answers_response ON form_answers(response_id);
CREATE INDEX IF NOT EXISTS idx_form_answers_question ON form_answers(question_id);

-- Index for form questions
CREATE INDEX IF NOT EXISTS idx_form_questions_form ON form_questions(form_id);

-- Index for forms created_by
CREATE INDEX IF NOT EXISTS idx_forms_created_by ON forms(created_by);
