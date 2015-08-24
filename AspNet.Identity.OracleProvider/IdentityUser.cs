// Copyright (c) Timm Krause. All rights reserved. See LICENSE file in the project root for license information.

namespace AspNet.Identity.OracleProvider
{
    using System;
    using Microsoft.AspNet.Identity;

    public class IdentityUser : IUser
    {
        public IdentityUser()
        {
            //Id = Guid.NewGuid().ToString(); //JP
        }

        public IdentityUser(string email)
            : this()
        {
            Email = email;
            UserName = email;
        }

        private string _email;

        public string Id { get; set; }

        public string Email { 
            get 
            {
                return _email;
            }
            set {
                _email = value;
            } 
        }

        public string UserName {
            get
            {
                return _email;
            }
            set
            {
                _email = value;
            }
        }

        public string PwdHash { get; set; }

        public string Nombre { get; set; }

        public string Cargo { get; set; }

        public string Direccion { get; set; }

        public string Telefono { get; set; }

        public string Celular { get; set; }

        public string Extension { get; set; }

        public string Fax { get; set; }

        public bool Estado { get; set; }

        public long ID_ORGANIZACION { get; set; }

        public virtual bool LockoutEnabled { get; set; }

    }
}
