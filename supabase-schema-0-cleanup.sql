-- ============================================================
-- LERNE! – KROK 0: Cleanup (usuń stare tabele)
-- Uruchom najpierw, przed skryptami 1 i 2
-- ============================================================

DROP TABLE IF EXISTS task_results  CASCADE;
DROP TABLE IF EXISTS assignments   CASCADE;
DROP TABLE IF EXISTS tasks         CASCADE;
DROP TABLE IF EXISTS lessons       CASCADE;
DROP TABLE IF EXISTS profiles      CASCADE;

DROP FUNCTION IF EXISTS handle_new_user()      CASCADE;
DROP FUNCTION IF EXISTS update_updated_at()    CASCADE;
DROP FUNCTION IF EXISTS get_my_role()          CASCADE;
DROP FUNCTION IF EXISTS is_teacher()           CASCADE;
DROP FUNCTION IF EXISTS i_own_lesson(UUID)     CASCADE;
DROP FUNCTION IF EXISTS lesson_assigned_to_me(UUID) CASCADE;
DROP FUNCTION IF EXISTS assignment_belongs_to_me(UUID) CASCADE;
