-- Fix Aug 24-31 daily puzzles: replace obscure/advanced vocabulary with
-- everyday (K-12) words. Run: wrangler d1 execute trvlplay-db --remote --file=fix-daily-k12-aug.sql

UPDATE puzzles SET
  difficulty = 'k12',
  group1_label = 'Farm animals',            group1_items = '["COW","PIG","HORSE","SHEEP"]',
  group2_label = 'Things with a box',       group2_items = '["LUNCH","MAIL","TOOL","SAND"]',
  group3_label = 'Things that are cold',    group3_items = '["ICE","SNOW","WINTER","FREEZER"]',
  group4_label = 'Card games',              group4_items = '["POKER","RUMMY","SNAP","WAR"]'
WHERE daily_date = '2026-08-24';

UPDATE puzzles SET
  difficulty = 'k12',
  group1_label = 'Breakfast foods',         group1_items = '["EGGS","BACON","TOAST","CEREAL"]',
  group2_label = 'Things with a ball',      group2_items = '["BASKET","FOOT","BASE","EYE"]',
  group3_label = 'Ocean animals',           group3_items = '["SHARK","WHALE","DOLPHIN","OCTOPUS"]',
  group4_label = 'Things that are loud',    group4_items = '["THUNDER","SIREN","DRUM","ALARM"]'
WHERE daily_date = '2026-08-25';

UPDATE puzzles SET
  difficulty = 'k12',
  group1_label = 'School supplies',         group1_items = '["PENCIL","ERASER","RULER","GLUE"]',
  group2_label = 'Things with a board',     group2_items = '["KEY","SURF","CARD","CHESS"]',
  group3_label = 'Types of weather',        group3_items = '["RAIN","SNOW","WIND","FOG"]',
  group4_label = 'Things at a birthday party', group4_items = '["CAKE","BALLOON","CANDLE","PRESENT"]'
WHERE daily_date = '2026-08-26';

UPDATE puzzles SET
  difficulty = 'k12',
  group1_label = 'Zoo animals',             group1_items = '["LION","TIGER","BEAR","MONKEY"]',
  group2_label = 'Things with a light',     group2_items = '["FLASH","SUN","MOON","SPOT"]',
  group3_label = 'Vegetables',              group3_items = '["CARROT","POTATO","BROCCOLI","CORN"]',
  group4_label = 'Things you ride',         group4_items = '["BIKE","BUS","TRAIN","HORSE"]'
WHERE daily_date = '2026-08-27';

UPDATE puzzles SET
  difficulty = 'k12',
  group1_label = 'Things in a kitchen',     group1_items = '["OVEN","FORK","SPOON","PLATE"]',
  group2_label = 'Types of boats',          group2_items = '["SAIL","ROW","SPEED","LIFE"]',
  group3_label = 'Fruits',                  group3_items = '["APPLE","BANANA","GRAPE","ORANGE"]',
  group4_label = 'Things that fly',         group4_items = '["BIRD","KITE","PLANE","BALLOON"]'
WHERE daily_date = '2026-08-28';

UPDATE puzzles SET
  difficulty = 'k12',
  group1_label = 'Board games',             group1_items = '["CHESS","CHECKERS","MONOPOLY","SORRY"]',
  group2_label = 'Types of cake',           group2_items = '["PAN","CUP","FRUIT","SHORT"]',
  group3_label = 'Tools',                   group3_items = '["HAMMER","WRENCH","SAW","DRILL"]',
  group4_label = 'Sports',                  group4_items = '["SOCCER","TENNIS","HOCKEY","GOLF"]'
WHERE daily_date = '2026-08-29';

UPDATE puzzles SET
  difficulty = 'k12',
  group1_label = 'Things that melt',        group1_items = '["ICE","SNOW","BUTTER","CHOCOLATE"]',
  group2_label = 'Types of houses',         group2_items = '["TREE","DOLL","LIGHT","GREEN"]',
  group3_label = 'Insects',                 group3_items = '["ANT","BEE","FLY","LADYBUG"]',
  group4_label = 'Superheroes',             group4_items = '["BATMAN","SUPERMAN","SPIDERMAN","HULK"]'
WHERE daily_date = '2026-08-30';

UPDATE puzzles SET
  difficulty = 'k12',
  group1_label = 'Things at the end of summer', group1_items = '["SUNBURN","BACKPACK","HARVEST","CRICKET"]',
  group2_label = 'Things that are golden',  group2_items = '["HONEY","WHEAT","SUNSET","RETRIEVER"]',
  group3_label = 'Things you save',         group3_items = '["MONEY","SEAT","ENERGY","TIME"]',
  group4_label = 'Things that end something', group4_items = '["GRADUATION","GOODBYE","FINISH","CREDITS"]'
WHERE daily_date = '2026-08-31';
