<?php
/*******************************************************************************
*************************** Resources ******************************************
********************************************************************************

https://stackoverflow.com/questions/18019203/php-json-encode-not-working
https://www.rebasedata.com/conversion/79d41e9061b879cdb772be888d61418e
https://www.php.net/manual/en/sqlite3.query.php
https://www.tutorialrepublic.com/faq/how-to-append-a-string-in-php.php#:~:targetText=There%20is%20no%20specific%20function,a%20string%20with%20another%20string.
https://www.w3schools.com/php/php_looping_foreach.asp
https://www.geeksforgeeks.org/removing-array-element-and-re-indexing-in-php/
https://docs.phpdoc.org/getting-started/your-first-set-of-documentation.html
*/

/*******************************************************************************
***************************** Functions ****************************************
*******************************************************************************/

/**
 * This is a function that will create a sql statement based a query
 *
 * The function creates an intial sql statement which searchs for all results
 * in the database.table where the first column equals the query. Next, all
 * of the columns available are iterated upon, and new parts of the sql
 * statment are appended
 *
 * @param string $tablename is the name of the table.
 * @param array $fullpost is the array of column names.
 *
 * @return string
 */
function createSQL($tablename,$fullpost) {
  // $sql = "SELECT * FROM ".$tablename." WHERE ".$firstcolumn." ".."'".$query_value."'";

  $index = 0;
  foreach($fullpost["columnNames"] as $column) {

    $value = $fullpost[$column]["value"];
    $conditional = $fullpost[$column]["conditional"];

    if ($index == 0) {
      $sql = "SELECT * FROM ".$tablename." WHERE ".$column." ".$conditional." '".$value."' ";
    } else {
      $sql .= "AND ".$column." ".$conditional." '".$value."'";
    }
    $index++;
  }

  $sql .= " COLLATE NOCASE LIMIT 100";
  return $sql;
}
/******************************************************************************/

/**
 * This is a function that will create a new arry of results.
 *
 * The function first intializes a new array, and iterates over each row in
 * the provided results.
 *
 * @param query $results is a query object created from the
 * the function query
 *
 * @return array
 */
function createArr($results) {
  $newArr = array();
  while($row = $results->fetchArray()){
      $newArr[] = $row;
  }
  return $newArr;
}

/*******************************************************************************
************************* Initialize Variables *********************************
*******************************************************************************/
$fullpost = $_POST;
$db = new SQLite3("../database/data.db");
$tablename = "raw_data";

/*******************************************************************************
***************************** Function Calls ***********************************
*******************************************************************************/
$sql = createSQL($tablename,$fullpost);

$results = $db->query($sql);
$newArr = createArr($results);
$myJSON = json_encode($newArr);
echo $myJSON;

$db->close();
?>
