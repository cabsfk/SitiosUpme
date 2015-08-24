//#main-slider

$(window).load(function () {
    var pagina = document.URL.split("/");
    var Nombrepagina = pagina[pagina.length - 1];
    Nombrepagina=Nombrepagina.replace("#", "");
    console.log(Nombrepagina);
    if (Nombrepagina != "") {
        $("#Pgn" + Nombrepagina).addClass('active');
    }else {
        $("#PgnIndex" ).addClass('active');
    }
    
});


