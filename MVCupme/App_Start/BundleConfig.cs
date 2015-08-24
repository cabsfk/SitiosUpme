using System.Web;
using System.Web.Optimization;

namespace MVCupme
{
    public class BundleConfig
    {
        // Para obtener más información sobre las uniones, visite http://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Scripts/jquery-{version}.js",
                        "~/Scripts/libs/searchable/jquery.searchable-1.1.0.min.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
                        "~/Scripts/jquery.validate*"));

            // Utilice la versión de desarrollo de Modernizr para desarrollar y obtener información. De este modo, estará
            // preparado para la producción y podrá utilizar la herramienta de compilación disponible en http://modernizr.com para seleccionar solo las pruebas que necesite.
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                        "~/Scripts/modernizr-*"));

            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                      "~/Scripts/libs/bootstrap-3.3.1/dist/js/bootstrap.min.js",
                      "~/Scripts/respond.js",
                      "~/Scripts/libs/jquery/jquery-ui.js",
                      "~/Scripts/libs/select-bootstrap/js/bootstrap-select.js",
                      "~/Scripts/libs/bootstrap-switch/js/bootstrap-switch.min.js",
                      "~/Scripts/libs/moment/moment.min.js",
                      "~/Scripts/libs/growl/bootstrap-growl.min.js",
                      "~/Scripts/libs/BootstrapDialog/js/bootstrap-dialog.min.js",
                      "~/Scripts/libs/waitingDialog/waitingDialog.js"));

            bundles.Add(new ScriptBundle("~/bundles/leaflet").Include(
                      "~/Scripts/libs/leaflet/leaflet.js",
                      "~/Scripts/libs/leaflet_markers/leaflet.awesome-markers.min.js",
                      "~/Scripts/libs/cluster/leaflet.markercluster.js",
                      "~/Scripts/libs/minimap/Control.MiniMap.min.js",
                      "~/Scripts/libs/Control.Loading/Control.Loading.js",
                      "~/Scripts/libs/label/leaflet.label.js",                      
                      "~/Scripts/libs/turfjs/turf.min.js"));

            bundles.Add(new ScriptBundle("~/bundles/esrileaflet").Include(
                      "~/Scripts/libs/esri-leaflet/esri-leaflet.js",
                      "~/Scripts/libs/leaflet/easy-button.js",
                      "~/Scripts/libs/esri-leaflet/esri-leaflet-clustered-feature-layer.js"));

            bundles.Add(new ScriptBundle("~/bundles/app").Include(
                "~/Scripts/app/MainNav.js",
                "~/Scripts/app/Notificaciones.js",
                "~/Scripts/app/Usuarios.js"));

            bundles.Add(new ScriptBundle("~/bundles/appMap").Include(
                "~/Scripts/app/MainMap.js"));

            bundles.Add(new ScriptBundle("~/bundles/appMapValidar").Include(
                "~/Scripts/app/MainValidar.js"));

            bundles.Add(new ScriptBundle("~/bundles/appMapGlobal").Include(
                "~/Scripts/app/Globalconfig.js"));



            bundles.Add(new StyleBundle("~/Content/css").Include(
                      "~/Scripts/libs/bootstrap-3.3.1/dist/css/bootstrap.min.css",
                      "~/Content/css/jquery-iu.css",
                      "~/Scripts/libs/select-bootstrap/bootstrap-select.css",
                      "~/Scripts/libs/bootstrap-switch/css/bootstrap3/bootstrap-switch.min.css",
                      "~/Scripts/libs/BootstrapDialog/css/bootstrap-dialog.min.css"));



            bundles.Add(new StyleBundle("~/Content/Mapcss").Include(
                      "~/Scripts/libs/leaflet/leaflet.css",
                      "~/Scripts/libs/minimap/Control.MiniMap.min.css",
                      "~/Scripts/libs/Control.Loading/Control.Loading.css",
                      "~/Scripts/libs/label/leaflet.label.css",
                      "~/Scripts/libs/cluster/MarkerCluster.css"));

            bundles.Add(new StyleBundle("~/Content/app").Include(
                      "~/Scripts/libs/font-awesome-4.2.0/css/font-awesome.css",
                      "~/Content/css/prettyPhoto.css",
                      "~/Content/css/animate.css",
                      "~/Content/css/main.css",
                      "~/Content/css/bootstrap-nav-wizard.css",
                      "~/Scripts/libs/leaflet_markers/leaflet.awesome-markers.css",
                      "~/Content/site.css"));
        }
    }
}
