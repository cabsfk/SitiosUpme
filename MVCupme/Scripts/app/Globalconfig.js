var dominio = "http://arcgis.simec.gov.co:6080"; //Dominio del arcgis server  http://localhost:6080
var urlUPMEbase = '/arcgis/rest/services/UPME_BC/UPME_BC_Base_Cartografica/';
var urlHostSUEdit = "/arcgis/rest/services/UPME_BC/UPME_BC_Sitios_UPME_Edicion/";
var urlHostSUCons = "/arcgis/rest/services/UPME_BC/UPME_BC_Sitios_UPME_Vistas/";
var urlHostDP = "/arcgis/rest/services/UPME_BC/UPME_BC_Sitios_UPME_Division_Politica/";
var notaAclaratoria = 'De conformidad con el Decreto 1122 de 2008, la UPME se permite disponer esta herramienta para la recolección de la información correspondiente a la ubicación geográfica de los SITIOS así como las viviendas totales y viviendas que no cuentan con el servicio de energía eléctrica, tanto urbano como rural.Esta herramienta es una ayuda para que las Entidades Territoriales reporten información, produciéndose una capa propia de la UPME quien validará con otras fuentes la ubicación espacial de las localidades, para conseguir mayor calidad en la información para el Planeamiento de la Expansión de Cobertura de Energía Eléctrica.'

var buffetCP = 300;
var ordenarGeojson; //global de orden de capa de centrso poblados

var id_user = idUsuario;
var id_user_validacion = idUsuario;
var UsrOrgJson = "";

if (idUsuario != "") {

    $.getJSON("../../SitiosUpme/Home/UsrOrgJson?idusuario=" + idUsuario, function (data) {
        UsrOrgJson = data;
        $("#tituloOrganizacion").empty().append(UsrOrgJson[0].organizacion);
        /*  console.log("UsrOrgJson");
          console.log(UsrOrgJson);*/
    })
}


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
var prefijo = pagina[0] + '/' + pagina[1] + '/' + pagina[2] + '/' + pagina[3] + '/';

//console.log(prefijo);
waitingDialog.show();
legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
    if (pagina.length > 5) {
        div.innerHTML += '<i ><img src="' + prefijo + 'images/leyend/creacionpunto.png"  height="20px"></i>Sitio UPME en creación<br>';
        div.innerHTML += '<i ><img src="' + prefijo + 'images/leyend/SinAprobar.png" height="20px"></i> Sitio Upme Sin Aprobar<br>';
    }
    div.innerHTML += '<i ><img src="' + prefijo + 'images/leyend/Upme.png"  height="20px"></i>Sitio UPME Oficial<br>';
    div.innerHTML += '<i ><img src="' + prefijo + 'images/leyend/Dane.png"  height="20px"></i>Centro Poblado DANE<br>';
    div.innerHTML += '<i ><img src="' + prefijo + 'images/leyend/Cluster.png" height="18px"></i> Agrupaciones<br>';
    div.innerHTML += '<i ><img src="' + prefijo + 'images/leyend/municipio.png"  height="17px"></i>Municipio<br>';
    div.innerHTML += '<i ><img src="' + prefijo + 'images/leyend/municipioSelecionado.png"  height="17px"></i>Municipio Seleccionado<br>';
    div.innerHTML += '<i ><img src="' + prefijo + 'images/leyend/CentroPoblado.png"  height="17px"></i>Centro Poblado DANE<br>';
    if (idUsuario != '') {
        div.innerHTML += '<i ><img src="' + prefijo + 'images/leyend/zonaRestriccion.png"  height="17px"></i>Área de Influencia Sitio<br>';
    }
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

var OpenMapSurfer_Roads = L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/{type}/{z}/{x}/{y}.{ext}', {
    type: 'map',
    ext: 'jpg',
    attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: '1234'
});
var UPME_Base = L.tileLayer(dominio + urlUPMEbase + "MapServer/tile/{z}/{y}/{x}", {
    type: 'map',
    hideLogo: false,
    logoPosition: 'bottomright',
    minZoom: 5,
    maxZoom: 19,
    subdomains: ['server', 'services'],
    attribution: 'UPME BASE LAYER'
});

var LyrBase = L.esri.basemapLayer('Imagery').addTo(map);
var LyrLabels = L.esri.basemapLayer('ImageryLabels').addTo(map);

function setBasemap(basemap) {
    if (map.hasLayer(LyrBase)) {
        map.removeLayer(LyrBase);
    }
    if (basemap == "OSM") {
        LyrBase = OpenMapSurfer_Roads;
    } else if (basemap == "UPME") {
        LyrBase = UPME_Base;
    }
    else {
        LyrBase = L.esri.basemapLayer(basemap);
    }
    map.addLayer(LyrBase);
    if (map.hasLayer(LyrLabels)) {
        map.removeLayer(LyrLabels);
    }

    if (basemap === 'ShadedRelief' || basemap === 'Oceans' || basemap === 'Gray' || basemap === 'DarkGray' || basemap === 'Imagery' || basemap === 'Terrain') {
        LyrLabels = L.esri.basemapLayer(basemap + 'Labels');
        map.addLayer(LyrLabels);
    }
    $(".esri-leaflet-logo").hide();
    $(".leaflet-control-attribution").hide();
};

$("#BaseESRIStreets, #BaseESRISatellite, #BaseÜPME, #BaseOSM").click(function () {
    setBasemap($(this).attr('value'));
});

$(".esri-leaflet-logo").hide();
$(".leaflet-control-attribution").hide();

var osm2 = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

var miniMap = new L.Control.MiniMap(osm2, { toggleDisplay: true, width: 190, height: 80, zoomLevelOffset: -5 }).addTo(map);


var promptIcon = ['glyphicon-fullscreen'];
var hoverText = ['Extensión Total'];
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
var MapLayerLimitesDane = L.esri.dynamicMapLayer({
    url: dominio + urlHostDP + 'MapServer/',
    layers: [2, 3]
}).addTo(map);

MapLayerLimitesDane.on('load', function (e) {
    MapLayerLimitesDane.bringToBack();
});

/*****************************************************
******Opciones Formulario De Centros poblados
*****************************************************/

var query_clase = L.esri.Tasks.query({
    url: dominio + urlHostSUCons + 'MapServer/2'
});

query_clase.where("1=1").returnGeometry(false).run(function (error, featureCollection) {
    $.each(featureCollection.features, function (index, value) {

        arrayclases[value.properties.ID_CLASE_CP] = value.properties.NOM_CLASE_CP;
        $("#SectClase").append('<option value="' + value.properties.ID_CLASE_CP + '">' + value.properties.NOM_CLASE_CP + '</option>');
        $("#EditSectClase").append('<option value="' + value.properties.ID_CLASE_CP + '">' + value.properties.NOM_CLASE_CP + '</option>');

    });
});


var arrayFuentes = [];
var query_fuentes = L.esri.Tasks.query({
    url: dominio + urlHostSUCons + 'MapServer/3'
});

query_fuentes.where("1=1").returnGeometry(false).run(function (error, featureCollection) {
    $.each(featureCollection.features, function (index, value) {
        arrayFuentes[value.properties.ID_FUENTE_CS] = value.properties.NOM_FUENTE_CS;
    });
});


function ActClaseVentEmer() {
    query_clase.where("1=1").returnGeometry(false).run(function (error, featureCollection) {
        $.each(featureCollection.features, function (index, value) {
            $("#ActSectClase").append('<option value="' + value.properties.ID_CLASE_CP + '">' + value.properties.NOM_CLASE_CP + '</option>');
        });
    });
}

var query_tipo = L.esri.Tasks.query({

    url: dominio + urlHostSUCons + 'MapServer/4'
});

query_tipo.where("1=1").returnGeometry(false).run(function (error, featureCollection) {
    $.each(featureCollection.features, function (index, value) {
        arraytipos[value.properties.ID_TIPO_CP] = value.properties.NOM_TIPO_CP;
        // console.log(value.properties.ID_TIPO_CP + '">' + value.properties.NOM_TIPO_CP);
        if (value.properties.ID_TIPO_CP != 1) {
            $("#SectTipo").append('<option value="' + value.properties.ID_TIPO_CP + '">' + value.properties.NOM_TIPO_CP + '</option>');
            $("#EditSectTipo").append('<option value="' + value.properties.ID_TIPO_CP + '">' + value.properties.NOM_TIPO_CP + '</option>');
        }
    });
});

for (i = moment().format('YYYY') ; i >= moment().format('YYYY') - 1 ; i--) {
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
    } else if (lyrname == "lyrTotalCentrosPoblados") {
        //   console.log(id);
        lyrTotalCentrosPoblados.eachLayer(function (marker) {
            if (marker.feature.properties.ID_CENTRO_POBLADO == id) {

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
    window[e.type].innerHTML = 'Long:' + e.latlng.lng.toFixed(6) + '   Lat:' + e.latlng.lat.toFixed(6);
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
    /* console.log('prevalue');
     console.log(prevalue);*/
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
    //  console.log(idusuario);
    var datauserjson = '';
    $.ajax({
        url: "../../SitiosUpme/Home/UsrOrgJson?idusuario=" + idusuario,
        dataType: 'json',
        async: false,
        success: function (json) {
            datauserjson = json;
        }
    });
    return datauserjson;
}