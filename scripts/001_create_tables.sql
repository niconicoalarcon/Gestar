-- Tabla de información del embarazo
CREATE TABLE IF NOT EXISTS pregnancy_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_name TEXT NOT NULL,
  due_date DATE NOT NULL,
  last_period_date DATE,
  doctor_name TEXT,
  hospital TEXT,
  blood_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Tabla de documentos médicos
CREATE TABLE IF NOT EXISTS medical_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'pdf', 'image'
  file_size INTEGER,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  document_date DATE,
  category TEXT, -- 'ecografia', 'analisis', 'receta', 'otros'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de notas diarias
CREATE TABLE IF NOT EXISTS daily_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note_date DATE NOT NULL,
  symptoms TEXT,
  mood TEXT,
  weight DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE pregnancy_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_notes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para pregnancy_info
CREATE POLICY "Users can view their own pregnancy info"
  ON pregnancy_info FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pregnancy info"
  ON pregnancy_info FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pregnancy info"
  ON pregnancy_info FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pregnancy info"
  ON pregnancy_info FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para medical_documents
CREATE POLICY "Users can view their own documents"
  ON medical_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents"
  ON medical_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
  ON medical_documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
  ON medical_documents FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para daily_notes
CREATE POLICY "Users can view their own notes"
  ON daily_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes"
  ON daily_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON daily_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON daily_notes FOR DELETE
  USING (auth.uid() = user_id);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_medical_documents_user_id ON medical_documents(user_id);
CREATE INDEX idx_medical_documents_upload_date ON medical_documents(upload_date DESC);
CREATE INDEX idx_daily_notes_user_id ON daily_notes(user_id);
CREATE INDEX idx_daily_notes_date ON daily_notes(note_date DESC);
