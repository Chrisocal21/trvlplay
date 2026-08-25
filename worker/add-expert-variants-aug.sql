-- Adds an opt-in 'expert' hard-mode companion puzzle for each remaining August
-- date, reusing the original advanced-vocabulary content that used to be the
-- only daily option. Requires migrate-tiers.sql to have already run (composite
-- UNIQUE(daily_date, difficulty) constraint).
-- Run: wrangler d1 execute trvlplay-db --remote --file=add-expert-variants-aug.sql

INSERT OR IGNORE INTO puzzles (daily_date, difficulty, group1_label, group1_items, group2_label, group2_items, group3_label, group3_items, group4_label, group4_items)
VALUES (
  '2026-08-24', 'expert',
  'Words meaning to withdraw', '["RECEDE","RETRACT","ABDICATE","RESCIND"]',
  'Types of government',       '["OLIGARCHY","THEOCRACY","TECHNOCRACY","PLUTOCRACY"]',
  'Famous codes',              '["MORSE","HAMMURABI","JUSTINIAN","NAPOLEONIC"]',
  'Parts of a drama',          '["CATHARSIS","ANAGNORISIS","PERIPETEIA","HAMARTIA"]'
);

INSERT OR IGNORE INTO puzzles (daily_date, difficulty, group1_label, group1_items, group2_label, group2_items, group3_label, group3_items, group4_label, group4_items)
VALUES (
  '2026-08-25', 'expert',
  'Things that are circular',  '["CLOCK","PIZZA","RECORD","COIN"]',
  'Things you do at the gym',  '["SQUAT","PLANK","ROW","PRESS"]',
  'Things that are woolen',    '["SWEATER","BLANKET","RUG","SCARF"]',
  'Parts of a book',           '["SPINE","INDEX","CHAPTER","FOREWORD"]'
);

INSERT OR IGNORE INTO puzzles (daily_date, difficulty, group1_label, group1_items, group2_label, group2_items, group3_label, group3_items, group4_label, group4_items)
VALUES (
  '2026-08-26', 'expert',
  'Things that are rhythmic',  '["PULSE","TIDE","METRONOME","HEARTBEAT"]',
  'Types of vault',            '["BARREL","GROIN","RIBBED","FAN"]',
  'Words for hesitant',        '["TENTATIVE","RELUCTANT","WAVERING","AMBIVALENT"]',
  'Things you anchor',         '["SHIP","TENT","ARGUMENT","BROADCAST"]'
);

INSERT OR IGNORE INTO puzzles (daily_date, difficulty, group1_label, group1_items, group2_label, group2_items, group3_label, group3_items, group4_label, group4_items)
VALUES (
  '2026-08-27', 'expert',
  'Words meaning to flourish', '["THRIVE","BURGEON","PROLIFERATE","PROSPER"]',
  'Types of memory in computing','["CACHE","BUFFER","REGISTER","HEAP"]',
  'Famous manifestos',         '["COMMUNIST","FUTURIST","SURREALIST","DADA"]',
  'Parts of a legal argument', '["PREMISE","INFERENCE","CONCLUSION","REBUTTAL"]'
);

INSERT OR IGNORE INTO puzzles (daily_date, difficulty, group1_label, group1_items, group2_label, group2_items, group3_label, group3_items, group4_label, group4_items)
VALUES (
  '2026-08-28', 'expert',
  'Things at a market',        '["STALL","SCALE","BASKET","VENDOR"]',
  'Things that are loud',      '["THUNDER","CROWD","JET","DRUM"]',
  'Things you press',          '["FLOWER","SHIRT","BUTTON","RECORD"]',
  'Types of grain',            '["WHEAT","BARLEY","MILLET","SPELT"]'
);

INSERT OR IGNORE INTO puzzles (daily_date, difficulty, group1_label, group1_items, group2_label, group2_items, group3_label, group3_items, group4_label, group4_items)
VALUES (
  '2026-08-29', 'expert',
  'Things that are elastic',   '["RUBBER BAND","CARTILAGE","SPRING","WAISTBAND"]',
  'Types of dam',              '["GRAVITY","ARCH","BUTTRESS","EMBANKMENT"]',
  'Words for honest',          '["CANDID","FORTHRIGHT","GUILELESS","TRANSPARENT"]',
  'Things that are braided',   '["HAIR","BREAD","ROPE","RIVER"]'
);

INSERT OR IGNORE INTO puzzles (daily_date, difficulty, group1_label, group1_items, group2_label, group2_items, group3_label, group3_items, group4_label, group4_items)
VALUES (
  '2026-08-30', 'expert',
  'Words meaning to scatter',  '["DISPERSE","DISSIPATE","DIFFUSE","STREW"]',
  'Types of paradox',          '["ZENO","LIAR","TWIN","BOOTSTRAP"]',
  'Parts of a courtroom',      '["DOCK","BENCH","BAR","GALLERY"]',
  'Famous architects works',   '["FALLINGWATER","GUGGENHEIM","SAGRADA FAMILIA","POMPIDOU"]'
);

INSERT OR IGNORE INTO puzzles (daily_date, difficulty, group1_label, group1_items, group2_label, group2_items, group3_label, group3_items, group4_label, group4_items)
VALUES (
  '2026-08-31', 'expert',
  'Things at the end of summer','["SUNBURN","SCHOOL SUPPLY","HARVEST","CRICKET"]',
  'Things that are golden',    '["HONEY","WHEAT","SUNSET","RETRIEVER"]',
  'Things you save',           '["MONEY","FILE","SEAT","ENERGY"]',
  'Things that close a chapter','["GRADUATION","MOVE","BREAKUP","FAREWELL"]'
);
