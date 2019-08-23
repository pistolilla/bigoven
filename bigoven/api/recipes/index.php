<?php
require '../functions.php';
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

// init
$db = new MyDB();

// reading params
$body = $_POST['body'];
$body = json_decode($body, true);

// via tags
if ($body["tags"]) {
    // escaping single quotes
    $tagsArr = array_map($escapeQuotes, $body["tags"]);
    // embedding
    $tagsStr = "'" . join("', '", $tagsArr) . "'";

    // query
    $sql = "SELECT
                ri.Id,
                ri.Title,
                ri.Servings,
                ri.PhotoUrl,
                ri.PrimaryIngredient,
                ri.TotalMinutes,
                ri.TotalCalories,
                ROUND(rr.StarRating, 1) AS StarRating,
                rr.ReviewCount,
                rr.FavoriteCount,
                LOWER(GROUP_CONCAT(ii.Name, ', ')) AS Ingredients
            FROM recipe_info AS ri
                LEFT JOIN recipe_rating AS rr ON (rr.Id = ri.Id)
                LEFT JOIN recipe_ingredient AS rn ON (rn.Id = ri.Id)
                LEFT JOIN ingredient_info AS ii ON (ii.Id = rn.ingredientId)
            WHERE ri.Id IN (
                SELECT DISTINCT Id FROM recipe_tag WHERE Tag IN ($tagsStr)
            )
            GROUP BY ri.Id
            ORDER BY FavoriteCount DESC, StarRating DESC, ri.Id
            LIMIT 50";
}
// via diets
else {
    // default
    $dietsArr = "";

    // array contains "diets"
    if ($body["diets"]) {
        // escaping single quotes
        $dietsArr = array_map($escapeQuotes, $body["diets"]);
        $dietsStr = join("', '", $dietsArr);
    }

    // query
    $sql = "SELECT
        ri.Id,
        ri.Title,
        ri.Servings,
        ri.PhotoUrl,
        ri.PrimaryIngredient,
        ri.TotalMinutes,
        ri.TotalCalories,
        ROUND(rr.StarRating, 1) AS StarRating,
        rr.ReviewCount,
        --LOWER(GROUP_CONCAT(ii.Name, ', ')) AS Ingredients,
        rr.FavoriteCount
    FROM recipe_info AS ri
        LEFT JOIN recipe_rating AS rr ON (rr.Id = ri.Id)
        --LEFT JOIN recipe_ingredient AS rn ON (rn.Id = ri.Id)
        --LEFT JOIN ingredient_info AS ii ON (ii.Id = rn.ingredientId)
    WHERE ri.Id IN (
        SELECT DISTINCT Id FROM recipe_tag WHERE Tag IN (
            SELECT Tag FROM diet_tag WHERE dietTitle IN ('$dietsStr')
        )
    )
    GROUP BY ri.Id
    ORDER BY FavoriteCount DESC, StarRating DESC, ri.Id";
}

$res = $db->query($sql);
$result = array();
while($row = $res->fetchArray(SQLITE3_ASSOC)) {

  // reading columns
  $obj = new StdClass();
  $obj->Id = (string)$row['Id'];
  $obj->Title = (string)$row['Title'];
  $obj->Servings = (string)$row['Servings'];
  $obj->PhotoUrl = (string)$row['PhotoUrl'];
  $obj->PrimaryIngredient = (string)$row['PrimaryIngredient'];
  $obj->TotalMinutes = (string)$row['TotalMinutes'];
  $obj->TotalCalories = (string)$row['TotalCalories'];
  $obj->StarRating = (string)$row['StarRating'];
  $obj->ReviewCount = (string)$row['ReviewCount'];
  $obj->FavoriteCount = (string)$row['FavoriteCount'];
  $obj->Ingredients = (string)$row['Ingredients'];

  array_push($result, $obj);
}
$db->close();

$myJSON = json_encode($result);
echo $myJSON;

?>