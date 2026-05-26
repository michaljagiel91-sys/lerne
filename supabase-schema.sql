-- ============================================================
-- LERNE! – Supabase SQL Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT NOT NULL DEFAULT '',
  role        TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('teacher', 'student')),
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- LESSONS
-- ============================================================
CREATE TABLE IF NOT EXISTS lessons (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  level        TEXT CHECK (level IN ('A1','A2','B1','B2','C1','C2')),
  topic        TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TASKS
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id   UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN (
    'fill_blank','match_pairs','word_order','true_false',
    'multiple_choice','memory','crossword','tictactoe','labyrinth'
  )),
  title       TEXT NOT NULL,
  instructions TEXT,
  content     JSONB NOT NULL DEFAULT '{}',
  order_index INTEGER NOT NULL DEFAULT 0,
  points      INTEGER DEFAULT 10,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS tasks_lesson_id_idx ON tasks(lesson_id);
CREATE INDEX IF NOT EXISTS tasks_order_idx ON tasks(lesson_id, order_index);

-- ============================================================
-- ASSIGNMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS assignments (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id    UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  student_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  teacher_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  due_date     DATE,
  is_completed BOOLEAN DEFAULT FALSE,
  score        INTEGER,
  assigned_at  TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE (lesson_id, student_id)
);

CREATE INDEX IF NOT EXISTS assignments_student_idx ON assignments(student_id);
CREATE INDEX IF NOT EXISTS assignments_teacher_idx ON assignments(teacher_id);

-- ============================================================
-- TASK RESULTS
-- ============================================================
CREATE TABLE IF NOT EXISTS task_results (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  task_id       UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  student_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_correct    BOOLEAN DEFAULT FALSE,
  answer        JSONB,
  score         INTEGER DEFAULT 0,
  attempts      INTEGER DEFAULT 1,
  completed_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (assignment_id, task_id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons      ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks        ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_results ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Teachers can view student profiles"
  ON profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'teacher')
  );
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT WITH CHECK (true);

-- LESSONS
CREATE POLICY "Teachers manage own lessons"
  ON lessons FOR ALL USING (teacher_id = auth.uid());
CREATE POLICY "Students see assigned lessons"
  ON lessons FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assignments a
      WHERE a.lesson_id = lessons.id AND a.student_id = auth.uid()
    )
  );

-- TASKS
CREATE POLICY "Teachers manage tasks of own lessons"
  ON tasks FOR ALL USING (
    EXISTS (SELECT 1 FROM lessons l WHERE l.id = tasks.lesson_id AND l.teacher_id = auth.uid())
  );
CREATE POLICY "Students see tasks of assigned lessons"
  ON tasks FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assignments a
      JOIN lessons l ON l.id = a.lesson_id
      WHERE l.id = tasks.lesson_id AND a.student_id = auth.uid()
    )
  );

-- ASSIGNMENTS
CREATE POLICY "Teachers manage own assignments"
  ON assignments FOR ALL USING (teacher_id = auth.uid());
CREATE POLICY "Students see own assignments"
  ON assignments FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Students update own assignments"
  ON assignments FOR UPDATE USING (student_id = auth.uid());

-- TASK RESULTS
CREATE POLICY "Students manage own results"
  ON task_results FOR ALL USING (student_id = auth.uid());
CREATE POLICY "Teachers see results for their assignments"
  ON task_results FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assignments a
      WHERE a.id = task_results.assignment_id AND a.teacher_id = auth.uid()
    )
  );

-- ============================================================
-- STORAGE BUCKETS
-- Create these manually in Supabase Dashboard → Storage
-- OR uncomment below (requires storage extension)
-- ============================================================

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('media', 'media', true)
-- ON CONFLICT DO NOTHING;

-- CREATE POLICY "Authenticated users can upload media"
--   ON storage.objects FOR INSERT WITH CHECK (
--     bucket_id = 'media' AND auth.role() = 'authenticated'
--   );
-- CREATE POLICY "Public read media"
--   ON storage.objects FOR SELECT USING (bucket_id = 'media');
-- CREATE POLICY "Users can delete own media"
--   ON storage.objects FOR DELETE USING (
--     bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]
--   );

-- ============================================================
-- SEED: Create first teacher account
-- After running this SQL, go to Supabase Auth → Users
-- and manually create a teacher user, then run:
--
-- UPDATE profiles SET role = 'teacher' WHERE email = 'your@email.com';
-- ============================================================
