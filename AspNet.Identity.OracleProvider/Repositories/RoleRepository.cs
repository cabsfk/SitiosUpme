// Copyright (c) Timm Krause. All rights reserved. See LICENSE file in the project root for license information.

namespace AspNet.Identity.OracleProvider.Repositories
{
    using System;
    using System.Data;
    using Oracle.ManagedDataAccess.Client;
    using System.Collections.Generic;

    internal class RoleRepository
    {
        private readonly OracleDataContext _db;

        public RoleRepository(OracleDataContext oracleContext)
        {
            _db = oracleContext;
        }

        private string TableName { get { return "MUB_ROL"; } }
        private string IdCol { get { return "ID_ROL"; } }
        private string NombreCol { get { return "NOMBRE"; } }
        private string AplicacionCol { get { return "ID_MODULO"; } }


        public int Insert(IdentityRole role)
        {
            if (role == null)
            {
                throw new ArgumentNullException("role");
            }

            return _db.ExecuteNonQuery(
                "INSERT INTO roles (id, name) VALUES (:id, :name)",
                new OracleParameter { ParameterName = ":id", Value = role.Id, OracleDbType = OracleDbType.Varchar2, Direction = ParameterDirection.Input },
                new OracleParameter { ParameterName = ":name", Value = role.Name, OracleDbType = OracleDbType.Varchar2, Direction = ParameterDirection.Input });
        }

        public IList<IdentityRole> GetAll()
        {
            var result = _db.ExecuteQuery("SELECT " + IdCol + ", " + NombreCol + " FROM " + TableName + " WHERE " + AplicacionCol + " = 1");
            var list = new List<IdentityRole>();
            foreach (var row in result.Rows)
            {
                var dr = row as DataRow;
                list.Add(new IdentityRole(dr[1].ToString(), dr[0].ToString()));
            }
            return list;
        }

        public int Update(IdentityRole role)
        {
            if (role == null)
            {
                throw new ArgumentNullException("role");
            }

            return _db.ExecuteNonQuery(
                "UPDATE roles SET name = :name WHERE id = :id",
                new OracleParameter { ParameterName = ":name", Value = role.Name, OracleDbType = OracleDbType.Varchar2, Direction = ParameterDirection.Input },
                new OracleParameter { ParameterName = ":id", Value = role.Id, OracleDbType = OracleDbType.Varchar2, Direction = ParameterDirection.Input });
        }

        public int Delete(string roleId)
        {
            return _db.ExecuteNonQuery(
                "DELETE FROM roles WHERE id = :id",
                new OracleParameter { ParameterName = ":id", Value = roleId, OracleDbType = OracleDbType.Varchar2, Direction = ParameterDirection.Input });
        }

        public string GetRoleName(string roleId)
        {
            return _db.ExecuteScalarQuery<string>(
                "SELECT name FROM roles WHERE id = :id",
                new OracleParameter { ParameterName = ":id", Value = roleId, OracleDbType = OracleDbType.Varchar2, Direction = ParameterDirection.Input });
        }

        public string GetRoleId(string roleName)
        {
            // Verifica que el rol sea de la aplicacion de fondos
            var res = _db.ExecuteScalarQuery(
                String.Format("SELECT {0} FROM {1} WHERE {2} = :name AND {3} = 1", IdCol, TableName, NombreCol, AplicacionCol),
                new OracleParameter { ParameterName = ":name", Value = roleName, OracleDbType = OracleDbType.Varchar2, Direction = ParameterDirection.Input });
            if (res == null || res is DBNull)
            {
                return null;
            }
            return res.ToString();
        }

        public string GetRoleId(string roleName, int appId)
        {
            var res = _db.ExecuteScalarQuery(
               String.Format("SELECT {0} FROM {1} WHERE {2} = :name AND {3} = :app", IdCol, TableName, NombreCol, AplicacionCol),
               new OracleParameter { ParameterName = ":name", Value = roleName, OracleDbType = OracleDbType.Varchar2, Direction = ParameterDirection.Input },
               new OracleParameter { ParameterName = ":app", Value = appId, OracleDbType = OracleDbType.Int16, Direction = ParameterDirection.Input });
            if (res == null || res is DBNull)
            {
                return null;
            }
            return res.ToString();
        }

        public IdentityRole GetRoleById(string roleId)
        {
            var roleName = GetRoleName(roleId);

            return roleName != null ? new IdentityRole(roleName, roleId) : null;
        }

        public IdentityRole GetRoleByName(string roleName)
        {
            var roleId = GetRoleId(roleName);

            return roleId != null ? new IdentityRole(roleName, roleId) : null;
        }
    }
}
