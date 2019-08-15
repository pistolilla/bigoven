DROP TABLE IF EXISTS recipe_info;
CREATE TABLE IF NOT EXISTS recipe_info (
	Id INTEGER NOT NULL,
	Title TEXT NOT NULL,
	StarRating NUMERIC,
	Servings NUMERIC,
    ReviewCount INTEGER,
	PhotoUrl TEXT
);

DROP TABLE IF EXISTS recipe_cuisine;
CREATE TABLE IF NOT EXISTS recipe_cuisine (
	Id INTEGER NOT NULL,
	Cuisine TEXT NOT NULL,
    UNIQUE(Id, Cuisine) ON CONFLICT IGNORE
);

DROP TABLE IF EXISTS recipe_category;
CREATE TABLE IF NOT EXISTS recipe_category (
	Id INTEGER NOT NULL,
	Category TEXT NOT NULL,
	Subcategory TEXT,
    UNIQUE(Id, Category, Subcategory) ON CONFLICT IGNORE
);