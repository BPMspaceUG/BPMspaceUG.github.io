<?php
# cd 3756635456442343545444325323 ; docker run -v $(pwd):/app/ php:8.0-cli php /app/createhtml.php > ChrisCraft.html; cd ..
$dir = __DIR__.'/img';
$images = scandir($dir);

$html = '<!DOCTYPE html>
<html>
<head>
    <title>Bildergalerie</title>
    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
</head>
<body>
    <div id="carouselExampleIndicators" class="carousel slide" data-ride="carousel">
        <ol class="carousel-indicators">';

// Indicators
foreach ($images as $index => $img) {
    if (preg_match('/\.(jpg|jpeg|png|gif)$/i', $img)) {
        $active = $index === 2 ? 'active' : ''; // Set the first image as active
        $html .= '<li data-target="#carouselExampleIndicators" data-slide-to="'.$index.'" class="'.$active.'"></li>';
    }
}

$html .= '</ol><div class="carousel-inner">';

// Carousel items
foreach ($images as $index => $img) {
    if (preg_match('/\.(jpg|jpeg|png|gif)$/i', $img)) {
        $active = $index === 2 ? 'active' : '';
        $html .= '<div class="carousel-item '.$active.'">
                      <img class="d-block " src="'.$dir.'/'.$img.'" alt="'.$img.'" style="width:1024px;">
                  </div>';
    }
}

$html .= '</div>
        <a class="carousel-control-prev" href="#carouselExampleIndicators" role="button" data-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="sr-only">Previous</span>
        </a>
        <a class="carousel-control-next" href="#carouselExampleIndicators" role="button" data-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="sr-only">Next</span>
        </a>
    </div>

    <!-- Bootstrap JavaScript -->
    <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
</body>
</html>';

#file_put_contents(__DIR__.'gallery.html', $html);
$html = str_replace("/app","/3756635456442343545444325323",$html);
echo $html;

?>
