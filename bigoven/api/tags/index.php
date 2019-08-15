<?php
require '../functions.php';
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

// init
$db = new MyDB();

// query
$sql = "SELECT Tag, COUNT(*) AS c
    FROM recipe_tag
    GROUP BY Tag
    --HAVING c > 2
    ORDER BY c DESC";
$res = $db->query($sql);

$result = array();
while($row = $res->fetchArray(SQLITE3_ASSOC)) {

  // reading columns
  $obj = new StdClass();
  $obj->Tag = (string)$row['Tag'];
  $obj->c = (string)$row['c'];

  array_push($result, $obj);
}
$db->close();

$myJSON = json_encode($result);
echo $myJSON;

?>