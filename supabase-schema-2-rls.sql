-- ============================================================
-- LERNE! – KROK 2: RLS
-- ============================================================
ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons      ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE block_results ENABLE ROW LEVEL SECURITY;

-- PROFILES
DROP POLICY IF EXISTS "profiles_select_own"     ON profiles;
DROP POLICY IF EXISTS "profiles_select_teacher" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own"     ON profiles;
DROP POLICY IF EXISTS "profiles_insert"         ON profiles;

CREATE POLICY "profiles_select_own"     ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_select_teacher" ON profiles FOR SELECT USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'teacher');
-- Uczeń NIE może zmieniać roli
CREATE POLICY "profiles_update_own"     ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (role = (SELECT role FROM profiles WHERE id = auth.uid()));
CREATE POLICY "profiles_insert"         ON profiles FOR INSERT WITH CHECK (true);

-- LESSONS
DROP POLICY IF EXISTS "lessons_all_teacher"    ON lessons;
DROP POLICY IF EXISTS "lessons_select_student" ON lessons;

CREATE POLICY "lessons_all_teacher"    ON lessons FOR ALL    USING (teacher_id = auth.uid());
CREATE POLICY "lessons_select_student" ON lessons FOR SELECT USING (id IN (SELECT lesson_id FROM assignments WHERE student_id = auth.uid()));

-- BLOCKS
DROP POLICY IF EXISTS "blocks_all_teacher"    ON blocks;
DROP POLICY IF EXISTS "blocks_select_student" ON blocks;

CREATE POLICY "blocks_all_teacher"    ON blocks FOR ALL    USING (lesson_id IN (SELECT id FROM lessons WHERE teacher_id = auth.uid()));
CREATE POLICY "blocks_select_student" ON blocks FOR SELECT USING (lesson_id IN (SELECT lesson_id FROM assignments WHERE student_id = auth.uid()));

-- ASSIGNMENTS
DROP POLICY IF EXISTS "assignments_all_teacher"    ON assignments;
DROP POLICY IF EXISTS "assignments_select_student" ON assignments;
DROP POLICY IF EXISTS "assignments_update_student" ON assignments;

CREATE POLICY "assignments_all_teacher"    ON assignments FOR ALL    USING (teacher_id = auth.uid());
CREATE POLICY "assignments_select_student" ON assignments FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "assignments_update_student" ON assignments FOR UPDATE USING (student_id = auth.uid());

-- BLOCK RESULTS – uczeń może tylko dodawać/czytać własne, nie może zmieniać score
DROP POLICY IF EXISTS "block_results_insert_student" ON block_results;
DROP POLICY IF EXISTS "block_results_select_student" ON block_results;
DROP POLICY IF EXISTS "block_results_select_teacher" ON block_results;

CREATE POLICY "block_results_insert_student" ON block_results FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "block_results_select_student" ON block_results FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "block_results_select_teacher" ON block_results FOR SELECT USING (assignment_id IN (SELECT id FROM assignments WHERE teacher_id = auth.uid()));
