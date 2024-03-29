<?php
require '../functions.php';
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

// init
$db = new MyDB();
// GET
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT
                rowid,
                Title,
                Comment,
                Operator,
                --(SELECT GROUP_CONCAT(Tag, ', ') FROM diet_tag WHERE dietTitle = Title GROUP BY dietTitle ORDER BY Tag) AS Tags,
                COUNT(Id) AS c
            FROM (SELECT DISTINCT
                d.rowid,
                d.Title,
                d.Comment,
                d.Operator,
                rt.Id
            FROM diet_tag AS dt
                LEFT JOIN diet AS d ON (d.Title = dt.dietTitle)
                LEFT JOIN recipe_tag AS rt ON (dt.Tag = rt.Tag)
            ORDER BY d.Title, dt.Tag)
            GROUP BY rowid
            ORDER BY Title";
}
// POST
else {
    // reading params
    $body = $_POST['body'];
    $body = json_decode($body, true);

    // default
    $tagsStr = "";
    if($body["tags"]) {
        // escaping single quotes
        $tagsArr = array_map($escapeQuotes, $body["tags"]);
        // embedding
        $tagsStr = join("', '", $tagsArr);

        // new entry
        if ($body["title"]) {
            // reading params
            $title = $body["title"];
            $operator = $body["operator"];
            $comment = $body["comment"];
            // inserting diet
            $stmt = $db->prepare('INSERT OR REPLACE INTO diet (Title, Operator, Comment) VALUES (:title, :operator, :comment);');
            $stmt->bindValue(':title', $title, SQLITE3_TEXT);
            $stmt->bindValue(':operator', $operator, SQLITE3_TEXT);
            $stmt->bindValue(':comment', $comment, SQLITE3_TEXT);
            $stmt->execute();
            // inserting diet-tag
            foreach ($tagsArr as $tag) {
                $stmt = $db->prepare('INSERT INTO diet_tag (dietTitle, Tag) VALUES (:title, :tag);');
                $stmt->bindValue(':title', $title, SQLITE3_TEXT);
                $stmt->bindValue(':tag', $tag, SQLITE3_TEXT);
                $stmt->execute();
            }
        }
        // delete entry
        else if ($body["rowid"]) {
            // deleting diet
            $stmt = $db->prepare('DELETE FROM diet WHERE rowid = :rowid;');
            $stmt->bindValue(':rowid', $body["rowid"], SQLITE3_TEXT);
            $stmt->execute();
        }
    }

    // query
    $sql = "SELECT
        d.rowid,
        d.Title,
        d.Comment,
        d.Operator,
        (SELECT GROUP_CONCAT(Tag, ', ') FROM diet_tag WHERE dietTitle = d.Title GROUP BY dietTitle ORDER BY Tag) AS Tags
    FROM diet_tag AS dt
        LEFT JOIN diet AS d ON (d.Title = dt.dietTitle)
    WHERE Tag IN ('$tagsStr')
    GROUP BY d.Title
    ORDER BY d.Title";
}

$res = $db->query($sql);

$result = array();
while($row = $res->fetchArray(SQLITE3_ASSOC)) {

  // reading columns
  $obj = new StdClass();
  $obj->rowid = (string)$row['rowid'];
  $obj->Title = (string)$row['Title'];
  $obj->Comment = (string)$row['Comment'];
  $obj->Operator = (string)$row['Operator'];
  $obj->Tags = (string)$row['Tags'];
  $obj->c = (string)$row['c'];
  array_push($result, $obj);
}
$db->close();

$myJSON = json_encode($result);
echo $myJSON;

?>