BEGIN;

CREATE TABLE alembic_version (
    version_num VARCHAR(32) NOT NULL, 
    CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
);

-- Running upgrade  -> 0001_initial_schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() NOT NULL, 
    email VARCHAR(320) NOT NULL, 
    password_hash VARCHAR(255) NOT NULL, 
    full_name VARCHAR(200) NOT NULL, 
    role VARCHAR(20) NOT NULL, 
    is_active BOOLEAN DEFAULT true NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    CONSTRAINT pk_users PRIMARY KEY (id), 
    CONSTRAINT ck_users_ck_users_role CHECK (role in ('student', 'teacher', 'admin'))
);

CREATE UNIQUE INDEX ix_users_email ON users (email);

CREATE INDEX ix_users_role ON users (role);

CREATE TABLE student_profiles (
    id UUID DEFAULT gen_random_uuid() NOT NULL, 
    user_id UUID NOT NULL, 
    grade_level VARCHAR(32), 
    guardian_email VARCHAR(320), 
    learning_preferences JSONB DEFAULT '{}'::jsonb NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    CONSTRAINT pk_student_profiles PRIMARY KEY (id), 
    CONSTRAINT fk_student_profiles_user_id_users FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE, 
    CONSTRAINT uq_student_profiles_user_id UNIQUE (user_id)
);

CREATE INDEX ix_student_profiles_user_id ON student_profiles (user_id);

CREATE TABLE teacher_profiles (
    id UUID DEFAULT gen_random_uuid() NOT NULL, 
    user_id UUID NOT NULL, 
    department VARCHAR(100), 
    title VARCHAR(100), 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    CONSTRAINT pk_teacher_profiles PRIMARY KEY (id), 
    CONSTRAINT fk_teacher_profiles_user_id_users FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE, 
    CONSTRAINT uq_teacher_profiles_user_id UNIQUE (user_id)
);

CREATE INDEX ix_teacher_profiles_user_id ON teacher_profiles (user_id);

CREATE TABLE topics (
    id UUID DEFAULT gen_random_uuid() NOT NULL, 
    name VARCHAR(160) NOT NULL, 
    description TEXT, 
    parent_topic_id UUID, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    CONSTRAINT pk_topics PRIMARY KEY (id), 
    CONSTRAINT fk_topics_parent_topic_id_topics FOREIGN KEY(parent_topic_id) REFERENCES topics (id) ON DELETE SET NULL, 
    CONSTRAINT uq_topics_name UNIQUE (name)
);

CREATE INDEX ix_topics_name ON topics (name);

CREATE INDEX ix_topics_parent_topic_id ON topics (parent_topic_id);

CREATE TABLE subtopics (
    id UUID DEFAULT gen_random_uuid() NOT NULL, 
    topic_id UUID NOT NULL, 
    name VARCHAR(160) NOT NULL, 
    description TEXT, 
    sequence_order INTEGER DEFAULT 0 NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    CONSTRAINT pk_subtopics PRIMARY KEY (id), 
    CONSTRAINT fk_subtopics_topic_id_topics FOREIGN KEY(topic_id) REFERENCES topics (id) ON DELETE CASCADE, 
    CONSTRAINT uq_subtopic_topic_name UNIQUE (topic_id, name)
);

CREATE INDEX ix_subtopics_topic_id ON subtopics (topic_id);

CREATE TABLE teacher_students (
    id UUID DEFAULT gen_random_uuid() NOT NULL, 
    teacher_id UUID NOT NULL, 
    student_id UUID NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    CONSTRAINT pk_teacher_students PRIMARY KEY (id), 
    CONSTRAINT fk_teacher_students_student_id_student_profiles FOREIGN KEY(student_id) REFERENCES student_profiles (id) ON DELETE CASCADE, 
    CONSTRAINT fk_teacher_students_teacher_id_teacher_profiles FOREIGN KEY(teacher_id) REFERENCES teacher_profiles (id) ON DELETE CASCADE, 
    CONSTRAINT uq_teacher_student UNIQUE (teacher_id, student_id)
);

CREATE INDEX ix_teacher_students_teacher_id ON teacher_students (teacher_id);

CREATE INDEX ix_teacher_students_student_id ON teacher_students (student_id);

CREATE TABLE knowledge_edges (
    id UUID DEFAULT gen_random_uuid() NOT NULL, 
    prerequisite_subtopic_id UUID NOT NULL, 
    dependent_subtopic_id UUID NOT NULL, 
    weight FLOAT DEFAULT 1.0 NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    CONSTRAINT pk_knowledge_edges PRIMARY KEY (id), 
    CONSTRAINT fk_knowledge_edges_dependent_subtopic_id_subtopics FOREIGN KEY(dependent_subtopic_id) REFERENCES subtopics (id) ON DELETE CASCADE, 
    CONSTRAINT fk_knowledge_edges_prerequisite_subtopic_id_subtopics FOREIGN KEY(prerequisite_subtopic_id) REFERENCES subtopics (id) ON DELETE CASCADE, 
    CONSTRAINT uq_knowledge_edge UNIQUE (prerequisite_subtopic_id, dependent_subtopic_id), 
    CONSTRAINT ck_knowledge_edges_ck_knowledge_edges_not_self CHECK (prerequisite_subtopic_id <> dependent_subtopic_id)
);

CREATE INDEX ix_knowledge_edges_prerequisite_subtopic_id ON knowledge_edges (prerequisite_subtopic_id);

CREATE INDEX ix_knowledge_edges_dependent_subtopic_id ON knowledge_edges (dependent_subtopic_id);

CREATE TABLE bkt_parameters (
    id UUID DEFAULT gen_random_uuid() NOT NULL, 
    subtopic_id UUID NOT NULL, 
    prior FLOAT DEFAULT 0.2 NOT NULL, 
    learn FLOAT DEFAULT 0.12 NOT NULL, 
    guess FLOAT DEFAULT 0.2 NOT NULL, 
    slip FLOAT DEFAULT 0.1 NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    CONSTRAINT pk_bkt_parameters PRIMARY KEY (id), 
    CONSTRAINT fk_bkt_parameters_subtopic_id_subtopics FOREIGN KEY(subtopic_id) REFERENCES subtopics (id) ON DELETE CASCADE, 
    CONSTRAINT uq_bkt_parameters_subtopic_id UNIQUE (subtopic_id), 
    CONSTRAINT ck_bkt_parameters_ck_bkt_parameters_prior CHECK (prior between 0 and 1), 
    CONSTRAINT ck_bkt_parameters_ck_bkt_parameters_learn CHECK (learn between 0 and 1), 
    CONSTRAINT ck_bkt_parameters_ck_bkt_parameters_guess CHECK (guess between 0 and 1), 
    CONSTRAINT ck_bkt_parameters_ck_bkt_parameters_slip CHECK (slip between 0 and 1)
);

CREATE INDEX ix_bkt_parameters_subtopic_id ON bkt_parameters (subtopic_id);

CREATE TABLE questions (
    id UUID DEFAULT gen_random_uuid() NOT NULL, 
    subtopic_id UUID NOT NULL, 
    stem TEXT NOT NULL, 
    choices JSONB DEFAULT '[]'::jsonb NOT NULL, 
    correct_answer VARCHAR(500) NOT NULL, 
    explanation TEXT, 
    difficulty_b FLOAT DEFAULT 0.0 NOT NULL, 
    status VARCHAR(20) DEFAULT 'draft' NOT NULL, 
    created_by_user_id UUID, 
    tags JSONB DEFAULT '[]'::jsonb NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    CONSTRAINT pk_questions PRIMARY KEY (id), 
    CONSTRAINT fk_questions_created_by_user_id_users FOREIGN KEY(created_by_user_id) REFERENCES users (id) ON DELETE SET NULL, 
    CONSTRAINT fk_questions_subtopic_id_subtopics FOREIGN KEY(subtopic_id) REFERENCES subtopics (id) ON DELETE CASCADE, 
    CONSTRAINT ck_questions_ck_questions_status CHECK (status in ('draft', 'active', 'retired'))
);

CREATE INDEX ix_questions_subtopic_id ON questions (subtopic_id);

CREATE INDEX ix_questions_difficulty_b ON questions (difficulty_b);

CREATE INDEX ix_questions_status ON questions (status);

CREATE INDEX ix_questions_created_by_user_id ON questions (created_by_user_id);

CREATE TABLE student_subtopic_masteries (
    id UUID DEFAULT gen_random_uuid() NOT NULL, 
    student_id UUID NOT NULL, 
    subtopic_id UUID NOT NULL, 
    mastery_probability FLOAT DEFAULT 0.2 NOT NULL, 
    attempts INTEGER DEFAULT 0 NOT NULL, 
    correct_count INTEGER DEFAULT 0 NOT NULL, 
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    CONSTRAINT pk_student_subtopic_masteries PRIMARY KEY (id), 
    CONSTRAINT fk_student_subtopic_masteries_student_id_student_profiles FOREIGN KEY(student_id) REFERENCES student_profiles (id) ON DELETE CASCADE, 
    CONSTRAINT fk_student_subtopic_masteries_subtopic_id_subtopics FOREIGN KEY(subtopic_id) REFERENCES subtopics (id) ON DELETE CASCADE, 
    CONSTRAINT uq_student_subtopic_mastery UNIQUE (student_id, subtopic_id), 
    CONSTRAINT ck_student_subtopic_masteries_ck_student_subtopic_maste_46f1 CHECK (mastery_probability between 0 and 1)
);

CREATE INDEX ix_student_subtopic_masteries_student_id ON student_subtopic_masteries (student_id);

CREATE INDEX ix_student_subtopic_masteries_subtopic_id ON student_subtopic_masteries (subtopic_id);

CREATE TABLE ability_estimates (
    id UUID DEFAULT gen_random_uuid() NOT NULL, 
    student_id UUID NOT NULL, 
    topic_id UUID NOT NULL, 
    theta FLOAT DEFAULT 0.0 NOT NULL, 
    standard_error FLOAT DEFAULT 1.0 NOT NULL, 
    posterior JSONB DEFAULT '{}'::jsonb NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    CONSTRAINT pk_ability_estimates PRIMARY KEY (id), 
    CONSTRAINT fk_ability_estimates_student_id_student_profiles FOREIGN KEY(student_id) REFERENCES student_profiles (id) ON DELETE CASCADE, 
    CONSTRAINT fk_ability_estimates_topic_id_topics FOREIGN KEY(topic_id) REFERENCES topics (id) ON DELETE CASCADE, 
    CONSTRAINT uq_student_topic_ability UNIQUE (student_id, topic_id)
);

CREATE INDEX ix_ability_estimates_student_id ON ability_estimates (student_id);

CREATE INDEX ix_ability_estimates_topic_id ON ability_estimates (topic_id);

CREATE TABLE assessments (
    id UUID DEFAULT gen_random_uuid() NOT NULL, 
    student_id UUID NOT NULL, 
    topic_id UUID NOT NULL, 
    current_subtopic_id UUID, 
    status VARCHAR(20) DEFAULT 'active' NOT NULL, 
    theta FLOAT DEFAULT 0.0 NOT NULL, 
    standard_error FLOAT DEFAULT 1.0 NOT NULL, 
    started_at TIMESTAMP WITH TIME ZONE, 
    completed_at TIMESTAMP WITH TIME ZONE, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    CONSTRAINT pk_assessments PRIMARY KEY (id), 
    CONSTRAINT fk_assessments_current_subtopic_id_subtopics FOREIGN KEY(current_subtopic_id) REFERENCES subtopics (id) ON DELETE SET NULL, 
    CONSTRAINT fk_assessments_student_id_student_profiles FOREIGN KEY(student_id) REFERENCES student_profiles (id) ON DELETE CASCADE, 
    CONSTRAINT fk_assessments_topic_id_topics FOREIGN KEY(topic_id) REFERENCES topics (id) ON DELETE CASCADE, 
    CONSTRAINT ck_assessments_ck_assessments_status CHECK (status in ('active', 'completed', 'abandoned'))
);

CREATE INDEX ix_assessments_student_id ON assessments (student_id);

CREATE INDEX ix_assessments_topic_id ON assessments (topic_id);

CREATE INDEX ix_assessments_current_subtopic_id ON assessments (current_subtopic_id);

CREATE INDEX ix_assessments_status ON assessments (status);

CREATE TABLE assessment_responses (
    id UUID DEFAULT gen_random_uuid() NOT NULL, 
    assessment_id UUID NOT NULL, 
    question_id UUID NOT NULL, 
    subtopic_id UUID NOT NULL, 
    answer VARCHAR(500) NOT NULL, 
    is_correct BOOLEAN NOT NULL, 
    theta_before FLOAT NOT NULL, 
    theta_after FLOAT NOT NULL, 
    mastery_before FLOAT NOT NULL, 
    mastery_after FLOAT NOT NULL, 
    response_time_ms INTEGER, 
    attempt_index INTEGER NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    CONSTRAINT pk_assessment_responses PRIMARY KEY (id), 
    CONSTRAINT fk_assessment_responses_assessment_id_assessments FOREIGN KEY(assessment_id) REFERENCES assessments (id) ON DELETE CASCADE, 
    CONSTRAINT fk_assessment_responses_question_id_questions FOREIGN KEY(question_id) REFERENCES questions (id) ON DELETE CASCADE, 
    CONSTRAINT fk_assessment_responses_subtopic_id_subtopics FOREIGN KEY(subtopic_id) REFERENCES subtopics (id) ON DELETE CASCADE
);

CREATE INDEX ix_assessment_responses_assessment_id ON assessment_responses (assessment_id);

CREATE INDEX ix_assessment_responses_question_id ON assessment_responses (question_id);

CREATE INDEX ix_assessment_responses_subtopic_id ON assessment_responses (subtopic_id);

CREATE TABLE question_exposures (
    id UUID DEFAULT gen_random_uuid() NOT NULL, 
    student_id UUID NOT NULL, 
    assessment_id UUID NOT NULL, 
    question_id UUID NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    CONSTRAINT pk_question_exposures PRIMARY KEY (id), 
    CONSTRAINT fk_question_exposures_assessment_id_assessments FOREIGN KEY(assessment_id) REFERENCES assessments (id) ON DELETE CASCADE, 
    CONSTRAINT fk_question_exposures_question_id_questions FOREIGN KEY(question_id) REFERENCES questions (id) ON DELETE CASCADE, 
    CONSTRAINT fk_question_exposures_student_id_student_profiles FOREIGN KEY(student_id) REFERENCES student_profiles (id) ON DELETE CASCADE
);

CREATE INDEX ix_question_exposures_student_id ON question_exposures (student_id);

CREATE INDEX ix_question_exposures_assessment_id ON question_exposures (assessment_id);

CREATE INDEX ix_question_exposures_question_id ON question_exposures (question_id);

CREATE TABLE assessment_events (
    id UUID DEFAULT gen_random_uuid() NOT NULL, 
    assessment_id UUID NOT NULL, 
    event_type VARCHAR(32) NOT NULL, 
    payload JSONB DEFAULT '{}'::jsonb NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    CONSTRAINT pk_assessment_events PRIMARY KEY (id), 
    CONSTRAINT fk_assessment_events_assessment_id_assessments FOREIGN KEY(assessment_id) REFERENCES assessments (id) ON DELETE CASCADE, 
    CONSTRAINT ck_assessment_events_ck_assessment_events_event_type CHECK (event_type in ('started', 'response_submitted', 'progressed', 'backtracked', 'completed'))
);

CREATE INDEX ix_assessment_events_assessment_id ON assessment_events (assessment_id);

CREATE INDEX ix_assessment_events_event_type ON assessment_events (event_type);

INSERT INTO alembic_version (version_num) VALUES ('0001_initial_schema') RETURNING alembic_version.version_num;

COMMIT;

