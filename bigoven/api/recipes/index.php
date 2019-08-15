<?php
require '../functions.php';
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

// init
$db = new MyDB();

// query
if ($_GET['tag']) {
    $tag = $_GET['tag'];
    $sql = "SELECT
                ri.Id,
                ri.Title,
                ri.Servings,
                ri.PhotoUrl,
                ri.PrimaryIngredient,
                ri.TotalMinutes,
                ri.TotalCalories,
                rr.StarRating,
                rr.ReviewCount,
                rr.FavoriteCount
            FROM recipe_info AS ri
            LEFT JOIN recipe_rating AS rr ON (rr.Id = ri.Id)
            WHERE ri.Id IN (
                SELECT Id FROM recipe_tag WHERE Tag = '$tag')";
} else if ($_SERVER['REQUEST_METHOD'] == 'POST') {

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

  array_push($result, $obj);
}
$db->close();

$myJSON = json_encode($result);
echo $myJSON;

?>