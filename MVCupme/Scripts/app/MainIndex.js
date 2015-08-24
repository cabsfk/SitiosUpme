
//Definicion de layers

var LyrMunicipio, FeatureMunicipio, FeatureCentroPoblado, FeatureCentroPobladoEdit, LyrCentroPoblado, lyrAreaCentroPoblado,  lyrCentrosPobladosT, lyrTotalCentrosPoblados;
var lyrCircleCentroPoblado = L.geoJson();
var turfCPDane, turfCPDanemerge, turfCPCircles;


/***************************************
//Definicion de Busquedas
***************************************/
var LyrCentrosPoblados = L.esri.featureLayer(dominio + urlHostSUEdit + 'FeatureServer/0');
var LyrCentrosPoblados_T = L.esri.featureLayer(dominio + urlHostSUEdit + 'FeatureServer/1');

var ServiceDaneFind = L.esri.Tasks.find({
    url: dominio + urlHostDP + 'MapServer'
});

var CentrosPobladoFind = L.esri.Tasks.find({
    url: dominio + urlHostSUCons + 'MapServer'
});

var CentrosPobladoEliFind = L.esri.Tasks.find({
    url: dominio + urlHostSUCons + 'MapServer'
});
var CentrosPobladoActFind = L.esri.Tasks.find({
    url: dominio + urlHostSUEdit + 'MapServer'
});
var CentrosPobladoEditQuery = L.esri.Tasks.query({
    url: dominio + urlHostSUEdit + 'FeatureServer/1'
});
var lyrCentrosPobladosVV_t = L.esri.featureLayer(dominio + urlHostSUEdit + 'FeatureServer/3');

//*****************************************************************

var CPCluster = L.markerClusterGroup({
    disableClusteringAtZoom: 13,
    maxClusterRadius: 60,
    iconCreateFunction: function (cluster) {
        var count = cluster.getChildCount();
        var digits = (count + '').length;
        return new L.DivIcon({
            html: count,
            className: 'cluster digits-' + digits,
            iconSize: null
        });
    }
});

var selAlfMun = function (json,Mpio,Dpto) {
    FeatureMunicipio = json;
    console.log(FeatureMunicipio);
    $("#label_municipio").empty();
    $("#label_municipio").append(FeatureMunicipio.properties.MPIO_CNMBR);
    $("#label_departamento").empty();
    $("#label_departamento").append(FeatureMunicipio.properties.DPTO_CNMBR);
    LyrMunicipio = L.geoJson(json, {
        style: function (feature) {
            return {
                color: '#00FFFC',
                weight: 5,
                opacity: 1,
                fillOpacity: 0.007
            }
        }
    }).addTo(map);
    //map.setMaxBounds(LyrMunicipio.getBounds());
    map.fitBounds(LyrMunicipio.getBounds());
}



function MapearCentroPoblado(Mpio, Dpto) {
    ServiceDaneFind.layers('2');
    ServiceDaneFind.params.layerDefs = "2:MPIO_CCDGO='" + Mpio + "'";
    ServiceDaneFind.text(Dpto).fields('DPTO_CCDGO');

    ServiceDaneFind.run(function (error, featureCollection, response2) {
        if (map.hasLayer(lyrAreaCentroPoblado)) {
            map.removeLayer(lyrAreaCentroPoblado);
        }
        turfCPDane = featureCollection;
        turfCPDanemerge = turf.merge(turfCPDane);
        lyrAreaCentroPoblado = L.geoJson(featureCollection, {
            color: 'gray',
            fillColor: 'gray',
            fillOpacity: 0.3
        }).addTo(map);
    });
    CentrosPobladoFind.layers('0');
    CentrosPobladoFind.params.layerDefs = "0:COD_MPIO='" + Mpio+"'";
    CentrosPobladoFind.text(Dpto).fields('COD_DPTO');
    CentrosPobladoFind.run(function (error, featureCollection, response2) {
        if (map.hasLayer(LyrCentroPoblado)){
            map.removeLayer(LyrCentroPoblado);
        }
        if (map.hasLayer(lyrCircleCentroPoblado)) {
            map.removeLayer(lyrCircleCentroPoblado);
        }
                
        var CP, htmlpopup,clase;
        ordenarGeojson = [];
        $("#TextValCP").show();
        map.removeLayer(CPCluster);
        $("#DivListaCp").empty();
        $("#DivListaCp").append('<div class="btn-group-vertical" role="group" id="ListaCentroPoblados" style="max-height:200px;overflow:scroll;"></div>');
        LyrCentroPoblado = L.geoJson(featureCollection, {
            pointToLayer: function (feature, latlng) {
                var clase, estilo;
                if (feature.properties.ID_FUENTE_CP == 1) { estilo = geojsonMarkerDane; }
                else if (feature.properties.ID_FUENTE_CP == 2) {
                    estilo = geojsonMarkerUpme;
                }
                CP = L.marker(latlng, estilo).bindLabel(feature.properties.NOMBRE_SITIO, { noHide: false, offset: [20, -45] });
                var clase, tipo;
                
                clase = arrayclases[feature.properties.ID_CLASE];
                tipo = arraytipos[feature.properties.ID_TIPO];
                if (typeof tipo === 'undefined') {
                    tipo = '-';
                }
                var FECHA_OFICIALIZACION = (feature.properties.FECHA_OFICIALIZACION == "Null") ? '-' : feature.properties.FECHA_OFICIALIZACION;
                var V_URBANO = (feature.properties.V_URBANO == "Null") ? 0 : feature.properties.V_URBANO;
                var V_RURAL = (feature.properties.V_RURAL == "Null") ? 0 : feature.properties.V_RURAL;
                var VSS_URBANO = (feature.properties.VSS_URBANO == "Null") ? 0 : feature.properties.VSS_URBANO;
                var VSS_RURAL = (feature.properties.VSS_RURAL == "Null") ? 0 : feature.properties.VSS_RURAL;
                var actualizarcp="";
                if (!$("#FormCPPgn1ActVV").hasClass("hide")) {
                    actualizarcp =
                    '<button class="btn btn-info pull-left btn-xs " data-toggle="tooltip" data-placement="rigth" title="Actualizar Viviendas" type="button" onclick="ActualizarViviendas(' + feature.properties.ID_CENTRO_POBLADO + ')">' +
                         '<span class="fa fa-pencil" aria-hidden="true"></span><span class="fa fa-home" aria-hidden="true"></span>' +
                    '</button></center><br/>';
                }
                    
                htmlpopup =
                '<div class="panel panel-primary">' +
                    '<div class="panel-heading">Centro Poblado</div>' +
                        '<div class="popupstyle">' +
                            '<button class="btn btn-primary pull-right btn-xs " data-toggle="tooltip" data-placement="left" title="Acercar" type="button" type="button" onclick="zoomCP(\'' + latlng.lng + '\',\'' + latlng.lat + '\')">' +
                                '<span class="glyphicon glyphicon-zoom-in" aria-hidden="true"></span>' +
                            '</button>' +
                            '<h5><strong  class="primary-font">' + feature.properties.NOMBRE_SITIO + '</strong><br><br>' +
                            '<small>Clase:</small> ' + clase + '<br>' +
                            '<small>Tipo Zona:</small> '+tipo+' <br>' +
                            '<small>Fecha creacion:</small> ' + FECHA_OFICIALIZACION + ' <br>' +
                            '<small>Viviendas Urbanas:</small> ' + V_URBANO + '<br>' +
                            '<small>Viviendas Rurales:</small> ' + V_RURAL + ' <br>' +
                            '<small>Viviendas sin servicio Urbanas:</small> ' + VSS_URBANO + ' <br>' +
                            '<small>Viviendas sin servicio Rurales:</small> ' + VSS_RURAL + '<br>' +
                             actualizarcp +
                        '</div>' +
                    '</div>' + 
                '</div>';
                CP.bindPopup(htmlpopup);
                //ordenarGeojson.push(feature.properties);
                $("#ListaCentroPoblados").prepend('<div class="rowprueba"><button type="button" class="btn btn-default" style=" width: 230px;" onclick="clickmap(' + feature.id + ',\'LyrCentroPoblado\')">' + feature.properties.NOMBRE_SITIO + '</button></div>');
                return CP;
            }
        });

        LyrCentroPoblado.addTo(map);

        var key = "ID_FUENTE_CP";
        var value = "2";

        turfCPCircles = turf.filter(featureCollection, key, value);
        
        lyrCircleCentroPoblado = L.geoJson(turfCPCircles, {
            pointToLayer: function (feature, latlng) {
                return L.circle(latlng, buffetCP,{
                    color: 'gray',
                    fillColor: 'gray',
                    fillOpacity: 0.3
                });
            }
        });
        
        lyrCircleCentroPoblado.addTo(map);
        
        $("#panel_centros_poblados").show(100);
        $(".legend").show(100);
        $('#ListaCentroPoblados').searchable({
            searchField: '#container-search',
            selector: '.rowprueba',
            childSelector: '.btn',
            striped: true,
            show: function (elem) {
                elem.slideDown(100);
            },
            hide: function (elem) {
                elem.slideUp(100);
            },
            clearOnLoad: true
        });
    });
}



$("#cityVV").autocomplete({
    source: function (request, response) {
        $("#BtnBusquedaMunVV").empty().append("<span class='glyphicon glyphicon-repeat'></span>").removeClass("btn-default").addClass("btn-warning");
        ServiceDaneFind.layers('0').text(request.term).fields('MPIO_CNMBRSA,MPIO_CNMBR');
       // ServiceDaneFind.params.layerDefs ="1:CLASE='3'";
        
        ServiceDaneFind.run(function (error, featureCollection, response2) {
            console.log(featureCollection);
            $("#BtnBusquedaMunVV").empty().append("<span class='glyphicon glyphicon-search'></span>").removeClass("btn-warning").addClass("btn-default");
            response($.map(featureCollection.features, function (el) {
                return {
                    label: el.properties.MPIO_CNMBR + " - " + el.properties.DPTO_CNMBR,
                    value: el.properties.MPIO_CNMBR + " - " + el.properties.DPTO_CNMBR,
                    MPIO: el.properties.MPIO_CCDGO,
                    DPTO: el.properties.DPTO_CCDGO,
                    geojson: el
                };
            }));

        });          
    },
    minLength: 3,
    select: function (event, ui) {
        if (map.hasLayer(LyrMunicipio)) {
            map.removeLayer(LyrMunicipio);
        }
        selAlfMun(ui.item.geojson, ui.item.MPIO, ui.item.DPTO);
        MapearCentroPoblado(ui.item.MPIO, ui.item.DPTO);
    },
    open: function () {
        $(this).removeClass("ui-corner-all").addClass("ui-corner-top");
        $(this).addClass("list-group");
    },
    close: function () {
        $(this).removeClass("ui-corner-top").addClass("ui-corner-all");
    }
}).autocomplete("instance")._renderItem = function (ul, item) {
    ul.addClass("list-group");
    ul.addClass("Ancho");
    return $( '<li class="list-group-item ">' )
        .append('<small>' + item.label + '</small>' +
                '</li>').appendTo(ul);     
};

$("#city").autocomplete({
    source: function (request, response) {
        $("#BtnBusquedaMun").empty().append("<span class='glyphicon glyphicon-repeat'></span>").removeClass("btn-default").addClass("btn-warning");
        ServiceDaneFind.layers('0').text(request.term).fields('MPIO_CNMBRSA,MPIO_CNMBR');
        // ServiceDaneFind.params.layerDefs ="1:CLASE='3'";

        ServiceDaneFind.run(function (error, featureCollection, response2) {
            console.log(featureCollection);
            $("#BtnBusquedaMun").empty().append("<span class='glyphicon glyphicon-search'></span>").removeClass("btn-warning").addClass("btn-default");
            response($.map(featureCollection.features, function (el) {
                return {
                    label: el.properties.MPIO_CNMBR + " - " + el.properties.DPTO_CNMBR,
                    value: el.properties.MPIO_CNMBR + " - " + el.properties.DPTO_CNMBR,
                    MPIO: el.properties.MPIO_CCDGO,
                    DPTO: el.properties.DPTO_CCDGO,
                    geojson: el
                };
            }));

        });
    },
    minLength: 3,
    select: function (event, ui) {
        if (map.hasLayer(LyrMunicipio)) {
            map.removeLayer(LyrMunicipio);
        }
        selAlfMun(ui.item.geojson, ui.item.MPIO, ui.item.DPTO);
        MapearCentroPoblado(ui.item.MPIO, ui.item.DPTO);
    },
    open: function () {
        $(this).removeClass("ui-corner-all").addClass("ui-corner-top");
        $(this).addClass("list-group");
    },
    close: function () {
        $(this).removeClass("ui-corner-top").addClass("ui-corner-all");
    }
}).autocomplete("instance")._renderItem = function (ul, item) {
    ul.addClass("list-group");
    ul.addClass("Ancho");
    return $('<li class="list-group-item ">')
        .append('<small>' + item.label + '</small>' +
                '</li>').appendTo(ul);
};

function onMapClick(e) {
    if (map.hasLayer(FeatureCentroPoblado)) {
        map.removeLayer(FeatureCentroPoblado);
    }
    //console.log(e.latlng.lat);
    $("#InpLatitudCP").val(e.latlng.lat);
    $("#InpLongitudCP").val(e.latlng.lng);
    FeatureCentroPoblado = L.marker(e.latlng, { icon: L.AwesomeMarkers.icon({ icon: 'university', prefix: 'fa', markerColor: 'red' }) });
    map.addLayer(FeatureCentroPoblado);
    FunValidarUbi();
    
}

function FunValidarUbi() {
    if ($("#InpLongitudCP").val() != "" || $("#InpLatitudCP").val() != ""){
        var point = turf.point([$("#InpLongitudCP").val(), $("#InpLatitudCP").val()]);
        //console.log('Inside: ' + turf.inside(point, FeatureMunicipio));
        if (map.hasLayer(FeatureCentroPoblado)) {
            map.removeLayer(FeatureCentroPoblado);
        }
    
        FeatureCentroPoblado = new L.Marker([$("#InpLatitudCP").val(), $("#InpLongitudCP").val()], { icon: L.AwesomeMarkers.icon({ icon: 'university', prefix: 'fa', markerColor: 'red' }) });
        map.addLayer(FeatureCentroPoblado);
        

        if (turfCPCircles.features.length != 0) {
            var GjsonbufferCP = turf.buffer(turfCPCircles, buffetCP, 'meters');
            if (turf.inside(point, FeatureMunicipio) && !turf.inside(point, turfCPDanemerge) && !turf.inside(point, GjsonbufferCP.features[0])) {
                $("#PValidaUbi").removeClass("text-danger").addClass("text-success").empty().append("La Ubicacion es Valida");
                $("#Pgn3Sig").removeClass("disabled");
                return true;
            } else {
                $("#PValidaUbi").removeClass("text-success").addClass("text-danger").empty().append("La Ubicacion NO es  Valida");
                $("#Pgn3Sig").addClass("disabled");
                return false;
            }
        } else {
            console.log(point);
            console.log(turfCPDanemerge);
           
            if (turf.inside(point, FeatureMunicipio) && !turf.inside(point, turfCPDanemerge)) {
                $("#PValidaUbi").removeClass("text-danger").addClass("text-success").empty().append("La Ubicacion es Valida");
                $("#Pgn3Sig").removeClass("disabled");
                return true;
            } else {
                $("#PValidaUbi").removeClass("text-success").addClass("text-danger").empty().append("La Ubicacion NO es  Valida");
                $("#Pgn3Sig").addClass("disabled");
                return false;
            }
        }
        
    } else {
           $("#PValidaUbi").removeClass("text-success").addClass("text-danger").empty().append("La Ubicacion NO es  Valida");
           $("#Pgn3Sig").addClass("disabled");
           return false;
    }
}

function EditCentroPoblado(EditUbiCP) {
    BootstrapDialog.show({
        title: 'Confirmar',
        message: '¿Esta Seguro de EDITAR el Centro Poblado?',
        closable: false,
        data: {
            'callback': function (result) {
                if (result) {
                    LyrCentrosPoblados_T.updateFeature(EditUbiCP.features[0], function (error, featureCollection, response2) {
                        //console.log(featureCollection);
                        if (featureCollection.success == true) {
                            MapearCentroPobladoEli();
                            msj_exito("Se EDITO el centro poblado exitosamente!");
                            $("#panel_edicion").hide(100);
                            return true;
                        } else {
                            msj_peligro("NO SE REALIZO LA CREACION CON EXITO, REVISE EL SERVIDOR DE MAPAS !");
                            return false;
                        }
                    });
                }
            }
        },
        buttons: [{
            label: 'Cancelar',
            cssClass: 'btn-default',
            action: function (dialog) {
                typeof dialog.getData('callback') === 'function' && dialog.getData('callback')(false);
                dialog.close();
            }
        }, {
            label: 'OK',
            cssClass: 'btn-primary',
            action: function (dialog) {
                typeof dialog.getData('callback') === 'function' && dialog.getData('callback')(true);
                dialog.close();
            }
        }]
    });

}
function CrearCentroPoblado(UbiCP) {
    BootstrapDialog.show({
        title: 'Confirmar',
        message: '¿Esta Seguro de CREAR el Centro Poblado?',
        closable: false,
        data: {
            'callback': function (result) {
                if (result) {
                    LyrCentrosPoblados_T.addFeature(UbiCP, function (error, featureCollection, response2) {
                        //console.log(featureCollection);
                        if (featureCollection.success == true) {
                            msj_exito("Se CREO el centro poblado exitosamente!");
                            $("#FormCPPgn4").addClass("hide");
                            $("#FormCPPgn5").removeClass("hide");
                            return true;
                        } else {
                            msj_peligro("NO SE REALIZO LA CREACION CON EXITO, REVISE EL SERVIDOR DE MAPAS !");
                            return false;
                        }
                    });
                }
            }
        },
        buttons: [{
            label: 'Cancelar',
            cssClass: 'btn-default',
            action: function (dialog) {
                typeof dialog.getData('callback') === 'function' && dialog.getData('callback')(false);
                dialog.close();
            }
        }, {
            label: 'OK',
            cssClass: 'btn-primary',
            action: function (dialog) {
                typeof dialog.getData('callback') === 'function' && dialog.getData('callback')(true);
                dialog.close();
            }
        }]
    });
}


function CrearFeature() {
    var UbiCP = FeatureCentroPoblado.toGeoJSON();
    UbiCP.properties.ID_CENTRO_POBLADO = 7;
    UbiCP.properties.COD_CP_UPME = 7;
    UbiCP.properties.COD_DPTO = FeatureMunicipio.properties.DPTO_CCDGO;
    UbiCP.properties.COD_MPIO = FeatureMunicipio.properties.MPIO_CCDGO;
    UbiCP.properties.COD_SITIO = 7;
    UbiCP.properties.ID_USUARIO_CREACION = id_user;// ID USUARIO TEMPORAL PARA PRUEBAS OPERADOR
    UbiCP.properties.ID_FUENTE_CP = 2;// 2 PARA LA FUENTE UPME
    UbiCP.properties.APROBADO = 0;/// 0 SI NO ES APROBADO 1 SI SI ESTA APROBADO
    UbiCP.properties.NOMBRE_SITIO = $("#InpNomCP").val().toUpperCase();
    UbiCP.properties.ID_TIPO = $("#SecTipoZona").val();
    UbiCP.properties.ID_CLASE = $("#SectCategoriaCP").val();
    UbiCP.properties.FECHA_CREACION = moment().format('DD/MM/YYYY h:mm:ss a');//Number(moment().format('X'));
    UbiCP.properties.VIVIENDAS_URBANAS = $("#InpViviendasU").val() == '' ? 0 : $("#InpViviendasU").val();
    UbiCP.properties.VIVIENDAS_RURALES = $("#InpViviendasR").val() == '' ? 0 : $("#InpViviendasR").val();
    UbiCP.properties.VSS_URBANAS = $("#InpViviendasSSU").val() == '' ? 0 : $("#InpViviendasSSU").val();
    UbiCP.properties.VSS_RURALES = $("#InpViviendasSSR").val() == '' ? 0 : $("#InpViviendasSSR").val();
    UbiCP.properties.OBSERVACION = $("#InpObservacion").val();
    UbiCP.properties.LONGITUD = UbiCP.geometry.coordinates[0];
    UbiCP.properties.LATITUD = UbiCP.geometry.coordinates[1];
    UbiCP.properties.LATITUD = UbiCP.geometry.coordinates[1];
    UbiCP.properties.VIGENCIA = parseInt($("#SecVigenciaAnio").val() + $("#SecVigenciaMes").val());
    CrearCentroPoblado(UbiCP);
}



function ValidarFeature(prevalue) {
    if (prevalue != 'Act') {
        if (!$("#" + prevalue + "InpNomCP").val()) {
            msj_peligro("Por favor ingrese el nombre del centro poblado");
            $("#" + prevalue + "InpNomCP").focus();
            return false;
        } else if ($("#" + prevalue + "SectCategoriaCP").val() == "") {
            msj_peligro("Por favor seleccione una Categoria");
            $("#" + prevalue + "SectCategoriaCP").focus();
            return false;
        }
    }

    if ($("#" + prevalue + "SecVigenciaMes").val() == "") {
        msj_peligro("Por favor seleccione el Mes");
        $("#" + prevalue + "SecVigenciaMes").focus();
        return false;
    }
    if ($("#" + prevalue + "SecVigenciaAnio").val() == "") {
        msj_peligro("Por favor seleccione el Año");
        $("#" + prevalue + "SecVigenciaAnio").focus();
        return false;
    }

    if ($("#" + prevalue + "SecTipoZona").val() == "") {
        msj_peligro("Por favor seleccione el tipo de zona");
        $("#" + prevalue + "SecTipoZona").focus();
        return false;
    } else if ($("#" + prevalue + "SecTipoZona").val() == '1') {
        if (!$("#" + prevalue + "InpViviendasU").val()) {
            msj_peligro("Por favor ingrese el numero total de viviendas urbanas");
            $("#" + prevalue + "InpViviendasU").focus();
            return false;
        }
        else if (!$("#" + prevalue + "InpViviendasSSU").val()) {
            msj_peligro("Por favor ingrese el numero de viviendas urbanas sin servicio");
            $("#" + prevalue + "InpViviendasSSU").focus();
            return false;
        } else if (parseInt($("#" + prevalue + "InpViviendasSSU").val()) > parseInt($("#" + prevalue + "InpViviendasU").val())) {
            msj_peligro("El numero de viviendas sin servicio debe ser menor al total de viviendas");
            $("#" + prevalue + "InpViviendasSSU").focus();
            return false;
        }else {
            $("#" + prevalue + "InpViviendasR").val("");
            $("#" + prevalue + "InpViviendasSSR").val("");
        }
    } else if ($("#" + prevalue + "SecTipoZona").val() == '2') {
        if (!$("#" + prevalue + "InpViviendasR").val()) {
            msj_peligro("Por favor ingrese el numero total de viviendas rurales");
            $("#" + prevalue + "InpViviendasR").focus();
            return false;
        }
        else if (!$("#" + prevalue + "InpViviendasSSR").val()) {
            msj_peligro("Por favor ingrese el numero de viviendas rurales sin servicio");
            $("#" + prevalue + "InpViviendasSSR").focus();
            return false;
        } else if (parseInt($("#" + prevalue + "InpViviendasSSR").val()) > parseInt($("#" + prevalue + "InpViviendasR").val())) {
            msj_peligro("El numero de viviendas sin servicio debe ser menor al total de viviendas");
            $("#" + prevalue + "InpViviendasSSR").focus();
            return false;
        } else {
            $("#" + prevalue + "InpViviendasU").val("");
            $("#" + prevalue + "InpViviendasSSU").val("");
        }

    } else if ($("#" + prevalue + "SecTipoZona").val() == '3') {
        if (!$("#" + prevalue + "InpViviendasU").val()) {
            msj_peligro("Por favor ingrese el numero total de viviendas urbanas");
            $("#" + prevalue + "InpViviendasU").focus();
            return false;
        }
        if (!$("#" + prevalue + "InpViviendasSSU").val()) {
            msj_peligro("Por favor ingrese el numero de viviendas urbanas sin servicio");
            $("#" + prevalue + "InpViviendasSSU").focus();
            return false;
        }
        if (!$("#" + prevalue + "InpViviendasR").val()) {
            msj_peligro("Por favor ingrese el numero total de viviendas rurales");
            $("#" + prevalue + "InpViviendasR").focus();
            return false;
        }
        if (!$("#" + prevalue + "InpViviendasSSR").val()) {
            msj_peligro("Por favor ingrese el numero de viviendas rurales sin servicio");
            $("#" + prevalue + "InpViviendasSSR").focus();
            return false;
        }
        if (parseInt($("#" + prevalue + "InpViviendasSSR").val()) > parseInt($("#" + prevalue + "InpViviendasR").val())) {
            msj_peligro("El numero de viviendas sin servicio debe ser menor al total de viviendas");
            $("#" + prevalue + "InpViviendasSSR").focus();
            return false;
        }
        if (parseInt($("#" + prevalue + "InpViviendasSSU").val()) > parseInt($("#" + prevalue + "InpViviendasU").val())) {
            msj_peligro("El numero de viviendas sin servicio debe ser menor al total de viviendas");
            $("#" + prevalue + "InpViviendasSSU").focus();
            return false;
        }

    }
    return true;
}




function TipoZona(valor,pretext) {
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

$("#panel_centros_poblados").hide();
$("#panel_edicion").hide();
$("#TextValCP").hide();

$("input[name='ExisteCP']:radio").change(function () {

    if ($(this).val() == "NO") {
        $("#Pgn2Sig").removeClass("disabled");
    } else {
        $("#Pgn2Sig").addClass("disabled");
    }
});

$("#SecTipoZona").change(function () {
    TipoZona($(this).val(), "");
});


$("#EditSecTipoZona").change(function () {
    TipoZona($(this).val(), "Edit");
});
/*
Fuciona de borrar elemento
*/
function CancelarEliminacion() {
    LimpiarBorrado();
    
    $("#FormCPPgn0").removeClass("hide");
    $("#FormCPPgn1Eli").addClass("hide");
}

function BorrarCentroPoblado(id) {
    BootstrapDialog.show({
        title: 'Confirmar',
        message: '¿Esta Seguro de eliminar el Centro Poblado?',
        closable: false,
        data: {
            'callback': function (result) {
                            if (result) {
                                LyrCentrosPoblados_T.deleteFeature(id, function (error, featureCollection, response2) {
                                    //console.log(featureCollection);
                                    if (featureCollection.success == true) {
                                        MapearCentroPobladoEli();
                                        msj_exito("Se ELIMINO el centro poblado exitosamente!");
                                        return true;
                                    } else {
                                        msj_peligro("NO SE REALIZO LA CREACION CON EXITO, REVISE EL SERVIDOR DE MAPAS !");
                                        return false;
                                    }
                                });
                            }
                        }
        },
        buttons: [{
            label: 'Cancelar',
            cssClass: 'btn-default',
            action: function (dialog) {
                typeof dialog.getData('callback') === 'function' && dialog.getData('callback')(false);
                dialog.close();
            }
        }, {
            label: 'OK',
            cssClass: 'btn-primary',
            action: function (dialog) {
                typeof dialog.getData('callback') === 'function' && dialog.getData('callback')(true);
                dialog.close();
            }
        }]
    });
    
}
map.on('popupopen', function (e) {
    $('[data-toggle="tooltip"]').tooltip();
});

map.on('popupclose', function (e) {
    $("#panel_edicion").hide();
});

function LimpiarBorrado() {
    if (map.hasLayer(lyrCentrosPobladosT)){
        map.removeLayer(lyrCentrosPobladosT);
    }
    $("#DivListaCpEdit").empty();
    $("#DivListaCpEdit").append('<div class="btn-group-vertical" role="group" id="ListaCentroPobladosEli" style="max-height:200px;overflow:scroll;"></div>');
}


function ActualizarViviendas(ID_CENTRO_POBLADO) {
    CentrosPobladoFind.layers('0');
    CentrosPobladoFind.params.layerDefs = "";
    CentrosPobladoFind.text(ID_CENTRO_POBLADO).fields('ID_CENTRO_POBLADO');
    CentrosPobladoFind.run(function (error, featureCollection, response2) {

        var $textAndPic = $('<div ></div>');
        $textAndPic.append('<form">' +
            '<div class="col-xs-12">'+
                     '<div class="panel panel-default">'+
                       '<div class="panel-body">'+
                            '<div class="form-group">'+
                                '<h5><center>Vigencia de información</center></h5>'+
                                '<div class="col-xs-6">'+
                                    '<label for="ActSecVigenciaMes">Mes</label>' +
                                    '<select class="form-control" id="ActSecVigenciaMes">'+
                                        '<option value="" selected></option>'+
                                        '<option value="01">1</option>'+
                                        '<option value="02">2</option>'+
                                        '<option value="03">3</option>'+
                                        '<option value="04">4</option>'+
                                        '<option value="05">5</option>'+
                                        '<option value="06">6</option>'+
                                        '<option value="07">7</option>'+
                                        '<option value="08">8</option>'+
                                        '<option value="09">9</option>'+
                                        '<option value="10">10</option>'+
                                        '<option value="11">12</option>'+
                                    '</select>'+
                                '</div>'+
                                '<div class="col-xs-6">'+
                                    '<label for="ActSecVigenciaAnio">Año</label>' +
                                    '<select class="form-control" id="ActSecVigenciaAnio">' +
                                        '<option value="" selected></option>'+
                                    '</select>'+
                                    '</div>'+
                                    '</div>'+
                                '</div>'+
                            '</div>'+
                    '<div class="form-group">' +
                        '<label for="ActSecTipoZona">Seleccione la Tipo Zona:</label>' +
                        '<select class="form-control" id="ActSecTipoZona">' +
                            '<option value=""></option>' +
                        '</select>' +
                    '</div>' +
                    '<div class="form-group hide" id="ActFormInpViviendasU">' +
                        '<label for="ActInpViviendasU">Ingrese el total de viviendas URBANAS:</label>' +
                        '<Input type="number" class="form-control" id="ActInpViviendasU" onkeypress="if (event.keyCode< 48 || event.keyCode > 57) event.returnValue = false;" placeholder="">' +
                    '</div>' +
                    '<div class="form-group hide" id="ActFormInpViviendasSSU">' +
                        '<label for="ActInpViviendasSSU">Ingrese el total de viviendas sin servicio URBANAS:</label>' +
                        '<Input type="number" class="form-control" id="ActInpViviendasSSU" onkeypress="if (event.keyCode< 48 || event.keyCode > 57) event.returnValue = false;" placeholder="">' +
                    '</div>' +
                    '<div class="form-group hide" id="ActFormInpViviendasR">' +
                        '<label for="ActInpViviendasR">Ingrese el total de viviendas RURAL:</label>' +
                        '<Input type="number" class="form-control" id="ActInpViviendasR" onkeypress="if (event.keyCode< 48 || event.keyCode > 57) event.returnValue = false;" placeholder="">' +
                    '</div>' +
                    '<div class="form-group hide " id="ActFormInpViviendasSSR">' +
                        '<label for="ActInpViviendasSSR">Ingrese el total de viviendas sin servicio RURAL:</label>' +
                        '<Input type="number" class="form-control" id="ActInpViviendasSSR" onkeypress="if (event.keyCode< 48 || event.keyCode > 57) event.returnValue = false;" placeholder=" ">' +
                    '</div>'+
                    '<div class="form-group  " id="ActFormInpObservacion">' +
                        '<label for="ActInpObservacion">Observación:</label>' +
                        '<textarea class="form-control" id="ActInpObservacion" placeholder=""></textarea>'+
                    '</div></form>');

        

        BootstrapDialog.show({
            title: 'Actualizacion De viviendas',
            message: $textAndPic,
            closable: false,
            size: BootstrapDialog.SIZE_SMALL,
            data: {
                'callback': function (result) {
                    if (result) {

                        
                        /*LyrCentrosPoblados_T.deleteFeature(id, function (error, featureCollection, response2) {
                            //console.log(featureCollection);
                            if (featureCollection.success == true) {
                                MapearCentroPobladoEli();
                                msj_exito("Se ELIMINO el centro poblado exitosamente!");
                                return true;
                            } else {
                                msj_peligro("NO SE REALIZO LA CREACION CON EXITO, REVISE EL SERVIDOR DE MAPAS !");
                                return false;
                            }
                        });*/
                    }
                }
            },
            onshown: function (dialogRef) {
                query_tipo.where("1=1").returnGeometry(false).run(function (error, featureCollection) {
                     $.each(featureCollection.features, function (index, value) {
                         $("#ActSecTipoZona").append('<option value="' + value.properties.ID + '">' + value.properties.DESCRIPCION + '</option>');

                    });
                });
                $("#ActSecTipoZona").change(function () {
                    TipoZona($(this).val(), "Act");
                });
                $("#ActSecTipoZona").change(function () {
                    TipoZona($(this).val(), "Act");
                });
                for (i = moment().format('YYYY') ; i >= 1990 ; i--) {
                    $("#ActSecVigenciaAnio").append('<option value="' + i + '">' + i + '</option>');
                }

            },
            buttons: [{
                label: 'Cancelar',
                cssClass: 'btn-default',
                action: function (dialog) {
                    typeof dialog.getData('callback') === 'function' && dialog.getData('callback')(false);
                    dialog.close();
                }
            }, {
                label: 'OK',
                cssClass: 'btn-primary',
                action: function (dialog) {
                    typeof dialog.getData('callback') === 'function' && dialog.getData('callback')(true);
                    if (ValidarFeature("Act")) {
                        //alert("Valido");
                        if ($("#ActInpViviendasU").val() == "") { $("#ActInpViviendasU").val("0")}
                        if ($("#ActInpViviendasR").val() == "") { $("#ActInpViviendasR").val("0") }
                        if ($("#ActInpViviendasSSU").val() == "") { $("#ActInpViviendasSSU").val("0") }
                        if ($("#ActInpViviendasSSR").val() == "") { $("#ActInpViviendasSSR").val("0") }
                        

                        var JSONVV = new Object();
                        JSONVV.properties = new Object();
                        JSONVV.properties.ID_VSS = 0;
                        JSONVV.properties.VIGENCIA = parseInt($("#ActSecVigenciaAnio").val() + $("#ActSecVigenciaMes").val());
                        JSONVV.properties.ID_CENTRO_POBLADO = ID_CENTRO_POBLADO;
                        JSONVV.properties.V_TOTAL = parseInt($("#ActInpViviendasU").val()) + parseInt($("#ActInpViviendasR").val());
                        JSONVV.properties.V_URBANO = $("#ActInpViviendasU").val();
                        JSONVV.properties.V_RURAL = $("#ActInpViviendasR").val();
                        JSONVV.properties.VSS_TOTAL = parseInt($("#ActInpViviendasSSU").val()) + parseInt($("#ActInpViviendasSSR").val());
                        JSONVV.properties.VSS_URBANO = $("#ActInpViviendasSSU").val();
                        JSONVV.properties.VSS_RURAL = $("#ActInpViviendasSSR").val();
                        JSONVV.properties.FECHA_REGISTRO = moment().format('DD/MM/YYYY h:mm:ss a');
                        JSONVV.properties.ID_USUARIO_REGISTRO = id_user;
                        JSONVV.properties.ID_USUARIO_ACTUALIZACION = 0;
                        JSONVV.properties.OBSERVACION = $("#ActInpObservacion").val();;
                        
                        JSONVV.type = new Object();
                        JSONVV.type = "Feature";
                        console.log(JSONVV);

                        lyrCentrosPobladosVV_t.addFeature(JSONVV, function (error, featureCollectionVV) {
                            //console.log()
                            if (featureCollectionVV.success == true) {
                                /*MapearCentroPobladoEli();
                                MapearCentroPobladoTotal();*/
                                msj_exito("Se actualizo extitosamente el numero de viviendas!");
                                dialog.close();
                                return true;
                            } else {
                                msj_peligro("NO SE REALIZO LA CREACION CON EXITO, REVISE EL SERVIDOR DE MAPAS !");
                                return false;
                            }
                            
                        });
                                              
                    }
                    
                }
            }]
        });
    });
}

function EditFeature() {
    var EditUbiCP = FeatureCentroPobladoEdit;
    console.log(FeatureCentroPobladoEdit);
    EditUbiCP.features[0].properties.NOMBRE_SITIO = $("#EditInpNomCP").val().toUpperCase();
    EditUbiCP.features[0].properties.ID_TIPO = $("#EditSecTipoZona").val();
    EditUbiCP.features[0].properties.ID_CLASE = $("#EditSectCategoriaCP").val();
    EditUbiCP.features[0].properties.FECHA_CREACION = moment().format('DD/MM/YYYY h:mm:ss a');//Number(moment().format('X'));
    EditUbiCP.features[0].properties.VIVIENDAS_URBANAS = $("#EditInpViviendasU").val() == '' ? 0 : $("#EditInpViviendasU").val();
    EditUbiCP.features[0].properties.VIVIENDAS_RURALES = $("#EditInpViviendasR").val() == '' ? 0 : $("#EditInpViviendasR").val();
    EditUbiCP.features[0].properties.VSS_URBANAS = $("#EditInpViviendasSSU").val() == '' ? 0 : $("#EditInpViviendasSSU").val();
    EditUbiCP.features[0].properties.VSS_RURALES = $("#EditInpViviendasSSR").val() == '' ? 0 : $("#EditInpViviendasSSR").val();
    EditUbiCP.features[0].properties.OBSERVACION = $("#EditInpObservacion").val();
    EditUbiCP.features[0].properties.VIGENCIA = parseInt($("#EditSecVigenciaAnio").val() + $("#EditSecVigenciaMes").val());
    EditUbiCP.features[0].properties.LONGITUD = EditUbiCP.features[0].geometry.coordinates[0];
    EditUbiCP.features[0].properties.LATITUD = EditUbiCP.features[0].geometry.coordinates[1];
    EditCentroPoblado(EditUbiCP);
}


function SaveFeature(){
    if(ValidarFeature("Edit")){
        EditFeature();
    }
}
function EditarCentroPoblado(id_feature) {
  
    $("#panel_edicion").show(100);  
    CentrosPobladoEditQuery.featureIds(id_feature).run(function (error, featureCollection, response2) {
        FeatureCentroPobladoEdit = featureCollection;
        
        var tempmes=featureCollection.features[0].properties.VIGENCIA.toString().substring(4, 6);
        var tempanio=featureCollection.features[0].properties.VIGENCIA.toString().substring(0, 4);
        $("#EditInpNomCP").val(featureCollection.features[0].properties.NOMBRE_SITIO);
        $("#EditSectCategoriaCP").val(featureCollection.features[0].properties.ID_CLASE);
        $("#EditSecVigenciaMes").val(tempmes);
        $("#EditSecVigenciaAnio").val(tempanio);
        $("#EditSecTipoZona").val(featureCollection.features[0].properties.ID_TIPO);        
        TipoZona(featureCollection.features[0].properties.ID_TIPO, "Edit")
        $("#EditInpViviendasU").val(featureCollection.features[0].properties.VIVIENDAS_URBANAS);
        $("#EditInpViviendasR").val(featureCollection.features[0].properties.VIVIENDAS_RURALES);
        $("#EditInpViviendasSSU").val(featureCollection.features[0].properties.VSS_URBANAS);
        $("#EditInpViviendasSSR").val(featureCollection.features[0].properties.VSS_RURALES);
        $("#EditInpObservacion").val(featureCollection.features[0].properties.OBSERVACION);
    });
}

function MapearCentroPobladoEli() {

    CentrosPobladoEliFind.layers('1');
    CentrosPobladoEliFind.params.layerDefs = "1:APROBADO=0";
    CentrosPobladoEliFind.text(id_user).fields('ID_USUARIO_CREACION');
    
    
    CentrosPobladoEliFind.run(function (error, featureCollection, response2) {
        
        var CP, htmlpopup, clase;
        LimpiarBorrado();
        lyrCentrosPobladosT = L.geoJson(featureCollection, {
            pointToLayer: function (feature, latlng) {
                CP = L.marker(latlng, geojsonMarkerSinAprobar).bindLabel(feature.properties.NOMBRE_SITIO, { noHide: false, offset: [20, -45] });
                var clase,tipo;
                clase = arrayclases[feature.properties.ID_CLASE];
                tipo = arraytipos[feature.properties.ID_TIPO];

                htmlpopup =
                '<div class="panel panel-primary">' +
                    '<div class="panel-heading">Centro Poblado</div>' +
                        '<div class="popupstyle">' +
                            '<button class="btn btn-primary pull-right btn-xs " data-toggle="tooltip" data-placement="left" title="Acercar" type="button" onclick="zoomCP(\'' + latlng.lng + '\',\'' + latlng.lat + '\')">' +
                                '<span class="glyphicon glyphicon-zoom-in" aria-hidden="true"></span>' +
                            '</button>' +
                            '<h5> <strong>' + feature.properties.NOMBRE_SITIO + '</strong><br> '
                            + feature.properties.MPIO_CNMBR + ', ' + feature.properties.DPTO_CNMBR + '.<hr>' +
                            '<small>Clase:</small> ' + clase + '<br>' +
                            '<small>Tipo Zona:</small> ' + tipo + '<br>' +
                            '<small>Viviendas Urbanas:</small> ' + feature.properties.VIVIENDAS_URBANAS + '<br>' +
                            '<small>Viviendas Rurales:</small> ' + feature.properties.VIVIENDAS_RURALES + '<br>' +
                            '<small>Viviendas sin servicio Urbanas:</small> ' + feature.properties.VSS_URBANAS + '<br>' +
                            '<small>Viviendas sin servicio Rurales:</small> ' + feature.properties.VSS_RURALES + '<br>' +
                            '<small>Fecha Creación:</small> ' + feature.properties.FECHA_CREACION + '<br>' +
                            '<small>Observacion:</small> ' + feature.properties.OBSERVACION + '<br><br>' +
                            '<button class="btn btn-info pull-left btn-xs " data-toggle="tooltip" data-placement="rigth" title="Editar" type="button" onclick="EditarCentroPoblado(' + feature.properties.OBJECTID + ')">' +
                                '<span class="glyphicon glyphicon-edit" aria-hidden="true"></span>' +
                            '</button></center>' +
                            '<button class="btn btn-danger pull-right btn-xs " data-toggle="tooltip" data-placement="left" title="Borrar" type="button" onclick="BorrarCentroPoblado(' + feature.properties.OBJECTID + ')">' +
                                '<span class="glyphicon glyphicon-ban-circle" aria-hidden="true"></span> ' +
                            '</button></h5><br>' +
                        '</div>' +                        
                    '</div>' +
                '</div>';
                CP.bindPopup(htmlpopup);
                
                $("#ListaCentroPobladosEli").prepend('<div class="rowprueba"><button type="button"  class="btn btn-default" style=" width: 230px;" onclick="clickmap(' + feature.properties.OBJECTID + ',\'lyrCentrosPobladosT\')">' + feature.properties.NOMBRE_SITIO + '</button></div>');
                return CP;
            }
        });

        lyrCentrosPobladosT.addTo(map);
        // console.log(ordenarGeojson);
        $('#ListaCentroPobladosEli').searchable({
            searchField: '#container-search-CPELI',
            selector: '.rowprueba',
            childSelector: '.btn',
            show: function (elem) {
                elem.slideDown(100);
            },
            hide: function (elem) {
                elem.slideUp(100);
            }
        });
       
    });
}
function CancelEditFeature() {
    $("#panel_edicion").hide();
}


function BorrarActualizacion(id) {
    BootstrapDialog.show({
        title: 'Confirmar',
        message: '¿Esta Seguro de que desea borrar la actualización?',
        closable: false,
        data: {
            'callback': function (result) {
                if (result) {
                    lyrCentrosPobladosVV_t.deleteFeature(id, function (error, featureCollection, response2) {
                        //console.log(featureCollection);
                        if (featureCollection.success == true) {
                            MapearCentroPobladoAct();
                            msj_exito("Se ELIMINO exitosamente la actualización!");
                            return true;
                        } else {
                            msj_peligro("NO SE REALIZO EL PROCESO CON EXITO, REVISE EL SERVIDOR DE MAPAS!");
                            return false;
                        }
                    });
                }
            }
        },
        buttons: [{
            label: 'Cancelar',
            cssClass: 'btn-default',
            action: function (dialog) {
                typeof dialog.getData('callback') === 'function' && dialog.getData('callback')(false);
                dialog.close();
            }
        }, {
            label: 'OK',
            cssClass: 'btn-primary',
            action: function (dialog) {
                typeof dialog.getData('callback') === 'function' && dialog.getData('callback')(true);
                dialog.close();
            }
        }]
    });

}
function MapearCentroPobladoAct() {
    
    var query_actualizaciones = L.esri.Tasks.query({
        url: dominio + urlHostSUEdit + 'MapServer/3'
    });
    $("#DivListaCpAct").empty();
    $("#DivListaCpAct").append('<div id="ListaCpAct" style="max-height:300px;overflow:scroll;"><ul class="chat"></ul></div>');
    var contador=0,totalfeatures=0;
    query_actualizaciones.where("ESTADO=0").returnGeometry(false).run(function (error, featureCollection) {
        console.log(featureCollection);
        $.each(featureCollection.features, function (index, value) {
            //console.log(value.properties.ID_CENTRO_POBLADO);
            totalfeatures=featureCollection.features.length;
            CentrosPobladoFind.layers('0');
            CentrosPobladoFind.params.layerDefs = "";
            CentrosPobladoFind.text(value.properties.ID_CENTRO_POBLADO).fields('ID_CENTRO_POBLADO');
            CentrosPobladoFind.run(function (error, featureCollectionTemp, response2) {
                //console.log(featureCollectionTemp);
                var vigencia = value.properties.VIGENCIA.toString();
                $("#ListaCpAct .chat").prepend(
                        '<li class="left" onclick="clickmap(' + value.properties.ID_CENTRO_POBLADO + ',\'lyrTotalCentrosPoblados\')">' +
                                   '<div class="clearfix">' +
                                       '<h5>' +
                                           '<strong class="primary-font">' + featureCollectionTemp.features[0].properties.NOMBRE_SITIO + '</strong>,<br> '
                                           + featureCollectionTemp.features[0].properties.MPIO_CNMBR + ', ' + featureCollectionTemp.features[0].properties.DPTO_CNMBR + '.<br>' +
                                           'Vigencia: ' + vigencia.substring(4, 6) + '-' + vigencia.substring(0, 4) +
                                           '<br>Total: ' + value.properties.V_TOTAL +
                                           '<br>Urbanas: ' + value.properties.V_URBANO +
                                           '<br>Rurales: ' + value.properties.V_RURAL +
                                           '<br>Sin servicio: ' + value.properties.VSS_TOTAL +
                                           '<br>Sin servicio urbanas: ' + value.properties.VSS_URBANO +
                                           '<br>Sin servicio rurales:' + value.properties.VSS_RURAL +
                                           '<br>Observación: ' + value.properties.OBSERVACION +
                                           '<br>' +
                                            '<button class="btn btn-danger pull-right btn-xs " data-toggle="tooltip" data-placement="left" title="Borrar" type="button" onclick="BorrarActualizacion(' + value.properties.OBJECTID + ')">' +
                                                '<span class="glyphicon glyphicon-ban-circle" aria-hidden="true"></span> ' +
                                            '</button></h5><br>' +
                                             '</h5>' +

                                   '</div>' +
                               '</li>'
                       );
                contador++;
                if(totalfeatures==contador){
                    $('#ListaCpAct').searchable({
                        searchField: '#container-search-CPACT',
                        selector: 'li',
                        childSelector: '.clearfix',
                        show: function (elem) {
                            elem.slideDown(100);
                        },
                        hide: function (elem) {
                            elem.slideUp(100);
                        }
                    });
                }
            });
           
        });
    });
}


/*******************************************
NAVEGACION EN EL PANEL
*******************************************/
$("#CrearCP").click(function () {
    $("#FormCPPgn0").addClass("hide");
    $("#FormCPPgn1").removeClass("hide");
});
$("#EliminarCP").click(function () {
    MapearCentroPobladoEli();
    $(".legend").show();
    $("#FormCPPgn0").addClass("hide");
    $("#FormCPPgn1Eli").removeClass("hide");
});

$("#MisActualizarVV").click(function () {
    MapearCentroPobladoAct();
    $(".legend").show();
    $("#FormCPPgn0").addClass("hide");
    $("#FormCPPgn2ActVV").removeClass("hide");
});
$("#ActualizarVV").click(function () {
    //MapearCentroPobladoEli();
    $(".legend").show();
    $("#FormCPPgn0").addClass("hide");
    $("#FormCPPgn1ActVV").removeClass("hide");
});

$("#Pgn1Ant").click(function () {
    $("#FormCPPgn1").addClass("hide");
    $("#FormCPPgn0").removeClass("hide");

});

$("#Pgn1Sig").click(function () {
    $("#FormCPPgn1").addClass("hide");
    $("#FormCPPgn2").removeClass("hide");
});

$("#Pgn2Ant").click(function () {
    $("#FormCPPgn2").addClass("hide");
    $("#FormCPPgn1").removeClass("hide");

});
$("#Pgn2Sig").click(function () {
    if (!$("#Pgn2Sig").hasClass("disabled")) {
        $("#FormCPPgn2").addClass("hide");
        $("#FormCPPgn3").removeClass("hide");
        if (map.hasLayer(LyrMunicipio)) {
            LyrMunicipio.on('click', onMapClick);
        }
    }
});
$("#Pgn3Ant").click(function () {
    $("#FormCPPgn3").addClass("hide");
    $("#FormCPPgn2").removeClass("hide");
    if (map.hasLayer(LyrMunicipio)) {
        LyrMunicipio.off('click', onMapClick);
    }
});

$("#Pgn3Sig").click(function () {
    if (!$("#Pgn3Sig").hasClass("disabled")) {
        if (FunValidarUbi()) {
            $("#FormCPPgn3").addClass("hide");
            $("#FormCPPgn4").removeClass("hide");
            if (map.hasLayer(LyrMunicipio)) {
                LyrMunicipio.off('click', onMapClick);
            }
        }
    }
});

$("#Pgn4Ant").click(function () {
    $("#FormCPPgn4").addClass("hide");
    $("#FormCPPgn3").removeClass("hide");
    if (map.hasLayer(LyrMunicipio)) {
        LyrMunicipio.on('click', onMapClick);
    }
});

$("#Pgn4Sig").click(function () {
    if(ValidarFeature("")){
        CrearFeature("");
    }    
});

$("#BtnreiniciarCreacion").click(function () {
    CancelarCrear();
});

function CancelarCrear() {
      
    if (map.hasLayer(FeatureCentroPoblado)) {
        map.removeLayer(FeatureCentroPoblado);
    }
    if (map.hasLayer(LyrCentroPoblado)) {
        map.removeLayer(LyrCentroPoblado);
    }
    if (map.hasLayer(LyrMunicipio)) {
        map.removeLayer(LyrMunicipio);
    }
    if (map.hasLayer(FeatureMunicipio)) {
        map.removeLayer(FeatureMunicipio);
    }
    map.setView([4.12521648, -74.5020], 5);
    if(!map.hasLayer(CPCluster)){
        map.addLayer(CPCluster);
    }

    if (map.hasLayer(lyrAreaCentroPoblado)) {
        map.removeLayer(lyrAreaCentroPoblado);
    }
    $("#Pgn2Sig").addClass("disabled");
    $("#Pgn3Sig").addClass("disabled");
    $("#TextValCP").hide();
    $("#panel_edicion").hide(100);
    $("#city").val("");
    $("#DivListaCpAct").empty();
    $("#panel_centros_poblados").hide(100);
    $("#InpLatitudCP").val("");
    $("#InpLongitudCP").val("");
    $("#PValidaUbi").empty();
    $("#InpNomCP").val("");
    $("#SectCategoriaCP").val("");
    $("#SecTipoZona").val("");
    $("#InpViviendasU").val("");
    $("#InpViviendasR").val("");
    $("#InpViviendasSSU").val("");
    $("#InpViviendasSSR").val("");
    $("#InpObservacion").val("");
    $("#FormCPPgn0").removeClass("hide");
    $("#FormCPPgn1").addClass("hide");
    $("#FormCPPgn2").addClass("hide");
    $("#FormCPPgn3").addClass("hide");
    $("#FormCPPgn4").addClass("hide");
    $("#FormCPPgn5").addClass("hide");
    $("#FormCPPgn1ActVV").addClass("hide");
    $("#ListaCentroPoblados").empty();
    $("#panel_centros_poblados").hide();
    $("#FormInpViviendasU").addClass('hide');
    $("#FormInpViviendasR").addClass('hide');
    $("#FormInpViviendasSSU").addClass('hide');
    
    $("#FormCPPgn2ActVV").addClass("hide");
    $("#FormInpViviendasSSR").addClass('hide');
}


/*
Mapear Todos los Centro poblado
*/
function MapearCentroPobladoTotal() {

    CentrosPobladoFind.layers('0');
    CentrosPobladoFind.params.layerDefs = "";
    CentrosPobladoFind.text('0').fields('ACTIVO');//.fields("ID_FUENTE_CP,ID_CLASE, ID_TIPO,NOMBRE_SITIO,V_URBANO, V_RURAL, VSS_URBANO, VSS_RURAL");
    CentrosPobladoFind.run(function (error, featureCollection, response2) {

        var CP, htmlpopup, clase;
        
        $("#CargaCluster").hide(100);
        lyrTotalCentrosPoblados = L.geoJson(featureCollection, {
            pointToLayer: function (feature, latlng) {
                var clase, estilo,tipo;
                if (feature.properties.ID_FUENTE_CP == 1) { estilo = geojsonMarkerDane; }
                else if (feature.properties.ID_FUENTE_CP == 2) { estilo = geojsonMarkerUpme; }
                else if (feature.properties.ID_FUENTE_CP == 3) { estilo = geojsonMarkerUpme; }

                CP = L.marker(latlng, estilo).bindLabel(feature.properties.NOMBRE_SITIO, { noHide: false, offset: [20, -45] });

                clase = arrayclases[feature.properties.ID_CLASE];
                tipo = arraytipos[feature.properties.ID_TIPO];
                if (typeof tipo === 'undefined') {
                    tipo = '-';
                }
                var FECHA_OFICIALIZACION = (feature.properties.FECHA_OFICIALIZACION == "Null") ? '-' : feature.properties.FECHA_OFICIALIZACION;
                var V_URBANO = (feature.properties.V_URBANO == "Null") ? 0 : feature.properties.V_URBANO;
                var V_RURAL = (feature.properties.V_RURAL == "Null") ? 0 : feature.properties.V_RURAL;
                var VSS_URBANO = (feature.properties.VSS_URBANO == "Null") ? 0 : feature.properties.VSS_URBANO;
                var VSS_RURAL = (feature.properties.VSS_RURAL == "Null") ? 0 : feature.properties.VSS_RURAL;
                htmlpopup =
                '<div class="panel panel-primary">' +
                    '<div class="panel-heading">Centro Poblado</div>' +
                        '<div class="popupstyle">' +
                            '<button class="btn btn-primary pull-right btn-xs " data-toggle="tooltip" data-placement="left" title="Acercar" type="button" type="button" onclick="zoomCP(\'' + latlng.lng + '\',\'' + latlng.lat + '\')">' +
                                '<span class="glyphicon glyphicon-zoom-in" aria-hidden="true"></span>' +
                            '</button>' +
                            '<h5><strong  class="primary-font">' + feature.properties.NOMBRE_SITIO + '</strong><br>'
                            + feature.properties.MPIO_CNMBR + ', ' + feature.properties.DPTO_CNMBR + '.<hr>' +
                            '<small>Clase:</small> ' + clase + '<br>' +
                            '<small>Tipo Zona:</small> ' + tipo + ' <br>' +
                            '<small>Fecha creacion:</small> ' + FECHA_OFICIALIZACION + ' <br>' +
                            '<small>Viviendas Urbanas:</small> ' + V_URBANO + '<br>' +
                            '<small>Viviendas Rurales:</small> ' + V_RURAL + ' <br>' +
                            '<small>Viviendas sin servicio Urbanas:</small> ' + VSS_URBANO + ' <br>' +
                            '<small>Viviendas sin servicio Rurales:</small> ' + VSS_RURAL + '<br>' +
                        '</div>' +
                    '</div>' +
                '</div>';
                CP.bindPopup(htmlpopup);
                return CP;

            }
        });
        if (map.hasLayer(CPCluster)) {
             CPCluster.clearLayers();
             CPCluster.addLayer(lyrTotalCentrosPoblados);
            
        } else {
            CPCluster.addLayer(lyrTotalCentrosPoblados);
            if (!map.hasLayer(LyrMunicipio)) {
                map.addLayer(CPCluster);
            }
        }
        $("#MisActualizarVV").prop("disabled", false);
        

    });
}

$("#MisActualizarVV").prop("disabled", true);
MapearCentroPobladoTotal();
