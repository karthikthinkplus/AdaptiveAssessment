CREATE EXTENSION IF NOT EXISTS "pgcrypto";


CREATE TABLE topics (
	name VARCHAR(180) NOT NULL, 
	description TEXT, 
	metadata JSONB NOT NULL, 
	id UUID NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	deleted_at TIMESTAMP WITH TIME ZONE, 
	CONSTRAINT pk_topics PRIMARY KEY (id)
);


CREATE TABLE users (
	email VARCHAR(320) NOT NULL, 
	password_hash VARCHAR(255) NOT NULL, 
	full_name VARCHAR(200) NOT NULL, 
	role VARCHAR(7) NOT NULL, 
	is_active BOOLEAN NOT NULL, 
	metadata JSONB NOT NULL, 
	id UUID NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	deleted_at TIMESTAMP WITH TIME ZONE, 
	CONSTRAINT pk_users PRIMARY KEY (id)
);


CREATE TABLE assessments (
	title VARCHAR(220) NOT NULL, 
	topic_id UUID, 
	created_by_user_id UUID, 
	status VARCHAR(9) NOT NULL, 
	config JSONB NOT NULL, 
	id UUID NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	deleted_at TIMESTAMP WITH TIME ZONE, 
	CONSTRAINT pk_assessments PRIMARY KEY (id), 
	CONSTRAINT fk_assessments_topic_id_topics FOREIGN KEY(topic_id) REFERENCES topics (id) ON DELETE SET NULL, 
	CONSTRAINT fk_assessments_created_by_user_id_users FOREIGN KEY(created_by_user_id) REFERENCES users (id) ON DELETE SET NULL
);


CREATE TABLE audit_logs (
	actor_user_id UUID, 
	action VARCHAR(120) NOT NULL, 
	entity_type VARCHAR(120) NOT NULL, 
	entity_id UUID, 
	before JSONB, 
	after JSONB, 
	request_metadata JSONB NOT NULL, 
	id UUID NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	deleted_at TIMESTAMP WITH TIME ZONE, 
	CONSTRAINT pk_audit_logs PRIMARY KEY (id), 
	CONSTRAINT fk_audit_logs_actor_user_id_users FOREIGN KEY(actor_user_id) REFERENCES users (id) ON DELETE SET NULL
);


CREATE TABLE students (
	user_id UUID NOT NULL, 
	external_id VARCHAR(120), 
	grade_level VARCHAR(32), 
	enrollment_metadata JSONB NOT NULL, 
	id UUID NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	deleted_at TIMESTAMP WITH TIME ZONE, 
	CONSTRAINT pk_students PRIMARY KEY (id), 
	CONSTRAINT fk_students_user_id_users FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE, 
	CONSTRAINT uq_students_external_id UNIQUE (external_id)
);


CREATE TABLE subtopics (
	topic_id UUID NOT NULL, 
	name VARCHAR(180) NOT NULL, 
	description TEXT, 
	sequence_order INTEGER NOT NULL, 
	metadata JSONB NOT NULL, 
	id UUID NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	deleted_at TIMESTAMP WITH TIME ZONE, 
	CONSTRAINT pk_subtopics PRIMARY KEY (id), 
	CONSTRAINT uq_subtopics_topic_name UNIQUE (topic_id, name), 
	CONSTRAINT fk_subtopics_topic_id_topics FOREIGN KEY(topic_id) REFERENCES topics (id) ON DELETE CASCADE
);


CREATE TABLE teachers (
	user_id UUID NOT NULL, 
	external_id VARCHAR(120), 
	department VARCHAR(120), 
	profile_metadata JSONB NOT NULL, 
	id UUID NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	deleted_at TIMESTAMP WITH TIME ZONE, 
	CONSTRAINT pk_teachers PRIMARY KEY (id), 
	CONSTRAINT fk_teachers_user_id_users FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE, 
	CONSTRAINT uq_teachers_external_id UNIQUE (external_id)
);


CREATE TABLE topic_prerequisites (
	topic_id UUID NOT NULL, 
	prerequisite_topic_id UUID NOT NULL, 
	weight FLOAT NOT NULL, 
	metadata JSONB NOT NULL, 
	id UUID NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	deleted_at TIMESTAMP WITH TIME ZONE, 
	CONSTRAINT pk_topic_prerequisites PRIMARY KEY (id), 
	CONSTRAINT uq_topic_prerequisite UNIQUE (topic_id, prerequisite_topic_id), 
	CONSTRAINT fk_topic_prerequisites_topic_id_topics FOREIGN KEY(topic_id) REFERENCES topics (id) ON DELETE CASCADE, 
	CONSTRAINT fk_topic_prerequisites_prerequisite_topic_id_topics FOREIGN KEY(prerequisite_topic_id) REFERENCES topics (id) ON DELETE CASCADE
);


CREATE TABLE user_sessions (
	user_id UUID NOT NULL, 
	token_jti VARCHAR(64) NOT NULL, 
	refresh_token_hash VARCHAR(255), 
	ip_address INET, 
	user_agent TEXT, 
	expires_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	revoked_at TIMESTAMP WITH TIME ZONE, 
	id UUID NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	deleted_at TIMESTAMP WITH TIME ZONE, 
	CONSTRAINT pk_user_sessions PRIMARY KEY (id), 
	CONSTRAINT fk_user_sessions_user_id_users FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);


CREATE TABLE assessment_attempts (
	assessment_id UUID NOT NULL, 
	student_id UUID NOT NULL, 
	status VARCHAR(11) NOT NULL, 
	started_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	completed_at TIMESTAMP WITH TIME ZONE, 
	score FLOAT, 
	metadata JSONB NOT NULL, 
	id UUID NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	deleted_at TIMESTAMP WITH TIME ZONE, 
	CONSTRAINT pk_assessment_attempts PRIMARY KEY (id), 
	CONSTRAINT fk_assessment_attempts_assessment_id_assessments FOREIGN KEY(assessment_id) REFERENCES assessments (id) ON DELETE CASCADE, 
	CONSTRAINT fk_assessment_attempts_student_id_students FOREIGN KEY(student_id) REFERENCES students (id) ON DELETE CASCADE
);


CREATE TABLE learning_sessions (
	student_id UUID NOT NULL, 
	topic_id UUID NOT NULL, 
	current_subtopic_id UUID, 
	status VARCHAR(9) NOT NULL, 
	started_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	ended_at TIMESTAMP WITH TIME ZONE, 
	metadata JSONB NOT NULL, 
	id UUID NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	deleted_at TIMESTAMP WITH TIME ZONE, 
	CONSTRAINT pk_learning_sessions PRIMARY KEY (id), 
	CONSTRAINT fk_learning_sessions_student_id_students FOREIGN KEY(student_id) REFERENCES students (id) ON DELETE CASCADE, 
	CONSTRAINT fk_learning_sessions_topic_id_topics FOREIGN KEY(topic_id) REFERENCES topics (id) ON DELETE CASCADE, 
	CONSTRAINT fk_learning_sessions_current_subtopic_id_subtopics FOREIGN KEY(current_subtopic_id) REFERENCES subtopics (id) ON DELETE SET NULL
);


CREATE TABLE questions (
	subtopic_id UUID NOT NULL, 
	created_by_user_id UUID, 
	question_type VARCHAR(15) NOT NULL, 
	prompt TEXT NOT NULL, 
	correct_answer TEXT, 
	difficulty_b FLOAT NOT NULL, 
	is_active BOOLEAN NOT NULL, 
	metadata JSONB NOT NULL, 
	id UUID NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	deleted_at TIMESTAMP WITH TIME ZONE, 
	CONSTRAINT pk_questions PRIMARY KEY (id), 
	CONSTRAINT fk_questions_subtopic_id_subtopics FOREIGN KEY(subtopic_id) REFERENCES subtopics (id) ON DELETE CASCADE, 
	CONSTRAINT fk_questions_created_by_user_id_users FOREIGN KEY(created_by_user_id) REFERENCES users (id) ON DELETE SET NULL
);


CREATE TABLE student_bkt_states (
	student_id UUID NOT NULL, 
	subtopic_id UUID NOT NULL, 
	mastery_probability FLOAT NOT NULL, 
	attempts INTEGER NOT NULL, 
	correct_count INTEGER NOT NULL, 
	parameters JSONB NOT NULL, 
	id UUID NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	deleted_at TIMESTAMP WITH TIME ZONE, 
	CONSTRAINT pk_student_bkt_states PRIMARY KEY (id), 
	CONSTRAINT uq_student_bkt_state UNIQUE (student_id, subtopic_id), 
	CONSTRAINT fk_student_bkt_states_student_id_students FOREIGN KEY(student_id) REFERENCES students (id) ON DELETE CASCADE, 
	CONSTRAINT fk_student_bkt_states_subtopic_id_subtopics FOREIGN KEY(subtopic_id) REFERENCES subtopics (id) ON DELETE CASCADE
);


CREATE TABLE student_daily_summary (
	student_id UUID NOT NULL, 
	summary_date TIMESTAMP WITH TIME ZONE NOT NULL, 
	sessions_count INTEGER NOT NULL, 
	questions_answered INTEGER NOT NULL, 
	correct_answers INTEGER NOT NULL, 
	average_theta FLOAT, 
	average_mastery FLOAT, 
	summary_payload JSONB NOT NULL, 
	id UUID NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	deleted_at TIMESTAMP WITH TIME ZONE, 
	CONSTRAINT pk_student_daily_summary PRIMARY KEY (id), 
	CONSTRAINT uq_student_daily_summary UNIQUE (student_id, summary_date), 
	CONSTRAINT fk_student_daily_summary_student_id_students FOREIGN KEY(student_id) REFERENCES students (id) ON DELETE CASCADE
);


CREATE TABLE student_topic_theta (
	student_id UUID NOT NULL, 
	topic_id UUID NOT NULL, 
	theta FLOAT NOT NULL, 
	standard_error FLOAT NOT NULL, 
	posterior JSONB NOT NULL, 
	id UUID NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	deleted_at TIMESTAMP WITH TIME ZONE, 
	CONSTRAINT pk_student_topic_theta PRIMARY KEY (id), 
	CONSTRAINT uq_student_topic_theta UNIQUE (student_id, topic_id), 
	CONSTRAINT fk_student_topic_theta_student_id_students FOREIGN KEY(student_id) REFERENCES students (id) ON DELETE CASCADE, 
	CONSTRAINT fk_student_topic_theta_topic_id_topics FOREIGN KEY(topic_id) REFERENCES topics (id) ON DELETE CASCADE
);


CREATE TABLE subtopic_prerequisites (
	subtopic_id UUID NOT NULL, 
	prerequisite_subtopic_id UUID NOT NULL, 
	weight FLOAT NOT NULL, 
	metadata JSONB NOT NULL, 
	id UUID NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	deleted_at TIMESTAMP WITH TIME ZONE, 
	CONSTRAINT pk_subtopic_prerequisites PRIMARY KEY (id), 
	CONSTRAINT uq_subtopic_prerequisite UNIQUE (subtopic_id, prerequisite_subtopic_id), 
	CONSTRAINT fk_subtopic_prerequisites_subtopic_id_subtopics FOREIGN KEY(subtopic_id) REFERENCES subtopics (id) ON DELETE CASCADE, 
	CONSTRAINT fk_subtopic_prerequisites_prerequisite_subtopic_id_subtopics FOREIGN KEY(prerequisite_subtopic_id) REFERENCES subtopics (id) ON DELETE CASCADE
);


CREATE TABLE adaptive_decisions (
	learning_session_id UUID NOT NULL, 
	student_id UUID NOT NULL, 
	decision_type VARCHAR(13) NOT NULL, 
	selected_question_id UUID, 
	from_subtopic_id UUID, 
	to_subtopic_id UUID, 
	reason TEXT, 
	decision_payload JSONB NOT NULL, 
	id UUID NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	deleted_at TIMESTAMP WITH TIME ZONE, 
	CONSTRAINT pk_adaptive_decisions PRIMARY KEY (id), 
	CONSTRAINT fk_adaptive_decisions_learning_session_id_learning_sessions FOREIGN KEY(learning_session_id) REFERENCES learning_sessions (id) ON DELETE CASCADE, 
	CONSTRAINT fk_adaptive_decisions_student_id_students FOREIGN KEY(student_id) REFERENCES students (id) ON DELETE CASCADE, 
	CONSTRAINT fk_adaptive_decisions_selected_question_id_questions FOREIGN KEY(selected_question_id) REFERENCES questions (id) ON DELETE SET NULL, 
	CONSTRAINT fk_adaptive_decisions_from_subtopic_id_subtopics FOREIGN KEY(from_subtopic_id) REFERENCES subtopics (id) ON DELETE SET NULL, 
	CONSTRAINT fk_adaptive_decisions_to_subtopic_id_subtopics FOREIGN KEY(to_subtopic_id) REFERENCES subtopics (id) ON DELETE SET NULL
);


CREATE TABLE assessment_questions (
	assessment_id UUID NOT NULL, 
	question_id UUID NOT NULL, 
	sequence_order INTEGER NOT NULL, 
	weight FLOAT NOT NULL, 
	metadata JSONB NOT NULL, 
	id UUID NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	deleted_at TIMESTAMP WITH TIME ZONE, 
	CONSTRAINT pk_assessment_questions PRIMARY KEY (id), 
	CONSTRAINT uq_assessment_question UNIQUE (assessment_id, question_id), 
	CONSTRAINT fk_assessment_questions_assessment_id_assessments FOREIGN KEY(assessment_id) REFERENCES assessments (id) ON DELETE CASCADE, 
	CONSTRAINT fk_assessment_questions_question_id_questions FOREIGN KEY(question_id) REFERENCES questions (id) ON DELETE CASCADE
);


CREATE TABLE navigation_history (
	learning_session_id UUID NOT NULL, 
	student_id UUID NOT NULL, 
	from_subtopic_id UUID, 
	to_subtopic_id UUID, 
	action VARCHAR(64) NOT NULL, 
	reason TEXT, 
	metadata JSONB NOT NULL, 
	id UUID NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	deleted_at TIMESTAMP WITH TIME ZONE, 
	CONSTRAINT pk_navigation_history PRIMARY KEY (id), 
	CONSTRAINT fk_navigation_history_learning_session_id_learning_sessions FOREIGN KEY(learning_session_id) REFERENCES learning_sessions (id) ON DELETE CASCADE, 
	CONSTRAINT fk_navigation_history_student_id_students FOREIGN KEY(student_id) REFERENCES students (id) ON DELETE CASCADE, 
	CONSTRAINT fk_navigation_history_from_subtopic_id_subtopics FOREIGN KEY(from_subtopic_id) REFERENCES subtopics (id) ON DELETE SET NULL, 
	CONSTRAINT fk_navigation_history_to_subtopic_id_subtopics FOREIGN KEY(to_subtopic_id) REFERENCES subtopics (id) ON DELETE SET NULL
);


CREATE TABLE question_options (
	question_id UUID NOT NULL, 
	option_key VARCHAR(16) NOT NULL, 
	option_text TEXT NOT NULL, 
	is_correct BOOLEAN NOT NULL, 
	sequence_order INTEGER NOT NULL, 
	metadata JSONB NOT NULL, 
	id UUID NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	deleted_at TIMESTAMP WITH TIME ZONE, 
	CONSTRAINT pk_question_options PRIMARY KEY (id), 
	CONSTRAINT uq_question_options_key UNIQUE (question_id, option_key), 
	CONSTRAINT fk_question_options_question_id_questions FOREIGN KEY(question_id) REFERENCES questions (id) ON DELETE CASCADE
);


CREATE TABLE question_versions (
	question_id UUID NOT NULL, 
	version_number INTEGER NOT NULL, 
	snapshot JSONB NOT NULL, 
	change_reason TEXT, 
	created_by_user_id UUID, 
	id UUID NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	deleted_at TIMESTAMP WITH TIME ZONE, 
	CONSTRAINT pk_question_versions PRIMARY KEY (id), 
	CONSTRAINT uq_question_versions_number UNIQUE (question_id, version_number), 
	CONSTRAINT fk_question_versions_question_id_questions FOREIGN KEY(question_id) REFERENCES questions (id) ON DELETE CASCADE, 
	CONSTRAINT fk_question_versions_created_by_user_id_users FOREIGN KEY(created_by_user_id) REFERENCES users (id) ON DELETE SET NULL
);


CREATE TABLE student_responses (
	student_id UUID NOT NULL, 
	learning_session_id UUID, 
	assessment_attempt_id UUID, 
	question_id UUID NOT NULL, 
	selected_option_id UUID, 
	answer_text TEXT, 
	is_correct BOOLEAN NOT NULL, 
	response_time_ms INTEGER, 
	metadata JSONB NOT NULL, 
	id UUID NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	deleted_at TIMESTAMP WITH TIME ZONE, 
	CONSTRAINT pk_student_responses PRIMARY KEY (id), 
	CONSTRAINT fk_student_responses_student_id_students FOREIGN KEY(student_id) REFERENCES students (id) ON DELETE CASCADE, 
	CONSTRAINT fk_student_responses_learning_session_id_learning_sessions FOREIGN KEY(learning_session_id) REFERENCES learning_sessions (id) ON DELETE CASCADE, 
	CONSTRAINT fk_student_responses_assessment_attempt_id_assessment_attempts FOREIGN KEY(assessment_attempt_id) REFERENCES assessment_attempts (id) ON DELETE CASCADE, 
	CONSTRAINT fk_student_responses_question_id_questions FOREIGN KEY(question_id) REFERENCES questions (id) ON DELETE CASCADE, 
	CONSTRAINT fk_student_responses_selected_option_id_question_options FOREIGN KEY(selected_option_id) REFERENCES question_options (id) ON DELETE SET NULL
);


CREATE TABLE bkt_history (
	student_id UUID NOT NULL, 
	subtopic_id UUID NOT NULL, 
	response_id UUID, 
	prior_probability FLOAT NOT NULL, 
	posterior_probability FLOAT NOT NULL, 
	parameters JSONB NOT NULL, 
	id UUID NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	deleted_at TIMESTAMP WITH TIME ZONE, 
	CONSTRAINT pk_bkt_history PRIMARY KEY (id), 
	CONSTRAINT fk_bkt_history_student_id_students FOREIGN KEY(student_id) REFERENCES students (id) ON DELETE CASCADE, 
	CONSTRAINT fk_bkt_history_subtopic_id_subtopics FOREIGN KEY(subtopic_id) REFERENCES subtopics (id) ON DELETE CASCADE, 
	CONSTRAINT fk_bkt_history_response_id_student_responses FOREIGN KEY(response_id) REFERENCES student_responses (id) ON DELETE SET NULL
);


CREATE TABLE theta_history (
	student_id UUID NOT NULL, 
	topic_id UUID NOT NULL, 
	response_id UUID, 
	theta_before FLOAT NOT NULL, 
	theta_after FLOAT NOT NULL, 
	standard_error FLOAT NOT NULL, 
	posterior JSONB NOT NULL, 
	id UUID NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	deleted_at TIMESTAMP WITH TIME ZONE, 
	CONSTRAINT pk_theta_history PRIMARY KEY (id), 
	CONSTRAINT fk_theta_history_student_id_students FOREIGN KEY(student_id) REFERENCES students (id) ON DELETE CASCADE, 
	CONSTRAINT fk_theta_history_topic_id_topics FOREIGN KEY(topic_id) REFERENCES topics (id) ON DELETE CASCADE, 
	CONSTRAINT fk_theta_history_response_id_student_responses FOREIGN KEY(response_id) REFERENCES student_responses (id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX ix_topics_name ON topics (name);

CREATE INDEX ix_topics_deleted_at ON topics (deleted_at);

CREATE UNIQUE INDEX ix_users_email ON users (email);

CREATE INDEX ix_users_role ON users (role);

CREATE INDEX ix_users_deleted_at ON users (deleted_at);

CREATE INDEX ix_assessments_title ON assessments (title);

CREATE INDEX ix_assessments_created_by_user_id ON assessments (created_by_user_id);

CREATE INDEX ix_assessments_topic_id ON assessments (topic_id);

CREATE INDEX ix_assessments_status ON assessments (status);

CREATE INDEX ix_assessments_deleted_at ON assessments (deleted_at);

CREATE INDEX ix_audit_logs_entity_id ON audit_logs (entity_id);

CREATE INDEX ix_audit_logs_entity_type ON audit_logs (entity_type);

CREATE INDEX ix_audit_logs_deleted_at ON audit_logs (deleted_at);

CREATE INDEX ix_audit_logs_actor_user_id ON audit_logs (actor_user_id);

CREATE INDEX ix_audit_logs_action ON audit_logs (action);

CREATE INDEX ix_students_grade_level ON students (grade_level);

CREATE INDEX ix_students_deleted_at ON students (deleted_at);

CREATE UNIQUE INDEX ix_students_user_id ON students (user_id);

CREATE INDEX ix_subtopics_topic_id ON subtopics (topic_id);

CREATE INDEX ix_subtopics_deleted_at ON subtopics (deleted_at);

CREATE UNIQUE INDEX ix_teachers_user_id ON teachers (user_id);

CREATE INDEX ix_teachers_deleted_at ON teachers (deleted_at);

CREATE INDEX ix_teachers_department ON teachers (department);

CREATE INDEX ix_topic_prerequisites_deleted_at ON topic_prerequisites (deleted_at);

CREATE INDEX ix_topic_prerequisites_pair ON topic_prerequisites (topic_id, prerequisite_topic_id);

CREATE INDEX ix_topic_prerequisites_prerequisite_topic_id ON topic_prerequisites (prerequisite_topic_id);

CREATE INDEX ix_topic_prerequisites_topic_id ON topic_prerequisites (topic_id);

CREATE UNIQUE INDEX ix_user_sessions_token_jti ON user_sessions (token_jti);

CREATE INDEX ix_user_sessions_deleted_at ON user_sessions (deleted_at);

CREATE INDEX ix_user_sessions_user_id ON user_sessions (user_id);

CREATE INDEX ix_user_sessions_expires_at ON user_sessions (expires_at);

CREATE INDEX ix_assessment_attempts_deleted_at ON assessment_attempts (deleted_at);

CREATE INDEX ix_assessment_attempts_assessment_id ON assessment_attempts (assessment_id);

CREATE INDEX ix_assessment_attempts_status ON assessment_attempts (status);

CREATE INDEX ix_assessment_attempts_student_id ON assessment_attempts (student_id);

CREATE INDEX ix_assessment_attempts_student_status ON assessment_attempts (student_id, status);

CREATE INDEX ix_learning_sessions_deleted_at ON learning_sessions (deleted_at);

CREATE INDEX ix_learning_sessions_student_status ON learning_sessions (student_id, status);

CREATE INDEX ix_learning_sessions_current_subtopic_id ON learning_sessions (current_subtopic_id);

CREATE INDEX ix_learning_sessions_status ON learning_sessions (status);

CREATE INDEX ix_learning_sessions_student_id ON learning_sessions (student_id);

CREATE INDEX ix_learning_sessions_topic_id ON learning_sessions (topic_id);

CREATE INDEX ix_questions_created_by_user_id ON questions (created_by_user_id);

CREATE INDEX ix_questions_subtopic_id ON questions (subtopic_id);

CREATE INDEX ix_questions_deleted_at ON questions (deleted_at);

CREATE INDEX ix_questions_is_active ON questions (is_active);

CREATE INDEX ix_questions_difficulty_b ON questions (difficulty_b);

CREATE INDEX ix_questions_subtopic_active_difficulty ON questions (subtopic_id, is_active, difficulty_b);

CREATE INDEX ix_student_bkt_states_subtopic_id ON student_bkt_states (subtopic_id);

CREATE INDEX ix_student_bkt_states_student_id ON student_bkt_states (student_id);

CREATE INDEX ix_student_bkt_states_deleted_at ON student_bkt_states (deleted_at);

CREATE INDEX ix_student_daily_summary_date ON student_daily_summary (summary_date);

CREATE INDEX ix_student_daily_summary_deleted_at ON student_daily_summary (deleted_at);

CREATE INDEX ix_student_daily_summary_student_id ON student_daily_summary (student_id);

CREATE INDEX ix_student_topic_theta_deleted_at ON student_topic_theta (deleted_at);

CREATE INDEX ix_student_topic_theta_topic_id ON student_topic_theta (topic_id);

CREATE INDEX ix_student_topic_theta_student_id ON student_topic_theta (student_id);

CREATE INDEX ix_subtopic_prerequisites_pair ON subtopic_prerequisites (subtopic_id, prerequisite_subtopic_id);

CREATE INDEX ix_subtopic_prerequisites_deleted_at ON subtopic_prerequisites (deleted_at);

CREATE INDEX ix_subtopic_prerequisites_prerequisite_subtopic_id ON subtopic_prerequisites (prerequisite_subtopic_id);

CREATE INDEX ix_subtopic_prerequisites_subtopic_id ON subtopic_prerequisites (subtopic_id);

CREATE INDEX ix_adaptive_decisions_selected_question_id ON adaptive_decisions (selected_question_id);

CREATE INDEX ix_adaptive_decisions_student_id ON adaptive_decisions (student_id);

CREATE INDEX ix_adaptive_decisions_deleted_at ON adaptive_decisions (deleted_at);

CREATE INDEX ix_adaptive_decisions_session_created ON adaptive_decisions (learning_session_id, created_at);

CREATE INDEX ix_adaptive_decisions_learning_session_id ON adaptive_decisions (learning_session_id);

CREATE INDEX ix_adaptive_decisions_decision_type ON adaptive_decisions (decision_type);

CREATE INDEX ix_assessment_questions_assessment_id ON assessment_questions (assessment_id);

CREATE INDEX ix_assessment_questions_order ON assessment_questions (assessment_id, sequence_order);

CREATE INDEX ix_assessment_questions_deleted_at ON assessment_questions (deleted_at);

CREATE INDEX ix_assessment_questions_question_id ON assessment_questions (question_id);

CREATE INDEX ix_navigation_history_session_created ON navigation_history (learning_session_id, created_at);

CREATE INDEX ix_navigation_history_action ON navigation_history (action);

CREATE INDEX ix_navigation_history_student_id ON navigation_history (student_id);

CREATE INDEX ix_navigation_history_deleted_at ON navigation_history (deleted_at);

CREATE INDEX ix_navigation_history_learning_session_id ON navigation_history (learning_session_id);

CREATE INDEX ix_question_options_question_id ON question_options (question_id);

CREATE INDEX ix_question_options_deleted_at ON question_options (deleted_at);

CREATE INDEX ix_question_versions_question_id ON question_versions (question_id);

CREATE INDEX ix_question_versions_deleted_at ON question_versions (deleted_at);

CREATE INDEX ix_student_responses_deleted_at ON student_responses (deleted_at);

CREATE INDEX ix_student_responses_learning_session_id ON student_responses (learning_session_id);

CREATE INDEX ix_student_responses_question_id ON student_responses (question_id);

CREATE INDEX ix_student_responses_student_question ON student_responses (student_id, question_id);

CREATE INDEX ix_student_responses_student_id ON student_responses (student_id);

CREATE INDEX ix_student_responses_assessment_attempt_id ON student_responses (assessment_attempt_id);

CREATE INDEX ix_student_responses_session_created ON student_responses (learning_session_id, created_at);

CREATE INDEX ix_bkt_history_student_id ON bkt_history (student_id);

CREATE INDEX ix_bkt_history_deleted_at ON bkt_history (deleted_at);

CREATE INDEX ix_bkt_history_student_subtopic_created ON bkt_history (student_id, subtopic_id, created_at);

CREATE INDEX ix_bkt_history_response_id ON bkt_history (response_id);

CREATE INDEX ix_bkt_history_subtopic_id ON bkt_history (subtopic_id);

CREATE INDEX ix_theta_history_response_id ON theta_history (response_id);

CREATE INDEX ix_theta_history_deleted_at ON theta_history (deleted_at);

CREATE INDEX ix_theta_history_student_topic_created ON theta_history (student_id, topic_id, created_at);

CREATE INDEX ix_theta_history_topic_id ON theta_history (topic_id);

CREATE INDEX ix_theta_history_student_id ON theta_history (student_id);
