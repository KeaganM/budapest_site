<!DOCTYPE html>
<html>
<head>
<style>
table {
    width: 100%;
    border-collapse: collapse;
}

table, td, th {
    border: 1px solid black;
    padding: 5px;
}

th {text-align: left;}
</style>
</head>
<body>

<?php

$q = intval($_GET['q']);

$con = mysqli_connect("localhost","root","j@KK737493962018","budapest_test")

if (!$con){
  die("could not connect: " . mysqli_error($con));
}


mysqli_select_db($con,"budapest_test");
$sql="SELECT * FROM user WHERE id = '".$q."'";
$result = mysqli_query($con,$sql);

echo "<table>
<tr>
<th>Firstname</th>
<th>Lastname</th>
<th>Age</th>
<th>x</th>
<th>y</th>
<th>address</th>
</tr>";
while($row = mysqli_fetch_array($result)) {
    echo "<tr>";
    echo "<td>" . $row['first_name'] . "</td>";
    echo "<td>" . $row['last_name'] . "</td>";
    echo "<td>" . $row['age'] . "</td>";
    echo "<td>" . $row['x'] . "</td>";
    echo "<td>" . $row['y'] . "</td>";
    echo "<td>" . $row['address'] . "</td>";
    echo "</tr>";
}
echo "</table>";
mysqli_close($con);
?>
</body>
</html>
