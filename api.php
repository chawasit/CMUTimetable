<?php

function httpPost($url,$params){
    $postData = '';
    //create name value pairs seperated by &
    foreach($params as $k => $v){
      $postData .= $k . '='.$v.'&';
    }

    $ch = curl_init(); 

    curl_setopt($ch,CURLOPT_URL,$url);
    curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);
    curl_setopt($ch,CURLOPT_HEADER, false);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData); 
    curl_setopt($ch,CURLOPT_CONNECTTIMEOUT ,3);
    curl_setopt($ch,CURLOPT_TIMEOUT, 20);

    $output=curl_exec($ch);

    curl_close($ch);
    return $output;
}

if( isset($_GET['sem']) and isset($_GET['sid']))
{
    if( is_numeric($_GET['sem']) and is_numeric($_GET['sid']))
    {
        echo file_get_contents("https://www3.reg.cmu.ac.th/regist".$_GET['sem']."/public/result.php?id=".$_GET['sid']);
    }else{
        echo "ERROR";
    }
}elseif ( isset($_GET['sem']) and isset($_GET['c']) and isset($_GET['lec']) and isset($_GET['lab']) ){

    if ( is_numeric($_GET['sem']) and is_numeric($_GET['c']) and is_numeric($_GET['lec']) and is_numeric($_GET['lab']) )
    {
        $params = array(
           "s_course1" =>$_GET['c'],
           "s_lec1" => $_GET['lec'],
           "s_lab1" => $_GET['lab'],
           "op" => "bycourse"
        );
        echo httpPost("https://www3.reg.cmu.ac.th/regist".$_GET['sem']."/public/search.php?act=search", $params);
    }else{
        echo "ERROR";
    }
}
?>