<?php
// // https://stackoverflow.com/questions/18019203/php-json-encode-not-working
// // https://www.rebasedata.com/conversion/79d41e9061b879cdb772be888d61418e
// // https://www.php.net/manual/en/sqlite3.query.php
// // https://www.tutorialrepublic.com/faq/how-to-append-a-string-in-php.php#:~:targetText=There%20is%20no%20specific%20function,a%20string%20with%20another%20string.
// // https://www.w3schools.com/php/php_looping_foreach.asp
// // https://www.geeksforgeeks.org/removing-array-element-and-re-indexing-in-php/

$fullpost = $_POST;
// echo "here i am ";
// print_r($test["columnNames"]);

// $firstname = $_POST['First_name'];
// $lastname = $_POST['Last_name'];

// $host = "localhost";
// $dbusername="root";
// $dbpassword = "j@KK737493962018";
// $dbname = "budapest_test";
// $person = new \stdClass();
//
// $conn = new mysqli ($host,$dbusername,$dbpassword,$dbname);
// mysqli_set_charset($conn, 'utf8');
//
// if (mysqli_connect_error()){
// die('Connect Error ('. mysqli_connect_errno() .') '
// . mysqli_connect_error());
// }
//
// $sql = "SELECT * FROM fulldataset WHERE Last_name ='".$name."'";
//
// $results = mysqli_query($conn,$sql);
//
// $newArr = array();
// while($row = mysqli_fetch_array($results)) {
//   $newArr[] = $row;
// }
//
// $myJSON = json_encode($newArr);
// echo $myJSON;
// mysqli_close($conn);

$db = new SQLite3("../database/data.db");

$column = $fullpost["columnNames"][0];
unset($fullpost["columnNames"][0]);


$query = $fullpost[$column];
$sql = "SELECT * FROM full_dataset WHERE ".$column." ='".$query."'";

foreach($fullpost["columnNames"] as $value) {
  $sql .= "AND ".$value." = '".$fullpost[$value]."'";
}

$sql .= "COLLATE NOCASE LIMIT 100";

// "SELECT * FROM full_dataset2_Sheet1 WHERE Last_name ='".$lastname."'"
$newArr = array();
$results = $db->query($sql);
while($row = $results->fetchArray()){
    $newArr[] = $row;
}

$myJSON = json_encode($newArr);
echo $myJSON;

$db->close();

?>
