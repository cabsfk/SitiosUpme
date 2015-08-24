// Copyright (c) Timm Krause. All rights reserved. See LICENSE file in the project root for license information.

namespace AspNet.Identity.OracleProvider
{
    using System;
    using Microsoft.AspNet.Identity;

    public class IdentityRole : IRole
    {
        public IdentityRole()
        {
            //Id = Guid.NewGuid().ToString();
        }

        public IdentityRole(string name)
            : this()
        {
            Nombre = name;
        }

        public IdentityRole(string name, string id)
        {
            Nombre = name;
            Id = id;
        }

        public string Id { get; set; }

        public string Name
        {
            get
            {
                return Nombre;
            }
            set
            {
                Nombre = value;
            }
        }

        public string Nombre { get; set; }

        public int Aplicacion { get; set; }
    }
}
