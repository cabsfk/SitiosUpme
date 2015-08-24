using MVCupme.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Data;
using System.Data.Entity;

namespace MVCupme.Controllers
{
    public class HomeController : Controller
    {
        private CxUsr dbUsr = new CxUsr();
        public ActionResult Index()
        {
            if (User.Identity.IsAuthenticated == true)
            {

                var usr_actual = User.Identity.Name.ToString();
                foreach (var item in dbUsr.MUB_USUARIOS.Where(u => u.EMAIL == usr_actual.ToString()))
                {
                    GlobalVariables.idUsuario = item.ID_USUARIO.ToString();
                }
            }
            else
            {
                GlobalVariables.idUsuario = "";
            }
            return View();
        }

        public ActionResult Validar()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult UsrOrgJson(long? idusuario)
        {
            var ResultadoQuery = dbUsr.MUB_USUARIOS.Include(s => s.MUB_ORGANIZACIONES).Where(u => u.ID_USUARIO == idusuario).Select(c => new
            {
                idusuario = c.ID_USUARIO,
                nombre = c.NOMBRE,
                idorganizacion = c.ID_ORGANIZACION,
                organizacion = c.MUB_ORGANIZACIONES.RAZON_SOCIAL
            });
            return Json(ResultadoQuery
                , JsonRequestBehavior.AllowGet);
        }

        public ActionResult UsrRolJson(long? idusuario)
        {
            var ResultadoQuery = dbUsr.MUB_USUARIOS_ROLES.Where(u => u.ID_USUARIO == idusuario).Include(m => m.MUB_ROL).Where(r => r.MUB_ROL.ID_MODULO == GlobalVariables.idModulo).Include(d => d.MUB_ROL.MUB_MODULOS).Include(u => u.MUB_USUARIOS).Select(c => new
            {
                idusuario = c.ID_USUARIO,
                nombre = c.MUB_USUARIOS.NOMBRE,
                rol = c.MUB_ROL.NOMBRE
            });
            return Json(ResultadoQuery
                , JsonRequestBehavior.AllowGet);
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }
        public ActionResult Crear()
        {
            ViewBag.Message = "Pagina de mapa.";

            return View();
        }
    }
}