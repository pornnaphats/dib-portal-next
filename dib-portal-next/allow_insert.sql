-- Allow anon to insert data (Temporary for Migration)
CREATE POLICY "Allow anon insert access" ON employees FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert access" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert access" ON schedules FOR INSERT WITH CHECK (true);
