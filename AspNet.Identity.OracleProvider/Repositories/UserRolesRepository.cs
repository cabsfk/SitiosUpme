// Copyright (c) Timm Krause. All rights reserved. See LICENSE file in the project root for license information.

namespace AspNet.Identity.OracleProvider.Repositories
{
    using System;
    using System.Collections.Generic;
    using System.Data;
    using System.Linq;
    using Oracle.ManagedDataAccess.Client;

    internal class UserRolesRepository
    {
        private readonly OracleDataContext _db;

        public UserRolesRepository(OracleDataContext database)
        {
            _db = database;
        }

        private string TableName { get { return "MUB_USUARIOS_ROLES"; } }
        private string RolCol { get { return "ID_ROL"; } }
        private string UsuarioCol { get { return "ID_USUARIO"; } }

        private string RolesTableName { get { return "MUB_ROL"; } }
        private string RolNombreCol { get { return "NOMBRE"; } }
        private string RolesIdCol { get { return "ID_ROL"; } }
        private string RolesAplicacionCol { get { return "ID_MODULO"; } }

        public int Insert(IdentityUser user, string roleId)
        {
            if (user == null)
            {
                throw new ArgumentNullException("user");
            }

            return _db.ExecuteNonQuery(
                "INSERT INTO "+TableName+" ("+UsuarioCol+", "+RolCol+") values (:userid, :roleid)",
                new OracleParameter { ParameterName = ":userid", Value = long.Parse(user.Id), OracleDbType = OracleDbType.Int16, Direction = ParameterDirection.Input },
                new OracleParameter { ParameterName = ":roleid", Value = roleId, OracleDbType = OracleDbType.Int16, Direction = ParameterDirection.Input });
        }

        public void ClearRoles(IdentityUser user)
        {
            _db.ExecuteNonQuery(
                String.Format("DELETE FROM {0} WHERE {1} = :userId AND {2} IN (SELECT {3} FROM {4} WHERE {5} = 1 OR ({5} = 6 AND {6} = 'CREADOR'))", TableName, UsuarioCol, RolCol, RolesIdCol, RolesTableName, RolesAplicacionCol, RolNombreCol),
                new OracleParameter { ParameterName = ":userId", Value = user.Id, OracleDbType = OracleDbType.Int16, Direction = ParameterDirection.Input }
                );
        }



        ////public int Delete(string userId)
        ////{
        ////    return _db.ExecuteScalarQuery<int>(
        ////       "DELETE FROM userroles WHERE userid = :userid",
        ////       new OracleParameter { ParameterName = ":userid", Value = userId, OracleDbType = OracleDbType.Varchar2, Direction = ParameterDirection.Input });
        ////}

        public int Delete(string userId, string roleId)
        {
            return _db.ExecuteNonQuery(
               "DELETE FROM "+TableName+" WHERE "+UsuarioCol+" = :userid AND "+RolCol+" = :roleid",
               new OracleParameter { ParameterName = ":userid", Value = userId, OracleDbType = OracleDbType.Int16, Direction = ParameterDirection.Input },
               new OracleParameter { ParameterName = ":roleid", Value = roleId, OracleDbType = OracleDbType.Int16, Direction = ParameterDirection.Input });
        }

        public int Delete(IdentityUser user, string roleId)
        {
            if (user == null)
            {
                throw new ArgumentNullException("user");
            }

            if (roleId.HasNoValue())
            {
                throw new ArgumentNullException("roleId");
            }

            return Delete(user.Id, roleId);
        }

        public IList<string> FindByUserId(string userId)
        {
            var result = _db.ExecuteQuery(
                "SELECT "+RolesTableName+"."+RolNombreCol+" FROM "+TableName+", "+RolesTableName+" WHERE "+TableName+"."+UsuarioCol+" = :userid AND "+TableName+"."+RolCol+" = "+RolesTableName+"."+RolesIdCol+" AND "+RolesTableName+"."+RolesAplicacionCol + " = 1" ,
                new OracleParameter { ParameterName = ":userid", Value = userId, OracleDbType = OracleDbType.Varchar2, Direction = ParameterDirection.Input });
            var res = result.Rows.Cast<DataRow>().Select(row => row[0].ToString()).ToList();
            return res;
        }
    }
}
