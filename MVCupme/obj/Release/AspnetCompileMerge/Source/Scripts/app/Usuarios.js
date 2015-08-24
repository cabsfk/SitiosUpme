/*$("#UserCrear").click(function () {
    localStorage.setItem("tipouser", "UserCrear");
    location.reload();
});

$("#UserValidar").click(function () {
    localStorage.setItem("tipouser", "UserValidar");
    location.reload();
});

$("#UserSalir").click(function () {
    localStorage.setItem("tipouser", "");
    location.reload();
});

//localStorage.setItem("tipouser", "");
if (localStorage.getItem("tipouser") == "UserCrear") {

    $("#barnavegacion").append(
    '<li id="Pgn"><a> Inicio</a></li>' +
    '<li id="PgnCrear"><a>Crear</a></li>' +
    '<li id="PgnContact"><a>Contact</a></li>');

    
}else if (localStorage.getItem("tipouser") == "UserValidar") {
    $("#barnavegacion").append(
    '<li id="Pgn"><a> Inicio</a></li>' +
    '<li id="PgnCrear"><a>Crear</a></li>' +
    '<li id="PgnValidar"><a>Validar</a></li>' );
} else {
    $("#barnavegacion").append(
    '<li id="Pgn"><a> Inicio</a></li>' );
}

$("#Pgn").click(function () {
    window.location.assign("./");

});
$("#PgnCrear").click(function () {
    window.location.assign("./Crear");

});
$("#PgnValidar").click(function () {
    window.location.assign("./validar");
});
$("#PgnContact").click(function () {
    window.location.assign("./Contact");
});*/