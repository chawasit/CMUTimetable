<?php
if( isset($_GET['sem']) and isset($_GET['sid']))
{
    if( is_numeric($_GET['sem']) and is_numeric($_GET['sid']))
        echo file_get_contents("https://www3.reg.cmu.ac.th/regist".$_GET['sem']."/public/result.php?id=".$_GET['sid']);
    else
        echo "ERROR";
}
?>