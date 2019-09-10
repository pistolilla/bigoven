<?php
require '../functions.php';
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

// init
$db = new MyDB();
// GET
if ($_GET['primary']) {
    $sql = "SELECT DISTINCT PrimaryIngredient AS IdT
    FROM recipe_info
    ORDER BY PrimaryIngredient";
} else {
    $sql = "SELECT DISTINCT IdT
    FROM ingredient_info
    WHERE Active
    ORDER BY IdT";
}

$res = $db->query($sql);

$result = array();
while($row = $res->fetchArray(SQLITE3_ASSOC)) {

  // reading columns
  $obj = new StdClass();
  $obj->IdT = (string)$row['IdT'];
  array_push($result, $obj);
}
$db->close();

$myJSON = json_encode($result);
echo $myJSON;

?>