
/********************************************************
Capas
*******************************************************/
var LyrCentrosPoblados = L.esri.featureLayer(dominio + urlHostSUEdit + 'FeatureServer/0');

var CentrosPobladoEliFind = L.esri.Tasks.find({
    url: dominio + urlHostSUCons + 'MapServer'
});
var CentrosPobladoEditQuery = L.esri.Tasks.query({
    url: dominio + urlHostSUEdit + 'FeatureServer/0'
});

var CentrosPobladoFind = L.esri.Tasks.find({
    url: dominio + urlHostSUCons + 'MapServer'
});

var lyrCentrosPobladosVV = L.esri.featureLayer(dominio + urlHostSUEdit + 'FeatureServer/2');
var CentrosPobladoEditQueryTemp = L.esri.Tasks.query({
    url: dominio + urlHostSUEdit + 'FeatureServer/1'
});;

var lyrVVEdit = L.esri.featureLayer(dominio + urlHostSUEdit + 'FeatureServer/2');
var lyrVVEdit_T = L.esri.featureLayer(dominio + urlHostSUEdit + 'FeatureServer/3');
var lyrCentrosPobladosEdicion = L.esri.featureLayer(dominio + urlHostSUEdit + 'FeatureServer/1');
var lyrTotalCentrosPoblados;


var query_actualizaciones = L.esri.Tasks.query({
    url: dominio + urlHostSUEdit + 'MapServer/2'
});

var query_actualizaciones_t = L.esri.Tasks.query({
    url: dominio + urlHostSUEdit + 'MapServer/3'
});

function adiccionVV(featureCollectionVV) {
    var FeatureVV = new Object();
    FeatureVV.properties = new Object();
    FeatureVV.properties.ID_VSS = 0;
    FeatureVV.properties.ID_CENTRO_POBLADO = featureCollectionVV.features[0].properties.ID_CENTRO_POBLADO;
    FeatureVV.properties.V_TOTAL = featureCollectionVV.features[0].properties.V_TOTAL;
    FeatureVV.properties.V_URBANO = featureCollectionVV.features[0].properties.V_URBANO;
    FeatureVV.properties.V_RURAL = featureCollectionVV.features[0].properties.V_RURAL;
    FeatureVV.properties.VSS_TOTAL = featureCollectionVV.features[0].properties.VSS_TOTAL;
    FeatureVV.properties.VSS_URBANO = featureCollectionVV.features[0].properties.VSS_URBANO;
    FeatureVV.properties.VSS_RURAL = featureCollectionVV.features[0].properties.VSS_RURAL;
    FeatureVV.properties.VIGENCIA = featureCollectionVV.features[0].properties.VIGENCIA;
    FeatureVV.properties.OBSERVACION = featureCollectionVV.features[0].properties.OBSERVACION;
    FeatureVV.properties.ID_USUARIO_ACTUALIZACION = id_user;
    FeatureVV.properties.FECHA_ACTUALIZACION = moment().format('DD/MM/YYYY h:mm:ss a');
    FeatureVV.properties.FECHA_REGISTRO = featureCollectionVV.features[0].properties.FECHA_REGISTRO;
    FeatureVV.properties.ID_USUARIO_REGISTRO = featureCollectionVV.features[0].properties.ID_USUARIO_REGISTRO;
    FeatureVV.type = new Object();
    FeatureVV.type = "Feature";
    lyrVVEdit.addFeature(FeatureVV, function (error, featureCollection, response2) {
        //console.log(featureCollection);
        if (featureCollection.success == true) {
            MapearCentroPobladoTotal();
            MapearCentroPobladoAct();
            msj_exito("Se Aprobo la actualizacion de viviendas exitosamente!");
            $("#panel_edicion").hide(100);
            return true;
        } else {
            msj_peligro("NO SE REALIZO EL PROCESO CON EXITO, REVISE EL SERVIDOR DE MAPAS !");
            return false;
        }
    });

}


function AprobarActualizacion(id) {
    BootstrapDialog.show({
        title: 'Confirmar',
        message: '¿Esta Seguro de que desea borrar la actualización?',
        closable: false,
        data: {
            'callback': function (result) {
                if (result) {
                    
                    query_actualizaciones_t.featureIds(id).where("").run(function (error, featureCollectionVV, response2) {
                        featureCollectionVV.features[0].properties.ESTADO = 1;
                        featureCollectionVV.features[0].properties.ID_USUARIO_ACTUALIZACION = id_user;
                        featureCollectionVV.features[0].properties.FECHA_ACTUALIZACION = moment().format('DD/MM/YYYY h:mm:ss a');

                        lyrVVEdit_T.updateFeature(featureCollectionVV.features[0], function (error, featureCollection, response2) {
                            if (featureCollection.success == true) {
                                console.log(featureCollectionVV.features[0].properties.ID_CENTRO_POBLADO);
                                query_actualizaciones.where("ID_CENTRO_POBLADO=" + featureCollectionVV.features[0].properties.ID_CENTRO_POBLADO).returnGeometry(false)
                                    .run(function (error, featureCollection) {
                                        console.log(featureCollection);
                                        if (featureCollection.features.length == 0) {
                                            adiccionVV(featureCollectionVV);
                                        } else {
                                            lyrVVEdit.deleteFeature(featureCollection.features[0].id, function (error, featureCollection, response2) {
                                                
                                                if (featureCollection.success == true) {
                                                    adiccionVV(featureCollectionVV);
                                                } else {
                                                    msj_peligro("NO SE REALIZO DE BORRADO DE VIVIENDAS REVISE EL SERVIDOR DE MAPAS !");
                                                    return false;
                                                }

                                            });
                                        }

                                    });
                            } else {
                                msj_peligro("NO SE REALIZO EL ACTUALIZACION DE TEMP CON EXITO, REVISE EL SERVIDOR DE MAPAS !");
                                return false;
                            }
                        });
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
function RechazarActualizacion(id) {
    BootstrapDialog.show({
        title: 'Confirmar',
        message: '¿Esta Seguro de que desea RECHAZAR la actualización?',
        closable: false,
        data: {
            'callback': function (result) {
                if (result) {
                    
                    query_actualizaciones_t.featureIds(id).where("").run(function (error, featureCollectionVV, response2) {
                        featureCollectionVV.features[0].properties.ESTADO = 2;
                        lyrVVEdit_T.updateFeature(featureCollectionVV.features[0], function (error, featureCollection, response2) {
                            //console.log(featureCollection);
                            if (featureCollection.success == true) {
                                MapearCentroPobladoAct()
                                msj_exito("Se RECHAZO la actualizacion exitosamente!");
                                $("#panel_edicion").hide(100);
                                return true;
                            } else {
                                msj_peligro("NO SE REALIZO EL PROCESO CON EXITO, REVISE EL SERVIDOR DE MAPAS !");
                                return false;
                            }
                        });
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

    
    $("#DivListaCpAct").empty();
    $("#DivListaCpAct").append('<div id="ListaCpAct" style="max-height:300px;overflow:scroll;"><ul class="chat"></ul></div>');
    var contador = 0, totalfeatures = 0;
    query_actualizaciones_t.featureIds('').where("ESTADO=0").returnGeometry(false).run(function (error, featureCollection) {
        console.log(featureCollection);
        if (featureCollection.features.length == 0) {
            $("#ListaCpAct .chat").prepend(
                       '<li class="left" >' +
                                  '<div class="clearfix">' +
                                      '<h5>' +
                                      'No hay Actualizaciones' +
                                      '</h5>' +
                                    '</div>' +
                              '</li>')
               
        }else{
        $.each(featureCollection.features, function (index, value) {
            //console.log(value.properties.ID_CENTRO_POBLADO);
            totalfeatures = featureCollection.features.length;
            CentrosPobladoFind.layers('0');
            CentrosPobladoFind.params.layerDefs = "";
            CentrosPobladoFind.text(value.properties.ID_CENTRO_POBLADO).fields('ID_CENTRO_POBLADO');
            CentrosPobladoFind.run(function (error, featureCollectionTemp, response2) {
                //console.log(featureCollectionTemp);
                var vigencia = value.properties.VIGENCIA.toString();
                var datauser = "";
                datauser = getDataUser(value.properties.ID_USUARIO_REGISTRO);

                $("#ListaCpAct .chat").prepend(
                        '<li class="left" onclick="clickmap(' + value.properties.ID_CENTRO_POBLADO + ',\'lyrTotalCentrosPoblados\')">' +
                                   '<div class="clearfix">' +
                                       '<h5>' +
                                           '<strong class="primary-font">' + featureCollectionTemp.features[0].properties.NOMBRE_SITIO + '</strong>,<br> '
                                           + featureCollectionTemp.features[0].properties.MPIO_CNMBR + ', ' + featureCollectionTemp.features[0].properties.DPTO_CNMBR + '.<br>' +
                                           '<small>Vigencia: </b>' + vigencia.substring(4, 6) + '-' + vigencia.substring(0, 4) + '</b><br />' +
                                           'Usuario: <b>' + datauser[0].nombre + '</b><br />' +
                                           'Organizacion: <b>' + datauser[0].organizacion +
                                           '</b><br>Total: <b>' + value.properties.V_TOTAL +
                                           '</b> ( Urbanas: <b>' + value.properties.V_URBANO +
                                           '</b> - Rurales: <b>' + value.properties.V_RURAL +
                                           '</b>)<br>Sin servicio: <b>' + value.properties.VSS_TOTAL +
                                           '</b> (urbanas: <b>' + value.properties.VSS_URBANO +
                                           '</b> - rurales: <b>' + value.properties.VSS_RURAL +
                                           '</b>)<br>Observación: <b>' + value.properties.OBSERVACION + '</b><br><small>' +
                                           '<button class="btn btn-success pull-left btn-xs " data-toggle="tooltip" data-placement="right" title="Aprobar" type="button" onclick="AprobarActualizacion(' + value.properties.OBJECTID + ')">' +
                                                '<span class="glyphicon glyphicon-ok" aria-hidden="true"></span> ' +
                                            '</button> ' +
                                            '<button class="btn btn-danger pull-right btn-xs " data-toggle="tooltip" data-placement="left" title="Rechazar" type="button" onclick="RechazarActualizacion(' + value.properties.OBJECTID + ')">' +
                                                '<span class="glyphicon glyphicon-ban-circle" aria-hidden="true"></span> ' +
                                            '</button></h5><br>' +
                                             '</h5>' +
                                    '</div>' +
                              '</li>'
                       );
                contador++;
                if (totalfeatures == contador) {
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
      }
    });
}

/********************************************************
Aplicacion
*******************************************************/

$("#ValidarCP").click(function () {
    $("#FormCPPgn0").addClass("hide");
    $("#FormCPPgn1").removeClass("hide");
    MapearCentroPobladoEli();
});

$("#ValidarActViviendas").click(function () {
    $("#FormCPPgn0").addClass("hide");
    $("#FormCPPgn2").removeClass("hide");
    MapearCentroPobladoAct();
    $(".legend").show();
});
$("#panel_edicion").hide(100);


var lyrCentrosPobladosT;
var FeatureCentroPobladoEdit;


function ValidarFeature(prevalue) {
    if (!$("#" + prevalue + "InpNomCP").val()) {
        msj_peligro("Por favor ingrese el nombre del Sitio Upme a Energizar");
        $("#" + prevalue + "InpNomCP").focus();
        return false;
    } else if ($("#" + prevalue + "SectClase").val() == "") {
        msj_peligro("Por favor seleccione una Clase zona");
        $("#" + prevalue + "SectClase").focus();
        return false;
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

    if ($("#" + prevalue + "SectClase").val() == "") {
        msj_peligro("Por favor seleccione la clase zona");
        $("#" + prevalue + "SectClase").focus();
        return false;
    } else if ($("#" + prevalue + "SectClase").val() == '1') {
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
        } else {
            $("#" + prevalue + "InpViviendasR").val("");
            $("#" + prevalue + "InpViviendasSSR").val("");
        }
    } else if ($("#" + prevalue + "SectClase").val() == '2') {
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

    } else if ($("#" + prevalue + "SectClase").val() == '3') {
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


function AprobarCentroPoblado(id_feature) {
    var FeatureCentroPobladoDesa;
    CentrosPobladoEditQueryTemp.featureIds(id_feature).run(function (error, featureCollection, response2) {
        FeatureCentroPobladoDesa = featureCollection;
        FeatureCentroPobladoCrea = new Object();

        FeatureCentroPobladoDesa.features[0].properties.APROBADO = 1;
        FeatureCentroPobladoDesa.features[0].properties.FECHA_VALIDACION = moment().format('DD/MM/YYYY h:mm:ss a');
        FeatureCentroPobladoDesa.features[0].properties.ID_USUARIO_VALIDACION = id_user_validacion;

        FeatureCentroPobladoCrea.geometry = featureCollection.features[0].geometry;
        console.log(featureCollection);
        FeatureCentroPobladoCrea.properties = new Object();
        FeatureCentroPobladoCrea.type = new Object();
        FeatureCentroPobladoCrea.type = "Feature";
        FeatureCentroPobladoCrea.properties.ID_CENTRO_POBLADO = 0;
        FeatureCentroPobladoCrea.properties.COD_CP_UPME = FeatureCentroPobladoDesa.features[0].properties.COD_CP_UPME;
        FeatureCentroPobladoCrea.properties.COD_DPTO = FeatureCentroPobladoDesa.features[0].properties.COD_DPTO;
        FeatureCentroPobladoCrea.properties.COD_MPIO = FeatureCentroPobladoDesa.features[0].properties.COD_MPIO;
        FeatureCentroPobladoCrea.properties.COD_SITIO = '0';
        FeatureCentroPobladoCrea.properties.ID_FUENTE_CP = FeatureCentroPobladoDesa.features[0].properties.ID_FUENTE_CP;
        FeatureCentroPobladoCrea.properties.NOMBRE_SITIO = FeatureCentroPobladoDesa.features[0].properties.NOMBRE_SITIO;
        FeatureCentroPobladoCrea.properties.ID_TIPO = FeatureCentroPobladoDesa.features[0].properties.ID_TIPO;
        FeatureCentroPobladoCrea.properties.ID_CLASE = FeatureCentroPobladoDesa.features[0].properties.ID_CLASE;
        FeatureCentroPobladoCrea.properties.OBSERVACION = FeatureCentroPobladoDesa.features[0].properties.OBSERVACION;
        FeatureCentroPobladoCrea.properties.FECHA_DATO = FeatureCentroPobladoDesa.features[0].properties.FECHA_DATO;
        FeatureCentroPobladoCrea.properties.LONGITUD = FeatureCentroPobladoDesa.features[0].properties.LONGITUD;
        FeatureCentroPobladoCrea.properties.LATITUD = FeatureCentroPobladoDesa.features[0].properties.LATITUD;
        FeatureCentroPobladoCrea.properties.ALTITUD = FeatureCentroPobladoDesa.features[0].properties.ALTITUD;
        FeatureCentroPobladoCrea.properties.VIGENCIA = FeatureCentroPobladoDesa.features[0].properties.VIGENCIA;
        FeatureCentroPobladoCrea.properties.ACTIVO = 0;
        FeatureCentroPobladoCrea.properties.FECHA_OFICIALIZACION = moment().format('DD/MM/YYYY h:mm:ss a');
        FeatureCentroPobladoCrea.properties.ID_USUARIO_OFICIALIZACION = id_user_validacion;

        FeatureCentroPobladoVV = new Object();
        FeatureCentroPobladoVV.properties = new Object();

        BootstrapDialog.show({
            title: 'Confirmar',
            message: '¿Esta Seguro de APROBAR el Sitio Upme a Energizar?',
            closable: false,
            data: {
                'callback': function (result) {
                    if (result) {
                        lyrCentrosPobladosEdicion.updateFeature(FeatureCentroPobladoDesa.features[0], function (error, featureCollection, response2) {
                            LyrCentrosPoblados.addFeature(FeatureCentroPobladoCrea, function (error, featureCollection, response2) {
                                if (featureCollection.success == true) {
                                    CentrosPobladoEditQuery.featureIds(featureCollection.objectId).run(function (error, featureCollectionVV) {
                                        console.log(featureCollectionVV);
                                        FeatureCentroPobladoVV.properties.ID_VSS = 0;
                                        FeatureCentroPobladoVV.properties.ID_CENTRO_POBLADO = featureCollectionVV.features[0].properties.ID_CENTRO_POBLADO;
                                        //FeatureCentroPobladoVV.properties.COD_UPME = featureCollectionVV.features[0].properties.COD_CP_UPME;
                                        FeatureCentroPobladoVV.properties.V_TOTAL = FeatureCentroPobladoDesa.features[0].properties.VIVIENDAS_URBANAS + FeatureCentroPobladoDesa.features[0].properties.VIVIENDAS_RURALES;
                                        FeatureCentroPobladoVV.properties.V_URBANO = FeatureCentroPobladoDesa.features[0].properties.VIVIENDAS_URBANAS;
                                        FeatureCentroPobladoVV.properties.V_RURAL = FeatureCentroPobladoDesa.features[0].properties.VIVIENDAS_RURALES;
                                        FeatureCentroPobladoVV.properties.VSS_TOTAL = FeatureCentroPobladoDesa.features[0].properties.VSS_URBANAS + FeatureCentroPobladoDesa.features[0].properties.VSS_RURALES;
                                        FeatureCentroPobladoVV.properties.VSS_URBANO = FeatureCentroPobladoDesa.features[0].properties.VSS_URBANAS;
                                        FeatureCentroPobladoVV.properties.VSS_RURAL = FeatureCentroPobladoDesa.features[0].properties.VSS_RURALES;
                                        FeatureCentroPobladoVV.properties.VIGENCIA = FeatureCentroPobladoDesa.features[0].properties.VIGENCIA;
                                        FeatureCentroPobladoVV.properties.OBSERVACION = FeatureCentroPobladoDesa.features[0].properties.OBSERVACION;
                                        FeatureCentroPobladoVV.properties.FECHA_REGISTRO = moment().format('DD/MM/YYYY h:mm:ss a');
                                        FeatureCentroPobladoVV.properties.ID_USUARIO_REGISTRO = featureCollectionVV.features[0].properties.ID_USUARIO_CREACION;
                                        FeatureCentroPobladoCrea.type = new Object();
                                        FeatureCentroPobladoVV.type = "Feature";
                                        
                                        lyrCentrosPobladosVV.addFeature(FeatureCentroPobladoVV, function (error, featureCollectionVV) {
                                            MapearCentroPobladoEli();
                                            MapearCentroPobladoTotal();
                                            msj_exito("Se APROBO el Sitio Upme a Energizar exitosamente!");
                                            return true;
                                        });

                                    });
                                } else {
                                    msj_peligro("NO SE REALIZO LA CREACION CON EXITO, REVISE EL SERVIDOR DE MAPAS !");
                                    return false;
                                }
                            });
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
    });
}

function EditCentroPoblado(EditUbiCP){
    BootstrapDialog.show({
        title: 'Confirmar',
        message: '¿Esta Seguro de EDITAR el Sitio Upme a Energizar?',
        closable: false,
        data: {
            'callback': function (result) {
                if (result) {
                    //console.log(lyrCentrosPobladosEdicion);
                    lyrCentrosPobladosEdicion.updateFeature(EditUbiCP.features[0], function (error, featureCollection, response2) {
                        //console.log(featureCollection);
                        if (featureCollection.success == true) {
                            MapearCentroPobladoEli();
                            msj_exito("Se EDITO el Sitio Upme a Energizar exitosamente!");
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
function EditFeature() {
    var EditUbiCP = FeatureCentroPobladoEdit;
    EditUbiCP.features[0].properties.NOMBRE_SITIO = $("#EditInpNomCP").val().toUpperCase();
    EditUbiCP.features[0].properties.ID_CLASE = $("#EditSectClase").val();
    EditUbiCP.features[0].properties.ID_TIPO = $("#EditSectTipo").val();
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




function SaveFeature() {
    if (ValidarFeature("Edit")) {
        EditFeature();
    }
}

function CancelEditFeature() {
    $("#panel_edicion").hide();
}

function LimpiarBorrado() {
   if (map.hasLayer(lyrCentrosPobladosT)) {
        map.removeLayer(lyrCentrosPobladosT);
    }
   $("#DivListaCpValidate").empty();
   $("#DivListaCpValidate").append('<div id="ListaCpValidate" style="max-height:300px;overflow:scroll;"><ul class="chat"></ul></div>');
}

function MapearCentroPobladoEli() {

    CentrosPobladoEliFind.layers('1');
    CentrosPobladoEliFind.text('0').fields('APROBADO');
    CentrosPobladoEliFind.run(function (error, featureCollection, response2) {

        var CP, htmlpopup, clase;
        LimpiarBorrado();
        if (featureCollection.features.length == 0) {
            $("#ListaCpValidate .chat").prepend(
                       '<li class="left" >' +
                                  '<div class="clearfix">' +
                                      '<h5>' +
                                      'No hay Sitios Upme por aprobar' +
                                      '</h5>' +
                                    '</div>' +
                              '</li>')
               
        }else{

        lyrCentrosPobladosT = L.geoJson(featureCollection, {
            pointToLayer: function (feature, latlng) {
                estilo = geojsonMarkerSinAprobar;

                CP = L.marker(latlng, estilo).bindLabel(feature.properties.NOMBRE_SITIO, { noHide: false, offset: [20, -45] });

                var clase, tipo;
                //console.log(arrayclases);
                clase = arrayclases[feature.properties.ID_CLASE];
                tipo = arraytipos[feature.properties.ID_TIPO];
                var vigencia = feature.properties.VIGENCIA.toString();
                htmlpopup =
                '<div class="panel panel-primary">' +
                    '<div class="panel-heading">Sitio Upme a Energizar</div>' +
                        '<div class="popupstyle">' +
                            '<button class="btn btn-primary pull-right btn-xs " data-toggle="tooltip" data-placement="left" title="Acercar" type="button" onclick="zoomCP(\'' + latlng.lng + '\',\'' + latlng.lat + '\')">' +
                                '<span class="glyphicon glyphicon-zoom-in" aria-hidden="true"></span>' +
                            '</button>' +
                              '<strong class="primary-font">' + feature.properties.NOMBRE_SITIO + '</strong>,<br> '
                                           + feature.properties.MPIO_CNMBR + ', ' + feature.properties.DPTO_CNMBR + '.<br>' +
                                          '<small>Clase:</small> ' + clase + '<br>' +
                            '<small>Tipo Zona:</small> ' + tipo + '<br>' +
                            '<small>Vigencia:</small>' + vigencia.substring(4, 6) + '-' + vigencia.substring(0, 4) + '<br>' +
                            '<small>Viviendas Urbanas:</small> ' + feature.properties.VIVIENDAS_URBANAS + '<br>' +
                            '<small>Viviendas Rurales:</small> ' + feature.properties.VIVIENDAS_RURALES + '<br>' +
                            '<small>Viviendas sin servicio Urbanas:</small> ' + feature.properties.VSS_URBANAS + '<br>' +
                            '<small>Viviendas sin servicio Rurales:</small> ' + feature.properties.VSS_RURALES + '<br>' +
                            '<small>Fecha Creación:</small> ' + feature.properties.FECHA_CREACION + '<br>' +
                            '<small>Observacion:</small> ' + feature.properties.OBSERVACION + '<br><br>' +
                            '<button class="btn btn-success pull-left btn-xs " data-toggle="tooltip" data-placement="left" title="Aprobar" type="button" onclick="AprobarCentroPoblado(' + feature.properties.OBJECTID + ')">' +
                                '<span class="glyphicon glyphicon-ok" aria-hidden="true"></span> ' +
                            '</button> ' +
                            '<button class="btn btn-info pull-left btn-xs " data-toggle="tooltip" data-placement="rigth" title="Editar" type="button" onclick="EditarCentroPoblado(' + feature.properties.OBJECTID + ')">' +
                                '<span class="glyphicon glyphicon-edit" aria-hidden="true"></span> ' +
                            '</button></center>' +
                            '<button class="btn btn-danger pull-right btn-xs " data-toggle="tooltip" data-placement="left" title="Desaprobar" type="button" onclick="DesaprobarCentroPoblado(' + feature.properties.OBJECTID + ')">' +
                                '<span class="glyphicon glyphicon-ban-circle" aria-hidden="true"></span> ' +
                            '</button></h5><br>' +

                        '</div>' +
                    '</div>' +
                '</div>';
                //console.log(htmlpopup);
                CP.bindPopup(htmlpopup);
                var datauser = "";
                datauser = getDataUser(feature.properties.ID_USUARIO_CREACION);
                
                $("#ListaCpValidate .chat").prepend(
                     '<li class="left" onclick="clickmap(' + feature.properties.OBJECTID + ',\'lyrCentrosPobladosT\')">' +
                                '<div class="clearfix">'+
                                    '<h5>' +
                                        '<strong class="primary-font">' + feature.properties.NOMBRE_SITIO + '</strong>,<br> ' +
                                        feature.properties.MPIO_CNMBR + ', ' + feature.properties.DPTO_CNMBR + '.<br>' +
                                        '<span class="fa fa-adjust"></span> <small>Tipo: ' + tipo + '</small><br />' +
                                        '<span class="fa fa-calendar-o"></span> <small>Vigencia: ' + vigencia.substring(4, 6) + '-' + vigencia.substring(0, 4) + '</small><br />' +
                                        '<span class="glyphicon glyphicon-user"></span> <small>Usuario: ' + datauser[0].nombre + '</small><br />' +
                                        '<span class="glyphicon glyphicon-inbox"></span> <small>Organizacion: ' + datauser[0].organizacion + '</small><br />' +
                                    '</h5>'+
                                    '<div>'+
                                        '<small class="pull-right text-muted">'+
                                            '<span class="glyphicon glyphicon-time"></span> '+feature.properties.FECHA_CREACION+
                                        '</small>'+
                                    '</div>'+
                                '</div>'+
                            '</li>'
                    );
                return CP;
            }
        });

        lyrCentrosPobladosT.addTo(map);
        // console.log(ordenarGeojson);
        $('#ListaCpValidate').searchable({
            searchField: '#container-search',
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
}


map.on('popupopen', function (e) {
    $('[data-toggle="tooltip"]').tooltip();
    
});



function AprobarCentroPoblado(id_feature) {
    var FeatureCentroPobladoDesa;
    CentrosPobladoEditQueryTemp.featureIds(id_feature).run(function (error, featureCollection, response2) {
        FeatureCentroPobladoDesa = featureCollection;
        FeatureCentroPobladoCrea = new Object();

        FeatureCentroPobladoDesa.features[0].properties.APROBADO = 1;
        FeatureCentroPobladoDesa.features[0].properties.FECHA_VALIDACION = moment().format('DD/MM/YYYY h:mm:ss a');
        FeatureCentroPobladoDesa.features[0].properties.ID_USUARIO_VALIDACION = id_user_validacion;
        
        FeatureCentroPobladoCrea.geometry = featureCollection.features[0].geometry;
        console.log(featureCollection);
        FeatureCentroPobladoCrea.properties = new Object();
        FeatureCentroPobladoCrea.type = new Object();
        FeatureCentroPobladoCrea.type = "Feature";
        FeatureCentroPobladoCrea.properties.ID_CENTRO_POBLADO=0;
        FeatureCentroPobladoCrea.properties.COD_CP_UPME=FeatureCentroPobladoDesa.features[0].properties.COD_CP_UPME;
        FeatureCentroPobladoCrea.properties.COD_DPTO=FeatureCentroPobladoDesa.features[0].properties.COD_DPTO;
        FeatureCentroPobladoCrea.properties.COD_MPIO=FeatureCentroPobladoDesa.features[0].properties.COD_MPIO;
        FeatureCentroPobladoCrea.properties.COD_SITIO = '0';
        FeatureCentroPobladoCrea.properties.ID_FUENTE_CP=FeatureCentroPobladoDesa.features[0].properties.ID_FUENTE_CP;
        FeatureCentroPobladoCrea.properties.NOMBRE_SITIO=FeatureCentroPobladoDesa.features[0].properties.NOMBRE_SITIO;
        FeatureCentroPobladoCrea.properties.ID_TIPO=FeatureCentroPobladoDesa.features[0].properties.ID_TIPO;
        FeatureCentroPobladoCrea.properties.ID_CLASE=FeatureCentroPobladoDesa.features[0].properties.ID_CLASE;
        FeatureCentroPobladoCrea.properties.OBSERVACION=FeatureCentroPobladoDesa.features[0].properties.OBSERVACION;
        FeatureCentroPobladoCrea.properties.FECHA_DATO=FeatureCentroPobladoDesa.features[0].properties.FECHA_DATO;
        FeatureCentroPobladoCrea.properties.LONGITUD=FeatureCentroPobladoDesa.features[0].properties.LONGITUD;
        FeatureCentroPobladoCrea.properties.LATITUD=FeatureCentroPobladoDesa.features[0].properties.LATITUD;
        FeatureCentroPobladoCrea.properties.ALTITUD = FeatureCentroPobladoDesa.features[0].properties.ALTITUD;
        FeatureCentroPobladoCrea.properties.VIGENCIA = FeatureCentroPobladoDesa.features[0].properties.VIGENCIA;
        FeatureCentroPobladoCrea.properties.ACTIVO = 0;
        FeatureCentroPobladoCrea.properties.FECHA_OFICIALIZACION = moment().format('DD/MM/YYYY h:mm:ss a');
        FeatureCentroPobladoCrea.properties.ID_USUARIO_OFICIALIZACION = id_user_validacion;
        
        FeatureCentroPobladoVV = new Object();
        FeatureCentroPobladoVV.properties = new Object();


   
        console.log(FeatureCentroPobladoDesa.features[0]);
        console.log(FeatureCentroPobladoCrea);
        BootstrapDialog.show({
            title: 'Confirmar',
            message: '¿Esta Seguro de APROBAR el Sitio Upme a Energizar?',
            closable: false,
            data: {
                'callback': function (result) {
                    if (result) {
                       lyrCentrosPobladosEdicion.updateFeature(FeatureCentroPobladoDesa.features[0], function (error, featureCollection, response2) {
                        LyrCentrosPoblados.addFeature(FeatureCentroPobladoCrea, function (error, featureCollection, response2) {
                                if (featureCollection.success == true) {
                                    CentrosPobladoEditQuery.featureIds(featureCollection.objectId).run(function (error, featureCollectionVV) {
                                        console.log(featureCollectionVV);
                                        FeatureCentroPobladoVV.properties.ID_VSS = 0;
                                        FeatureCentroPobladoVV.properties.ID_CENTRO_POBLADO = featureCollectionVV.features[0].properties.ID_CENTRO_POBLADO;
                                        //FeatureCentroPobladoVV.properties.COD_UPME = featureCollectionVV.features[0].properties.COD_CP_UPME;
                                        FeatureCentroPobladoVV.properties.V_TOTAL = FeatureCentroPobladoDesa.features[0].properties.VIVIENDAS_URBANAS + FeatureCentroPobladoDesa.features[0].properties.VIVIENDAS_RURALES;
                                        FeatureCentroPobladoVV.properties.V_URBANO = FeatureCentroPobladoDesa.features[0].properties.VIVIENDAS_URBANAS;
                                        FeatureCentroPobladoVV.properties.V_RURAL = FeatureCentroPobladoDesa.features[0].properties.VIVIENDAS_RURALES;
                                        FeatureCentroPobladoVV.properties.VSS_TOTAL = FeatureCentroPobladoDesa.features[0].properties.VSS_URBANAS + FeatureCentroPobladoDesa.features[0].properties.VSS_RURALES;
                                        FeatureCentroPobladoVV.properties.VSS_URBANO = FeatureCentroPobladoDesa.features[0].properties.VSS_URBANAS;
                                        FeatureCentroPobladoVV.properties.VSS_RURAL = FeatureCentroPobladoDesa.features[0].properties.VSS_RURALES;
                                        FeatureCentroPobladoVV.properties.VIGENCIA = FeatureCentroPobladoDesa.features[0].properties.VIGENCIA;
                                        FeatureCentroPobladoVV.properties.OBSERVACION = FeatureCentroPobladoDesa.features[0].properties.OBSERVACION;
                                        FeatureCentroPobladoVV.properties.FECHA_REGISTRO = moment().format('DD/MM/YYYY h:mm:ss a');
                                        FeatureCentroPobladoVV.properties.ID_USUARIO_REGISTRO = FeatureCentroPobladoDesa.features[0].properties.ID_USUARIO_CREACION;
                                        FeatureCentroPobladoCrea.type = new Object();
                                        FeatureCentroPobladoVV.type = "Feature";
                                        console.log(FeatureCentroPobladoVV);

                                        lyrCentrosPobladosVV.addFeature(FeatureCentroPobladoVV,function (error, featureCollectionVV) {
                                            MapearCentroPobladoEli();
                                            MapearCentroPobladoTotal();
                                            msj_exito("Se APROBO el Sitio Upme a Energizar exitosamente!");
                                            return true;
                                        });
                                        
                                    });
                                } else {
                                    msj_peligro("NO SE REALIZO LA CREACION CON EXITO, REVISE EL SERVIDOR DE MAPAS !");
                                    return false;
                                }
                            });
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
    });



}
function EditarCentroPoblado(id_feature) {
    $("#panel_edicion").show(100);
    CentrosPobladoEditQueryTemp.featureIds(id_feature).run(function (error, featureCollection, response2) {
        FeatureCentroPobladoEdit = featureCollection;
        var tempmes = featureCollection.features[0].properties.VIGENCIA.toString().substring(4, 6);
        var tempanio = featureCollection.features[0].properties.VIGENCIA.toString().substring(0, 4);
        $("#EditInpNomCP").val(featureCollection.features[0].properties.NOMBRE_SITIO.toUpperCase());
        $("#EditSectClase").val(featureCollection.features[0].properties.ID_CLASE);

        $("#EditSectTipo").val(featureCollection.features[0].properties.ID_TIPO);
        $("#EditSecVigenciaMes").val(tempmes);
        $("#EditSecVigenciaAnio").val(tempanio);
        ClaseZona(featureCollection.features[0].properties.ID_CLASE, "Edit");
        $("#EditInpViviendasU").val(featureCollection.features[0].properties.VIVIENDAS_URBANAS);
        $("#EditInpViviendasR").val(featureCollection.features[0].properties.VIVIENDAS_RURALES);
        $("#EditInpViviendasSSU").val(featureCollection.features[0].properties.VSS_URBANAS);
        $("#EditInpViviendasSSR").val(featureCollection.features[0].properties.VSS_RURALES);
        $("#EditInpObservacion").val(featureCollection.features[0].properties.OBSERVACION);
    });

}


map.on('popupclose', function (e) {
    $("#panel_edicion").hide();
});
function CancelarAprobacion() {
    $("#FormCPPgn0").removeClass("hide");
    $("#FormCPPgn1").addClass("hide");
    $("#panel_edicion").hide();
    if (map.hasLayer(lyrCentrosPobladosT)) {
        map.removeLayer(lyrCentrosPobladosT);
    }
}
function CancelarActualizacion() {
    $("#FormCPPgn0").removeClass("hide");
    $("#FormCPPgn2").addClass("hide");
    $("#panel_edicion").hide();
    
}
function DesaprobarCentroPoblado(id_feature) {

    var FeatureCentroPobladoDesa;
    CentrosPobladoEditQueryTemp.featureIds(id_feature).run(function (error, featureCollection, response2) {
        FeatureCentroPobladoDesa = featureCollection;
        $("CargaCluster").hide();
        FeatureCentroPobladoDesa.features[0].properties.APROBADO = 2;
        BootstrapDialog.show({
            title: 'Confirmar',
            message: '¿Esta Seguro de DESAPROBAR el Sitio Upme a Energizar?',
            closable: false,
            data: {
                'callback': function (result) {
                    if (result) {
                        lyrCentrosPobladosEdicion.updateFeature(FeatureCentroPobladoDesa.features[0], function (error, featureCollection, response2) {
                            //console.log(featureCollection);
                            if (featureCollection.success == true) {
                                MapearCentroPobladoEli();
                                msj_exito("Se DESAPROBO el Sitio Upme a Energizar exitosamente!");
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
    });

}




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

function MapearCentroPobladoTotal() {

    CentrosPobladoFind.layers('0');

    CentrosPobladoFind.text('0').fields('ACTIVO');//.fields("ID_FUENTE_CP,ID_CLASE, ID_TIPO,NOMBRE_SITIO,V_URBANO, V_RURAL, VSS_URBANO, VSS_RURAL");

    $("#CargaCluster").show(100);
    CentrosPobladoFind.run(function (error, featureCollection, response2) {

        var CP, htmlpopup, clase;

        $("#CargaCluster").hide(100);
        lyrTotalCentrosPoblados = L.geoJson(featureCollection, {
            pointToLayer: function (feature, latlng) {
                var clase, estilo;
                if (feature.properties.ID_FUENTE_CP == 1) { estilo = geojsonMarkerDane; }
                else if (feature.properties.ID_FUENTE_CP == 2) { estilo = geojsonMarkerUpme; }
                else if (feature.properties.ID_FUENTE_CP == 3) { estilo = geojsonMarkerUpme; }

                CP = L.marker(latlng, estilo).bindLabel(feature.properties.NOMBRE_SITIO, { noHide: false, offset: [20, -45] });

                // console.log(feature);
                clase = arrayclases[feature.properties.ID_CLASE];
                tipo = arraytipos[feature.properties.ID_TIPO];
                
                var vigencia = feature.properties.VIGENCIA.toString();
                var FECHA_OFICIALIZACION = (feature.properties.FECHA_OFICIALIZACION == "Null") ? '-' : feature.properties.FECHA_OFICIALIZACION;
                var V_URBANO = (feature.properties.V_URBANO == "Null") ? 0 : feature.properties.V_URBANO;
                var V_RURAL = (feature.properties.V_RURAL == "Null") ? 0 : feature.properties.V_RURAL;
                var VSS_URBANO = (feature.properties.VSS_URBANO == "Null") ? 0 : feature.properties.VSS_URBANO;
                var VSS_RURAL = (feature.properties.VSS_RURAL == "Null") ? 0 : feature.properties.VSS_RURAL;
                var vigencia = feature.properties.VIGENCIA.toString();
                htmlpopup =
                '<div class="panel panel-primary">' +
                    '<div class="panel-heading">Sitio UPME a Energizar.</div>' +
                        '<div class="popupstyle">' +
                            '<button class="btn btn-primary pull-right btn-xs " data-toggle="tooltip" data-placement="left" title="Acercar" type="button" type="button" onclick="zoomCP(\'' + latlng.lng + '\',\'' + latlng.lat + '\')">' +
                                '<span class="glyphicon glyphicon-zoom-in" aria-hidden="true"></span>' +
                            '</button>' +
                            '<strong class="primary-font">' + feature.properties.NOMBRE_SITIO + '</strong>,<br> '
                            + feature.properties.MPIO_CNMBR + ', ' + feature.properties.DPTO_CNMBR + '.<hr>' +
                            '<small>Clase:</small> ' + clase + '<br>' +
                            '<small>Tipo Zona:</small> ' + tipo + ' <br>' +
                            '<small>Vigencia:</small>' + vigencia.substring(4, 6) + '-' + vigencia.substring(0, 4) + '<br>' +
                            '<small>Fecha creacion:</small> ' + FECHA_OFICIALIZACION + ' <br>' +
                            '<small>Viviendas Urbanas:</small> ' + V_URBANO + '<br>' +
                            '<small>Viviendas Rurales:</small> ' + V_RURAL + ' <br>' +
                            '<small>Viviendas sin servicio Urbanas:</small> ' + VSS_URBANO + ' <br>' +
                            '<small>Viviendas sin servicio Rurales:</small> ' + VSS_RURAL + '<br>' +
                        '</div>' +
                    '</div>' +
                '</div>';
                CP.bindPopup(htmlpopup);
                CP.on('click', function () {
                    console.log(feature.properties);
                });
                return CP;

            }
        });
        if (map.hasLayer(CPCluster)) {

            CPCluster.clearLayers();
            CPCluster.addLayer(lyrTotalCentrosPoblados);

        } else {
            CPCluster.addLayer(lyrTotalCentrosPoblados);
            map.addLayer(CPCluster);
            
        }

        $("#ValidarActViviendas").prop("disabled", false);

    });
}

$("#ValidarActViviendas").prop("disabled", true);
MapearCentroPobladoTotal();