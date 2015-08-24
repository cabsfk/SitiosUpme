
var dominio = "http://arcgis.simec.gov.co:6080"; //Dominio del arcgis server  http://localhost:6080

var buffetCP = 300;
var ordenarGeojson; //global de orden de capa de centrso poblados

var id_user = idUsuario;
var id_user_validacion = idUsuario;
var UsrOrgJson = "";

if (idUsuario != "") {

    $.getJSON("../../MVCupme/Home/UsrOrgJson?idusuario=" + idUsuario, function (data) {
        UsrOrgJson = data;
        console.log("UsrOrgJson");
        console.log(UsrOrgJson);
    })
}


var urlHostSUEdit = "/arcgis/rest/services/UPME_BC/UPME_BC_Sitios_UPME_Edicion/";
var urlHostSUCons = "/arcgis/rest/services/UPME_BC/UPME_BC_Sitios_UPME_Vistas/";
var urlHostDP = "/arcgis/rest/services/UPME_BC/UPME_BC_Sitios_UPME_Division_Politica/";

var geojsonMarkerDane = { icon: L.AwesomeMarkers.icon({ icon: 'home', prefix: 'fa', markerColor: 'purple' }), riseOnHover: true };
var geojsonMarkerUpme = { icon: L.AwesomeMarkers.icon({ icon: 'home', prefix: 'fa', markerColor: 'cadetblue' }), riseOnHover: true };
var geojsonMarkerSinAprobar = { icon: L.AwesomeMarkers.icon({ icon: 'home', prefix: 'fa', markerColor: 'orange' }), riseOnHover: true };


var arrayclases = [], arraytipos = [];


/***********************************
 // CONFIGURACION DE MAPA
 ***********************************/
var southWest = L.latLng(-15, -90),
    northEast = L.latLng(30, -60),
    bounds = L.latLngBounds(southWest, northEast);

var map = L.map('map', {
    center: [4.12521648, -74.5020],
    zoom: 5,
    minZoom: 5,
    maxBounds: bounds,
    zoomControl: false
});

new L.Control.Zoom({ position: 'topright' }).addTo(map);

/*********************************
//CONFIGURACION DE FORMATO
**********************************/
var legend = L.control({ position: 'bottomright' });
var pagina = document.URL.split("/");
var Nombrepagina = pagina[pagina.length - 1];
Nombrepagina = Nombrepagina.replace("#", "");
var prefijo = "";
if (Nombrepagina == "") {
    prefijo = "./";
}else{
    prefijo = "../";
}


legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
    div.innerHTML += '<i ><img src="' + prefijo + 'images/leyend/creacionpunto.png"  height="20px"></i>Sitio UPME en creación<br>';
    div.innerHTML += '<i ><img src="'+prefijo+'images/leyend/Upme.png"  height="20px"></i>Sitio UPME<br>';
    div.innerHTML += '<i ><img src="' + prefijo + 'images/leyend/Dane.png"  height="20px"></i>Centro Poblado DANE<br>';
    div.innerHTML += '<i ><img src="' + prefijo + 'images/leyend/SinAprobar.png" height="20px"></i> Sitio Upme Sin Aprobar<br>';
    div.innerHTML += '<i ><img src="' + prefijo + 'images/leyend/Cluster.png" height="18px"></i> Agrupaciones<br>';
    div.innerHTML += '<i ><img src="' + prefijo + 'images/leyend/municipio.png"  height="17px"></i>Municipio<br>';
    div.innerHTML += '<i ><img src="' + prefijo + 'images/leyend/municipioSelecionado.png"  height="17px"></i>Municipio Seleccionado<br>';
    div.innerHTML += '<i ><img src="' + prefijo + 'images/leyend/zonaRestriccion.png"  height="17px"></i>Zona De Restricción<br>';
    div.innerHTML += '<i ><img src="' + prefijo + 'images/leyend/CentroPoblado.png"  height="17px"></i>Centro Poblado<br>';
    return div;
};

legend.addTo(map);



/*********************************
//CAPAS BASE 
**********************************/

// Activacion de carousel
$('.carousel').carousel({
    interval: 7000
});

var OpenMapSurfer_Roads = L.tileLayer('http://openmapsurfer.uni-hd.de/tiles/roads/x={x}&y={y}&z={z}', {
    minZoom: 0,
    maxZoom: 20,
    attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

var LyrBase = L.esri.basemapLayer('Streets').addTo(map);;
var LyrLabels;

function setBasemap(basemap) {
    if (map.hasLayer(LyrBase)) {
        map.removeLayer(LyrBase);
    }
    if (basemap != "OSM") {
        LyrBase = L.esri.basemapLayer(basemap);
    } else {
        LyrBase = OpenMapSurfer_Roads;
    }
    map.addLayer(LyrBase);
    $(".esri-leaflet-logo").hide();
    $(".leaflet-control-attribution").hide();
}

$("#BaseESRIStreets, #BaseESRISatellite, #BaseESRITopo, #BaseOSM").click(function () {
    setBasemap($(this).attr('value'));
})

$(".esri-leaflet-logo").hide();
$(".leaflet-control-attribution").hide();

var osm2 = L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
    minZoom: 2,
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'examples.map-i875mjb7'
});

var miniMap = new L.Control.MiniMap(osm2, { toggleDisplay: true, width: 190, height: 80, zoomLevelOffset: -5 }).addTo(map);


var promptIcon = ['glyphicon-fullscreen'];
var hoverText = ['Extencion Total'];
var functions = [function () {
    map.setView([4.12521648, -74.5020], 5);
}];


$(function () {
    for (i = 0; i < promptIcon.length ; i++) {
        var funk = 'L.easyButton(\'' + promptIcon[i] + '\', <br/>              ' + functions[i] + ',<br/>             \'' + hoverText[i] + '\'<br/>            )'
        $('#para' + i).append('<pre>' + funk + '</pre>')
        explaination = $('<p>').attr({ 'style': 'text-align:right;' }).append('This created the <i class="' + promptIcon[i] + (promptIcon[i].lastIndexOf('fa', 0) === 0 ? ' fa fa-lg' : ' glyphicon') + '"></i> button.')
        $('#para' + i).append(explaination)
        L.easyButton(promptIcon[i], functions[i], hoverText[i])
    } (i);
});
var MapLayerLimitesDane = L.esri.dynamicMapLayer(dominio +urlHostDP+ 'MapServer', {
    layers: [2, 3]
}).addTo(map);

MapLayerLimitesDane.on('load', function (e) {
    MapLayerLimitesDane.bringToBack();
});

/*****************************************************
******Opciones Formulario De Centros poblados
*****************************************************/

var query_clase = L.esri.Tasks.query({
    url: dominio + urlHostSUCons+'MapServer/2'
});

query_clase.where("1=1").returnGeometry(false).run(function (error, featureCollection) {
    $.each(featureCollection.features, function (index, value) {

        arrayclases[value.properties.ID_CLASE_CP] = value.properties.NOM_CLASE_CP;
            $("#SectClase").append('<option value="' + value.properties.ID_CLASE_CP + '">' + value.properties.NOM_CLASE_CP + '</option>');
            $("#EditSectClase").append('<option value="' + value.properties.ID_CLASE_CP + '">' + value.properties.NOM_CLASE_CP + '</option>');
        
    });
});


function ActClaseVentEmer(){
    query_clase.where("1=1").returnGeometry(false).run(function (error, featureCollection) {
        $.each(featureCollection.features, function (index, value) {
            $("#ActSectClase").append('<option value="' + value.properties.ID_CLASE_CP + '">' + value.properties.NOM_CLASE_CP + '</option>');
        });
    });
}

var query_tipo = L.esri.Tasks.query({
    url: dominio + urlHostSUCons+'MapServer/4'
});

query_tipo.where("1=1").returnGeometry(false).run(function (error, featureCollection) {

    $.each(featureCollection.features, function (index, value) {
        arraytipos[value.properties.ID_TIPO_CP] = value.properties.NOM_TIPO_CP;
        console.log(value.properties.ID_TIPO_CP + '">' + value.properties.NOM_TIPO_CP);
        if (value.properties.ID_TIPO_CP != 1) {
            $("#SectTipo").append('<option value="' + value.properties.ID_TIPO_CP + '">' + value.properties.NOM_TIPO_CP + '</option>');
            $("#EditSectTipo").append('<option value="' + value.properties.ID_TIPO_CP + '">' + value.properties.NOM_TIPO_CP + '</option>');
        }
    });
});

for (i = moment().format('YYYY') ; i >=1990 ; i--) {
    $("#SecVigenciaAnio").append('<option value="' + i + '">' + i + '</option>');
    $("#EditSecVigenciaAnio").append('<option value="' + i + '">' + i + '</option>');
}



/*********************************
//FUNCIONES
**********************************/


function clickmap(id, lyrname) {
    //console.log(LyrCentroPoblado);
    if (lyrname == "LyrCentroPoblado") {
        LyrCentroPoblado.eachLayer(function (marker) {
            if (marker.feature.id == id) {
                marker.openPopup();
                map.panTo(marker.getLatLng());
            }
        });
    } else if (lyrname == "lyrCentrosPobladosT") {
        lyrCentrosPobladosT.eachLayer(function (marker) {
            if (marker.feature.id == id) {
                marker.openPopup();
                map.panTo(marker.getLatLng());
            }
        });
    }else if (lyrname == "lyrTotalCentrosPoblados") {
        lyrTotalCentrosPoblados.eachLayer(function (marker) {
            if (marker.feature.id == id) {
                
                map.setView(marker.getLatLng(), 14);
                //map.panTo(marker.getLatLng());
                marker.openPopup();
            }
        });
    }

}
function zoomCP(x, y) {
    var latLng = L.latLng(y, x);
    map.setView(latLng, 14);
}
var mousemove = document.getElementById('mousemove');

map.on('mousemove', function (e) {
    window[e.type].innerHTML = 'LON:'+e.latlng.lng.toFixed(6) + '   LAT:' + e.latlng.lat.toFixed(6);
});

function ClaseZona(valor, pretext) {
    if (valor == '1') {
        $("#" + pretext + "FormInpViviendasU").removeClass('hide');
        $("#" + pretext + "FormInpViviendasR").addClass('hide');
        $("#" + pretext + "FormInpViviendasSSU").removeClass('hide');
        $("#" + pretext + "FormInpViviendasSSR").addClass('hide');
    } else if (valor == '2') {
        $("#" + pretext + "FormInpViviendasU").addClass('hide');
        $("#" + pretext + "FormInpViviendasR").removeClass('hide');
        $("#" + pretext + "FormInpViviendasSSU").addClass('hide');
        $("#" + pretext + "FormInpViviendasSSR").removeClass('hide');
    } else if (valor == '3') {
        $("#" + pretext + "FormInpViviendasU").removeClass('hide');
        $("#" + pretext + "FormInpViviendasR").removeClass('hide');
        $("#" + pretext + "FormInpViviendasSSU").removeClass('hide');
        $("#" + pretext + "FormInpViviendasSSR").removeClass('hide');
    }
}

$("#SectClase").change(function () {
    ClaseZona($(this).val(), "");
});


$("#EditSectClase").change(function () {
    ClaseZona($(this).val(), "Edit");
});

function NumDec(event) {
    if (event.keyCode < 48 || event.keyCode > 57) {
        if (event.keyCode != 46 && event.keyCode != 45) {
            event.returnValue = false;
        }
    }
}
function NumDecPos(event) {
    if (event.keyCode < 48 || event.keyCode > 57) {
        if (event.keyCode != 46) {
            event.returnValue = false;
        }
    }
}
function NumPositivo(event) {
    if (event.keyCode < 48 || event.keyCode > 57)
        event.returnValue = false;

}

function limpiarRadios() {
    if ($("input[name='ExisteCP']:checked").val() == "SI") {
        $('#existSi').attr("checked", false);
    } else {
        $('#existNo').attr("checked", false);
    }
    $("#Pgn2Sig").addClass("disabled");
}

$('#SecVigenciaMes').prop('disabled', false);


$("#SecVigenciaAnio,#EditSecVigenciaAnio").change(function () {
    var currentId = $(this).attr('id');
    var tipo = currentId.substr(0, 4);
    var prevalue = tipo == "SecV" ? "" : tipo == "Edit" ? tipo.substr(0, 4) : tipo;
    console.log('prevalue');
    console.log(prevalue);
    var SelctAnio = $("#" + prevalue + "SecVigenciaAnio").val();
    if (SelctAnio == "") {
        $('#' + prevalue + 'SecVigenciaMes').val("");
        $("#" + prevalue + "SecVigenciaMes").prop('disabled', 'disabled');
    } else {
        $('#' + prevalue + 'SecVigenciaMes').prop('disabled', false);
        $('#' + prevalue + 'SecVigenciaMes').empty();
        $("#" + prevalue + "SecVigenciaMes").append('<option value=""></option>');
        if (SelctAnio == moment().format("YYYY")) {
            for (i = parseInt(moment().format('MM')) ; i >= 1 ; i--) {
                $("#" + prevalue + "SecVigenciaMes").append('<option value="' + i + '">' + i + '</option>');
            }
        } else {
            for (i = 12 ; i >= 1 ; i--) {
                $("#" + prevalue + "SecVigenciaMes").append('<option value="' + i + '">' + i + '</option>');
            }
        }
    }
});


$("#SecVigenciaMes").prop('disabled', 'disabled');

function getDataUser(idusuario) {
    console.log(idusuario);
    var datauserjson = '';
    $.ajax({
        url: "../../MVCupme/Home/UsrOrgJson?idusuario=" + idusuario,
        dataType: 'json',
        async: false,
        success: function (json) {
            datauserjson = json;
        }
    });
    return datauserjson;
}
    
    