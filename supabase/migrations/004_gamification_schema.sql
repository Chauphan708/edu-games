-- ═══════════════════════════════════════════════════════
-- Educational Games - Gamification & Shop Schema
-- ═══════════════════════════════════════════════════════

-- 1. Student Profiles for Gamification
CREATE TABLE IF NOT EXISTS student_gamification (
  user_id         TEXT PRIMARY KEY, -- String ID from LMS
  coins           INT DEFAULT 0,
  xp              INT DEFAULT 0,
  level           INT DEFAULT 1,
  avatar_config   JSONB DEFAULT '{"base": "default", "hat": null, "glasses": null, "outfit": null}'::JSONB,
  unlocked_items  JSONB DEFAULT '[]'::JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Shop Items
CREATE TABLE IF NOT EXISTS shop_items (
  id          TEXT PRIMARY KEY, -- e.g., 'red_cap', 'cool_shades'
  name        TEXT NOT NULL,
  category    TEXT NOT NULL, -- 'hat', 'glasses', 'outfit', 'pet'
  price       INT NOT NULL DEFAULT 100,
  image_url   TEXT,
  rarity      TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Row Level Security
ALTER TABLE student_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;

-- Mỗi học sinh chỉ xem/cập nhật được profile của mình
CREATE POLICY "student_gamification_own" ON student_gamification
  FOR ALL USING (TRUE); -- Tạm thời cho phép xem để hiển thị Leaderboard

-- Mọi người đều xem được Shop
CREATE POLICY "shop_items_select" ON shop_items
  FOR SELECT USING (TRUE);

-- 4. Sample Items
INSERT INTO shop_items (id, name, category, price, rarity) VALUES
('straw_hat', 'Mũ rơm', 'hat', 50, 'common'),
('red_cap', 'Mũ lưỡi trai đỏ', 'hat', 100, 'common'),
('cool_shades', 'Kính cực ngầu', 'glasses', 200, 'rare'),
('golden_crown', 'Vương miện vàng', 'hat', 1000, 'legendary'),
('superhero_cape', 'Áo choàng siêu anh hùng', 'outfit', 500, 'epic')
ON CONFLICT (id) DO NOTHING;

-- 5. Trigger update_updated_at
CREATE TRIGGER trg_student_gamification_updated BEFORE UPDATE ON student_gamification
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
