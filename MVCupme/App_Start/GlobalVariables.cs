using MVCupme.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data.Entity;

namespace MVCupme.Controllers
{
    public class GlobalVariables
    {
        private const int cod_modulo = 7;

        // read-write variable
        public static string idUsuario
        {

            get
            {
                return HttpContext.Current.Application["idUsuario"] as string;
            }
            set
            {
                HttpContext.Current.Application["idUsuario"] = value;
            }
        }
        public static int idModulo
        {

            get
            {
                return cod_modulo;
            }

        }

        public static Boolean Acceso(string rol)
        {
            //var tmp = dbUsr.MUB_USUARIOS_ROLES.Include(m => m.sdf).Where(u => u.ID_USUARIO == Convert.ToInt32(idUsuario));
            //
            //var date = new Class().GetFirstInMonth(DateTime dt); 
            CxUsr dbUsr = new CxUsr();
            bool ok = false;
            long idusr = Convert.ToInt32(idUsuario);
            var tmp = dbUsr.MUB_USUARIOS_ROLES.Where(u => u.ID_USUARIO == idusr).Include(m => m.MUB_ROL).Where(r => r.MUB_ROL.ID_MODULO == idModulo).Include(d => d.MUB_ROL.MUB_MODULOS);
            foreach (var item in tmp)
            {
                string nom_rol = item.MUB_ROL.NOMBRE.ToString();
                if (rol == nom_rol)
                {
                    ok = true;
                }
            }

            return ok;
        }


    }
}