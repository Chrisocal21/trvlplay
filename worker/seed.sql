-- TrvlPlay Puzzle Seed
-- Run: wrangler d1 execute trvlplay-db --remote --file=seed.sql

-- Daily puzzles
INSERT OR IGNORE INTO puzzles (daily_date, difficulty, group1_label, group1_items, group2_label, group2_items, group3_label, group3_items, group4_label, group4_items)
VALUES (
  '2026-05-10', 'medium',
  'Kitchen tools',    '["WHISK","LADLE","SPATULA","COLANDER"]',
  'Types of pasta',   '["PENNE","FUSILLI","RIGATONI","LINGUINE"]',
  'Card games',       '["POKER","RUMMY","SNAP","SOLITAIRE"]',
  'Weather events',   '["HAIL","SLEET","DRIZZLE","THUNDER"]'
);

INSERT OR IGNORE INTO puzzles (daily_date, difficulty, group1_label, group1_items, group2_label, group2_items, group3_label, group3_items, group4_label, group4_items)
VALUES (
  '2026-05-11', 'medium',
  'Breakfast foods',    '["BACON","WAFFLE","MUFFIN","OATMEAL"]',
  'Shades of blue',     '["NAVY","COBALT","INDIGO","AZURE"]',
  'Things that buzz',   '["BEE","PHONE","ALARM","CHAINSAW"]',
  'Sports on a court',  '["TENNIS","BASKETBALL","SQUASH","VOLLEYBALL"]'
);

INSERT OR IGNORE INTO puzzles (daily_date, difficulty, group1_label, group1_items, group2_label, group2_items, group3_label, group3_items, group4_label, group4_items)
VALUES (
  '2026-05-12', 'medium',
  'Things you crack', '["EGG","SAFE","CODE","JOKE"]',
  'Herbs',            '["BASIL","MINT","SAGE","THYME"]',
  'Jazz legends',     '["MILES","ELLA","DUKE","CHET"]',
  'Zoo animals',      '["LION","TIGER","GIRAFFE","PENGUIN"]'
);

INSERT OR IGNORE INTO puzzles (daily_date, difficulty, group1_label, group1_items, group2_label, group2_items, group3_label, group3_items, group4_label, group4_items)
VALUES (
  '2026-05-13', 'medium',
  'Things in space',  '["COMET","NEBULA","ASTEROID","QUASAR"]',
  'Dances',           '["TANGO","WALTZ","SALSA","FOXTROT"]',
  'Types of cheese',  '["BRIE","GOUDA","CHEDDAR","FETA"]',
  'Things that glow', '["FIREFLY","LAVA","NEON","EMBER"]'
);

INSERT OR IGNORE INTO puzzles (daily_date, difficulty, group1_label, group1_items, group2_label, group2_items, group3_label, group3_items, group4_label, group4_items)
VALUES (
  '2026-05-14', 'easy',
  'Colors of the rainbow',  '["RED","ORANGE","GREEN","VIOLET"]',
  'Things with wings',      '["BIRD","AIRPLANE","BUTTERFLY","BAT"]',
  'Hot drinks',             '["COFFEE","TEA","COCOA","CIDER"]',
  'Things that are sticky', '["HONEY","TAPE","GLUE","GUM"]'
);

INSERT OR IGNORE INTO puzzles (daily_date, difficulty, group1_label, group1_items, group2_label, group2_items, group3_label, group3_items, group4_label, group4_items)
VALUES (
  '2026-05-15', 'hard',
  'Things that pop',    '["BALLOON","BUBBLE","POPCORN","CHAMPAGNE"]',
  'Types of bridges',   '["ARCH","CABLE","SUSPENSION","DRAWBRIDGE"]',
  'Greek gods',         '["ZEUS","APOLLO","HERMES","POSEIDON"]',
  'Shades of green',    '["MINT","OLIVE","JADE","SAGE"]'
);

INSERT OR IGNORE INTO puzzles (daily_date, difficulty, group1_label, group1_items, group2_label, group2_items, group3_label, group3_items, group4_label, group4_items)
VALUES (
  '2026-05-16', 'medium',
  'Famous rivers',    '["NILE","AMAZON","GANGES","THAMES"]',
  'Types of clouds',  '["CIRRUS","CUMULUS","STRATUS","NIMBUS"]',
  'Board games',      '["CHESS","SCRABBLE","MONOPOLY","CLUE"]',
  'Things with shells','["SNAIL","TURTLE","CRAB","WALNUT"]'
);

-- Free play puzzles (no daily_date)
INSERT OR IGNORE INTO puzzles (daily_date, difficulty, group1_label, group1_items, group2_label, group2_items, group3_label, group3_items, group4_label, group4_items)
VALUES (
  NULL, 'medium',
  'Ocean creatures',      '["OCTOPUS","JELLYFISH","SEAHORSE","STINGRAY"]',
  'Famous mountains',     '["EVEREST","FUJI","KILIMANJARO","DENALI"]',
  'Musical instruments',  '["VIOLIN","TRUMPET","OBOE","XYLOPHONE"]',
  'Things you wear on your head', '["HELMET","BEANIE","CROWN","TURBAN"]'
);

INSERT OR IGNORE INTO puzzles (daily_date, difficulty, group1_label, group1_items, group2_label, group2_items, group3_label, group3_items, group4_label, group4_items)
VALUES (
  NULL, 'easy',
  'Cartoon dogs',     '["PLUTO","SCOOBY","LASSIE","SNOOPY"]',
  'Things that spin', '["TOP","GYROSCOPE","WHEEL","TURBINE"]',
  'Ice cream flavors','["VANILLA","MINT","COOKIE","MANGO"]',
  'Things in a toolbox','["HAMMER","WRENCH","PLIERS","CHISEL"]'
);

INSERT OR IGNORE INTO puzzles (daily_date, difficulty, group1_label, group1_items, group2_label, group2_items, group3_label, group3_items, group4_label, group4_items)
VALUES (
  NULL, 'hard',
  'Things you can run',   '["MARATHON","BATH","PROGRAM","ERRAND"]',
  'Parts of a castle',    '["MOAT","TURRET","DRAWBRIDGE","KEEP"]',
  'Spicy condiments',     '["SRIRACHA","WASABI","TABASCO","HARISSA"]',
  'Types of knots',       '["BOWLINE","CLEAT","FIGURE EIGHT","REEF"]'
);

INSERT OR IGNORE INTO puzzles (daily_date, difficulty, group1_label, group1_items, group2_label, group2_items, group3_label, group3_items, group4_label, group4_items)
VALUES (
  NULL, 'medium',
  'Animals in Australia', '["KANGAROO","KOALA","WOMBAT","ECHIDNA"]',
  'Pasta shapes',         '["BOW TIE","SHELL","WHEEL","TUBE"]',
  'Things that are round','["WHEEL","COIN","PEARL","DRUM"]',
  'Planets',              '["MARS","VENUS","SATURN","URANUS"]'
);
