-- ============================================================
-- LERNE! – Supabase SQL Schema v3
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT NOT NULL DEFAULT '',
  role        TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('teacher', 'student')),
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

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

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TASKS
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id    UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN (
                 'fill_blank','match_pairs','word_order','true_false',
                 'multiple_choice','memory','crossword','tictactoe','labyrinth'
               )),
  title        TEXT NOT NULL,
  instructions TEXT,
  content      JSONB NOT NULL DEFAULT '{}',
  order_index  INTEGER NOT NULL DEFAULT 0,
  points       INTEGER DEFAULT 10,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS tasks_lesson_id_idx ON tasks(lesson_id);

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
-- HELPER FUNCTIONS FOR RLS (security definer = bypass RLS)
-- ============================================================

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION is_teacher()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'teacher'
  )
$$;

CREATE OR REPLACE FUNCTION i_own_lesson(p_lesson_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.lessons
    WHERE id = p_lesson_id AND teacher_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION lesson_assigned_to_me(p_lesson_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.assignments
    WHERE lesson_id = p_lesson_id AND student_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION assignment_belongs_to_me(p_assignment_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.assignments
    WHERE id = p_assignment_id AND teacher_id = auth.uid()
  )
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons      ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks        ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_results ENABLE ROW LEVEL SECURITY;

-- ---------- PROFILES ----------
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (id = auth.uid() OR is_teacher());

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "profiles_insert"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- ---------- LESSONS ----------
CREATE POLICY "lessons_all_teacher"
  ON lessons FOR ALL
  USING (teacher_id = auth.uid());

CREATE POLICY "lessons_select_student"
  ON lessons FOR SELECT
  USING (lesson_assigned_to_me(id));

-- ---------- TASKS ----------
CREATE POLICY "tasks_all_teacher"
  ON tasks FOR ALL
  USING (i_own_lesson(lesson_id));

CREATE POLICY "tasks_select_student"
  ON tasks FOR SELECT
  USING (lesson_assigned_to_me(lesson_id));

-- ---------- ASSIGNMENTS ----------
CREATE POLICY "assignments_all_teacher"
  ON assignments FOR ALL
  USING (teacher_id = auth.uid());

CREATE POLICY "assignments_select_student"
  ON assignments FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "assignments_update_student"
  ON assignments FOR UPDATE
  USING (student_id = auth.uid());

-- ---------- TASK RESULTS ----------
CREATE POLICY "task_results_all_student"
  ON task_results FOR ALL
  USING (student_id = auth.uid());

CREATE POLICY "task_results_select_teacher"
  ON task_results FOR SELECT
  USING (assignment_belongs_to_me(assignment_id));

-- ============================================================
-- DONE
-- After running:
-- 1. Go to Authentication → Users → Add user (your teacher email)
-- 2. Then run:  UPDATE profiles SET role = 'teacher' WHERE email = 'your@email.com';
-- 3. Create Storage bucket "media" (public) in Storage tab
-- ============================================================
