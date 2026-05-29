-- ============================================
-- SUPABASE DATABASE SCHEMA
-- Happy Instalasi - AI-Powered Installation Assistant
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: libraries
-- Menyimpan data library yang tersedia
-- ============================================
CREATE TABLE libraries (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    version VARCHAR(50),
    icon VARCHAR(10),
    difficulty VARCHAR(20),
    platforms TEXT[], -- Array of platforms: windows, linux, macos
    dependencies TEXT[], -- Array of dependencies
    documentation VARCHAR(255),
    features TEXT[], -- Array of features
    coming_soon BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLE: generation_history
-- Menyimpan history setiap kali user generate commands
-- ============================================
CREATE TABLE generation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(100) NOT NULL,
    library_id VARCHAR(50) NOT NULL REFERENCES libraries(id),
    os VARCHAR(20) NOT NULL,
    cpu VARCHAR(100),
    gpu VARCHAR(100),
    ram VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index untuk query yang sering dipakai
CREATE INDEX idx_generation_history_session ON generation_history(session_id);
CREATE INDEX idx_generation_history_library ON generation_history(library_id);
CREATE INDEX idx_generation_history_os ON generation_history(os);
CREATE INDEX idx_generation_history_created ON generation_history(created_at DESC);

-- ============================================
-- TABLE: ai_chat_history
-- Menyimpan history percakapan dengan AI Assistant
-- ============================================
CREATE TABLE ai_chat_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(100) NOT NULL,
    library_id VARCHAR(50) REFERENCES libraries(id),
    os VARCHAR(20),
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    suggestions TEXT[], -- Array of suggestions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index untuk query yang sering dipakai
CREATE INDEX idx_ai_chat_session ON ai_chat_history(session_id);
CREATE INDEX idx_ai_chat_library ON ai_chat_history(library_id);
CREATE INDEX idx_ai_chat_created ON ai_chat_history(created_at DESC);

-- ============================================
-- INSERT INITIAL DATA: Libraries
-- ============================================
INSERT INTO libraries (id, name, description, category, version, icon, difficulty, platforms, dependencies, documentation, features, coming_soon) VALUES
('opengl', 'OpenGL', 'Open Graphics Library - Cross-platform API for rendering 2D and 3D graphics', 'Graphics', 'Latest', '🎨', 'Medium', 
    ARRAY['windows', 'linux', 'macos'], 
    ARRAY['GLEW', 'GLFW', 'OpenGL'], 
    'https://www.opengl.org/documentation/',
    ARRAY['Cross-platform compatibility', 'Hardware acceleration', 'Extensive community support', 'Mature and stable API'],
    false
),
('vulkan', 'Vulkan', 'Modern cross-platform graphics and compute API', 'Graphics', 'Latest', '⚡', 'Advanced',
    ARRAY['windows', 'linux', 'macos'],
    ARRAY['Vulkan SDK', 'GLFW'],
    'https://www.vulkan.org/',
    ARRAY['Low-level GPU control', 'Better performance', 'Multi-threading support', 'Modern architecture'],
    true
),
('directx', 'DirectX', 'Microsoft graphics API for Windows', 'Graphics', '12', '🎮', 'Advanced',
    ARRAY['windows'],
    ARRAY['Windows SDK', 'DirectX SDK'],
    'https://docs.microsoft.com/en-us/windows/win32/directx',
    ARRAY['Windows native', 'Excellent performance', 'Gaming industry standard', 'Ray tracing support'],
    true
);

-- ============================================
-- VIEWS: Analytics & Statistics
-- ============================================

-- View: Library usage statistics
CREATE VIEW library_usage_stats AS
SELECT 
    l.id,
    l.name,
    COUNT(gh.id) as total_generations,
    COUNT(DISTINCT gh.session_id) as unique_users,
    COUNT(CASE WHEN gh.created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as last_7_days,
    COUNT(CASE WHEN gh.created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as last_30_days
FROM libraries l
LEFT JOIN generation_history gh ON l.id = gh.library_id
GROUP BY l.id, l.name
ORDER BY total_generations DESC;

-- View: OS distribution
CREATE VIEW os_distribution AS
SELECT 
    os,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM generation_history
GROUP BY os
ORDER BY count DESC;

-- View: Recent activity
CREATE VIEW recent_activity AS
SELECT 
    gh.id,
    gh.session_id,
    l.name as library_name,
    gh.os,
    gh.cpu,
    gh.gpu,
    gh.created_at
FROM generation_history gh
JOIN libraries l ON gh.library_id = l.id
ORDER BY gh.created_at DESC
LIMIT 100;

-- ============================================
-- FUNCTIONS: Helper functions
-- ============================================

-- Function: Get library statistics
CREATE OR REPLACE FUNCTION get_library_stats(lib_id VARCHAR)
RETURNS TABLE (
    total_generations BIGINT,
    unique_users BIGINT,
    most_common_os VARCHAR,
    avg_generations_per_day NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_generations,
        COUNT(DISTINCT session_id)::BIGINT as unique_users,
        MODE() WITHIN GROUP (ORDER BY os) as most_common_os,
        ROUND(COUNT(*)::NUMERIC / GREATEST(EXTRACT(DAY FROM (MAX(created_at) - MIN(created_at))), 1), 2) as avg_generations_per_day
    FROM generation_history
    WHERE library_id = lib_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- Uncomment jika ingin enable RLS untuk security
-- ============================================

-- ALTER TABLE libraries ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE generation_history ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ai_chat_history ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to libraries
-- CREATE POLICY "Allow public read access to libraries" ON libraries
--     FOR SELECT USING (true);

-- Policy: Allow insert to generation_history
-- CREATE POLICY "Allow insert to generation_history" ON generation_history
--     FOR INSERT WITH CHECK (true);

-- Policy: Allow insert to ai_chat_history
-- CREATE POLICY "Allow insert to ai_chat_history" ON ai_chat_history
--     FOR INSERT WITH CHECK (true);

-- ============================================
-- NOTES
-- ============================================
-- 1. Copy semua SQL di atas ke Supabase SQL Editor
-- 2. Run untuk create tables, indexes, views, dan functions
-- 3. Data libraries akan otomatis ter-insert
-- 4. Uncomment RLS policies jika ingin enable security
