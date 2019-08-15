DROP TABLE IF EXISTS recipe_info;
CREATE TABLE IF NOT EXISTS recipe_info (
	Id INTEGER NOT NULL,
	Title TEXT NOT NULL,
	Servings NUMERIC,
	PhotoUrl TEXT,
	PrimaryIngredient TEXT,
	Instructions TEXT,
	TotalMinutes NUMERIC,
	TotalCalories NUMERIC
);

DROP TABLE IF EXISTS recipe_rating;
CREATE TABLE IF NOT EXISTS recipe_rating (
	Id INTEGER NOT NULL,
	FavoriteCount INTEGER,
    StarRating NUMERIC,
    ReviewCount INTEGER,
    UNIQUE(Id) ON CONFLICT IGNORE
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

DROP TABLE IF EXISTS recipe_tag;
CREATE TABLE IF NOT EXISTS recipe_tag (
	Id INTEGER NOT NULL,
	Tag TEXT NOT NULL,
    UNIQUE(Id, Tag) ON CONFLICT IGNORE
);

DROP TABLE IF EXISTS ingredient_info;
CREATE TABLE IF NOT EXISTS ingredient_info (
	Id INTEGER NOT NULL,
	Name TEXT NOT NULL,
	Department TEXT,
	ReferenceUrl TEXT,
    UNIQUE(Id) ON CONFLICT IGNORE
);

DROP TABLE IF EXISTS recipe_ingredient;
CREATE TABLE IF NOT EXISTS recipe_ingredient (
	Id INTEGER NOT NULL,
	ingredientId INTEGER NOT NULL,
    Quantity NUMERIC,
    Unit TEXT,
    MetricQuantity NUMERIC,
    MetricUnit TEXT,
    UNIQUE(Id, ingredientId) ON CONFLICT IGNORE
);