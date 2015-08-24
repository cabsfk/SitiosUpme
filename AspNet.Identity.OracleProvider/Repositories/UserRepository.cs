// Copyright (c) Timm Krause. All rights reserved. See LICENSE file in the project root for license information.

namespace AspNet.Identity.OracleProvider.Repositories
{
    using System;
    using System.Collections.Generic;
    using System.Data;
    using System.Linq;
    using Oracle.ManagedDataAccess.Client;

    internal class UserRepository
    {
        private readonly OracleDataContext _db;

        public UserRepository(OracleDataContext oracleContext)
        {
            _db = oracleContext;
        }

        public string TableName { get { return "MUB_USUARIOS"; } }
        public string IdCol { get { return "ID_USUARIO"; } }
        public string NombreCol { get { return "NOMBRE"; } }
        public string CargoCol { get { return "CARGO"; } }
        public string DireccionCol { get { return "DIRECCION"; } }
        public string TelefonoCol { get { return "TELEFONO"; } }
        public string CelularCol { get { return "CELULAR"; } }
        public string ExtensionCol { get { return "EXTENSION"; } }
        public string FaxCol { get { return "FAX"; } }
        public string EmailCol { get { return "EMAIL"; } }
        public string EstadoCol { get { return "ESTADO"; } }
        public string PwdHashCol { get { return "PWDHASH"; } }

        public string RolesTableName { get { return "MUB_USUARIOS_ROLES"; } }
        private string RolesRolCol { get { return "ID_ROL"; } }
        private string RolesUsuarioCol { get { return "ID_USUARIO"; } }

        private string RolTableName { get { return "MUB_ROL"; } }
        private string RolNombreCol { get { return "NOMBRE"; } }
        private string RolIdCol { get { return "ID_ROL"; } }
        private string RolAplicacionCol { get { return "ID_MODULO"; } }



        public IList<IdentityUser> FindByRole(string roleName)
        {
            var result = _db.ExecuteQuery(
                String.Format("SELECT {10}.{0}, {10}.{1}, {10}.{2}, {10}.{3}, {10}.{4}, {10}.{5}, {10}.{6}, {10}.{7}, {10}.{8}, {10}.{9} " +
                "FROM {10} INNER JOIN {11} t1 ON {10}.{0} = t1.{12} INNER JOIN {14} t2 ON t1.{13} = t2.{15} WHERE t2.{16} = :roleName AND t2.{17} = 1", IdCol, EmailCol, NombreCol, CargoCol, DireccionCol, TelefonoCol, CelularCol, ExtensionCol, FaxCol, EstadoCol, TableName,
                RolesTableName, RolesUsuarioCol, RolesRolCol, RolTableName, RolIdCol, RolNombreCol, RolAplicacionCol),
                new OracleParameter { ParameterName = ":roleName", Value = roleName, Direction = ParameterDirection.Input, OracleDbType = OracleDbType.Varchar2 }
                );
            List<IdentityUser> users = new List<IdentityUser>();
            foreach (var row in result.Rows.Cast<DataRow>())
            {
                users.Add(new IdentityUser
                {
                    Id = row[0].ToString(),
                    Email = row[1].ToString(),
                    Nombre = row[2].ToString(),
                    Cargo = row[3].ToString(),
                    Direccion = row[4].ToString(),
                    Telefono = row[5].ToString(),
                    Celular = row[6].ToString(),
                    Extension = row[7].ToString(),
                    Fax = row[8].ToString(),
                    Estado = int.Parse(row[9].ToString()) == 1
                });
            }
            return users;
        }

        

        public int Insert(IdentityUser user)
        {
            if (user == null)
            {
                throw new ArgumentNullException("user");
            }

            return _db.ExecuteNonQuery(
                "INSERT INTO \""+TableName+"\" ("+PwdHashCol+", "+NombreCol+", "+EmailCol+", "+CargoCol+", " +
                " "+DireccionCol+", "+TelefonoCol+", "+CelularCol+","+ExtensionCol+","+FaxCol+","+EstadoCol+") VALUES " +
                "(:pwdhash, :nombre, :email, :cargo, :direccion," +
                " :telefono, :celular, :extension, :fax, :estado)",
                new OracleParameter { ParameterName = ":pwdhash", Value = user.PwdHash, OracleDbType = OracleDbType.Varchar2, Direction = ParameterDirection.Input },
                new OracleParameter { ParameterName = ":nombre", Value = user.Nombre, OracleDbType = OracleDbType.Varchar2, Direction = ParameterDirection.Input },
                new OracleParameter { ParameterName = ":email", Value = user.Email, OracleDbType = OracleDbType.Varchar2, Direction = ParameterDirection.Input },
                new OracleParameter { ParameterName = ":cargo", Value = user.Cargo, OracleDbType = OracleDbType.Varchar2, Direction = ParameterDirection.Input },
                new OracleParameter { ParameterName = ":direccion", Value = user.Direccion, OracleDbType = OracleDbType.Varchar2, Direction = ParameterDirection.Input },
                new OracleParameter { ParameterName = ":telefono", Value = user.Telefono, OracleDbType = OracleDbType.Varchar2, Direction = ParameterDirection.Input },
                new OracleParameter { ParameterName = ":celular", Value = user.Celular, OracleDbType = OracleDbType.Varchar2, Direction = ParameterDirection.Input },
                new OracleParameter { ParameterName = ":extension", Value = user.Extension, OracleDbType = OracleDbType.Varchar2, Direction = ParameterDirection.Input },
                new OracleParameter { ParameterName = ":fax", Value = user.Fax, OracleDbType = OracleDbType.Varchar2, Direction = ParameterDirection.Input },
                new OracleParameter { ParameterName = ":estado", Value = user.Estado? 1 : 0, OracleDbType = OracleDbType.Int16, Direction = ParameterDirection.Input });
        }

        public int Update(IdentityUser user)
        {
            if (user == null)
            {
                throw new ArgumentNullException("user");
            }
            //lockoutenddateutc = :lockoutenddateutc,
            return _db.ExecuteNonQuery(
                String.Format("UPDATE {0} SET {2} = :nombre, {3} = :cargo, {4} = :direccion, {5} = :telefono, {6} = :celular, {7} = :extension, {8} = :fax, {9} = :estado  WHERE {1} = :userid",
                TableName, IdCol, NombreCol, CargoCol, DireccionCol, TelefonoCol, CelularCol, ExtensionCol, FaxCol, EstadoCol),
                new OracleParameter { ParameterName = ":nombre", Value = user.Nombre, Direction = ParameterDirection.Input, OracleDbType = OracleDbType.Varchar2 },
                new OracleParameter { ParameterName = ":cargo", Value = user.Cargo, Direction = ParameterDirection.Input, OracleDbType = OracleDbType.Varchar2 },
                new OracleParameter { ParameterName = ":direccion", Value = user.Direccion, Direction = ParameterDirection.Input, OracleDbType = OracleDbType.Varchar2 },
                new OracleParameter { ParameterName = ":telefono", Value = user.Telefono, Direction = ParameterDirection.Input, OracleDbType = OracleDbType.Varchar2 },
                new OracleParameter { ParameterName = ":celular", Value = user.Celular, Direction = ParameterDirection.Input, OracleDbType = OracleDbType.Varchar2 },
                new OracleParameter { ParameterName = ":extension", Value = user.Extension, Direction = ParameterDirection.Input, OracleDbType = OracleDbType.Varchar2 },
                new OracleParameter { ParameterName = ":fax", Value = user.Fax, Direction = ParameterDirection.Input, OracleDbType = OracleDbType.Varchar2 },
                new OracleParameter { ParameterName = ":estado", Value = user.Estado ? 1 : 0, Direction = ParameterDirection.Input, OracleDbType = OracleDbType.Int16 },
                new OracleParameter { ParameterName = ":userId", Value = user.Id, Direction = ParameterDirection.Input, OracleDbType = OracleDbType.Int16 }
                );
        }


        // TODO: UPDATE TO USER TABLE
        public int Delete(string userId)
        {
            return _db.ExecuteNonQuery(
                "DELETE FROM users WHERE id = :userid",
                new OracleParameter { ParameterName = ":userid", Value = userId, OracleDbType = OracleDbType.Varchar2, Direction = ParameterDirection.Input });
        }

        public int Delete(IdentityUser user)
        {
            if (user == null)
            {
                throw new ArgumentNullException("user");
            }

            return Delete(user.Id);
        }

        ////public string GetUserName(string userId)
        ////{
        ////    return _db.ExecuteScalarQuery<string>(
        ////        "SELECT name FROM users WHERE id = :id",
        ////        new OracleParameter { ParameterName = ":id", Value = userId, OracleDbType = OracleDbType.Varchar2, Direction = ParameterDirection.Input });
        ////}

        ////public string GetUserId(string userName)
        ////{
        ////    return _db.ExecuteScalarQuery<string>(
        ////       "SELECT id FROM users WHERE username = :name",
        ////       new OracleParameter { ParameterName = ":name", Value = userName, OracleDbType = OracleDbType.Varchar2, Direction = ParameterDirection.Input });
        ////}

        public List<IdentityUser> GetAllUsers()
        {
            var result = _db.ExecuteQuery(
                String.Format("SELECT {0}, {1}, {2}, {3}, {4}, {5}, {6}, {7}, {8}, {9} " +
                "FROM {10}", IdCol, EmailCol, NombreCol, CargoCol, DireccionCol, TelefonoCol, CelularCol, ExtensionCol,FaxCol, EstadoCol, TableName)
                );
            List<IdentityUser> users = new List<IdentityUser>();
            foreach (var row in result.Rows.Cast<DataRow>())
            {
                users.Add(new IdentityUser
                {
                    Id = row[0].ToString(),
                    Email = row[1].ToString(),
                    Nombre = row[2].ToString(),
                    Cargo = row[3].ToString(),
                    Direccion = row[4].ToString(),
                    Telefono = row[5].ToString(),
                    Celular = row[6].ToString(),
                    Extension = row[7].ToString(),
                    Fax = row[8].ToString(),
                    Estado = int.Parse(row[9].ToString()) == 1
                });
            }
            return users;
        }

        public IdentityUser GetUserById(string userId)
        {
            var result = _db.ExecuteQuery(
              "SELECT * FROM \""+TableName+"\" WHERE "+IdCol+" = :id",
              new OracleParameter { ParameterName = ":id", Value = userId, OracleDbType = OracleDbType.Int16, Direction = ParameterDirection.Input });

            var row = result.Rows.Cast<DataRow>().SingleOrDefault();

            if (row != null)
            {
                return new IdentityUser
                {
                    Id = row[IdCol].ToString(),
                    UserName = row[EmailCol].ToString(),
                    PwdHash = row[PwdHashCol].ToString().HasValue() ? row[PwdHashCol].ToString() : null,
                    Estado = int.Parse(row[EstadoCol].ToString()) == 1
                };
            }

            return null;
        }

        public IdentityUser GetUserByIdForDisplay(string userId)
        {
            var result = _db.ExecuteQuery(
              String.Format("SELECT {0}, {1}, {2}, {3}, {4}, {5}, {6}, {7}, {8}, {9} " +
                "FROM {10} WHERE {0} = :id ", IdCol, EmailCol, NombreCol, CargoCol, DireccionCol, TelefonoCol, CelularCol, ExtensionCol,FaxCol, EstadoCol, TableName),
              new OracleParameter { ParameterName = ":id", Value = userId, OracleDbType = OracleDbType.Int16, Direction = ParameterDirection.Input });

            var row = result.Rows.Cast<DataRow>().SingleOrDefault();

            if (row != null)
            {
                return new IdentityUser
                {
                    Id = row[0].ToString(),
                    Email = row[1].ToString(),
                    Nombre = row[2].ToString(),
                    Cargo = row[3].ToString(),
                    Direccion = row[4].ToString(),
                    Telefono = row[5].ToString(),
                    Celular = row[6].ToString(),
                    Extension = row[7].ToString(),
                    Fax = row[8].ToString(),
                    Estado = int.Parse(row[9].ToString()) == 1
                };
            }

            return null;
        
        }

        public ICollection<IdentityUser> GetUserByName(string userName)
        {
            var result = _db.ExecuteQuery(
                "SELECT * FROM \""+TableName+"\" WHERE "+EmailCol+"= :name",
                new OracleParameter { ParameterName = ":name", Value = userName, OracleDbType = OracleDbType.Varchar2, Direction = ParameterDirection.Input });

            return result.Rows.Cast<DataRow>().Select(
                r => new IdentityUser
                {
                    Id = r[IdCol].ToString(),
                    UserName = r[EmailCol].ToString(),
                    PwdHash = r[PwdHashCol].ToString().HasValue() ? r[PwdHashCol].ToString() : null,
                    Estado = int.Parse(r[EstadoCol].ToString()) == 1
                }).ToList();
        }

        public string GetPasswordHash(string userId)
        {
            var passwordHash = _db.ExecuteScalarQuery<string>(
                "SELECT "+PwdHashCol+" FROM \""+TableName+"\" WHERE "+IdCol+" = :id",
                new OracleParameter { ParameterName = ":id", Value = userId, OracleDbType = OracleDbType.Varchar2, Direction = ParameterDirection.Input });

            return passwordHash.HasValue() ? passwordHash : null;
        }

        public IdentityUser GetUserByEmail(string email)
        {
            return null;
        }

        ////public int SetPasswordHash(string userId, string passwordHash)
        ////{
        ////    return _db.ExecuteScalarQuery<int>(
        ////        "UPDATE users SET passwordhash = :passwordhash WHERE id = :id",
        ////        new OracleParameter { ParameterName = ":passwordhash", Value = passwordHash, OracleDbType = OracleDbType.Varchar2, Direction = ParameterDirection.Input },
        ////        new OracleParameter { ParameterName = ":id", Value = userId, OracleDbType = OracleDbType.Varchar2, Direction = ParameterDirection.Input });
        ////}

        ////public string GetSecurityStamp(string userId)
        ////{
        ////    return _db.ExecuteScalarQuery<string>(
        ////        "SELECT securitystamp FROM users WHERE id = :id",
        ////        new OracleParameter { ParameterName = ":id", Value = userId, OracleDbType = OracleDbType.Varchar2, Direction = ParameterDirection.Input });
        ////}
    }
}
