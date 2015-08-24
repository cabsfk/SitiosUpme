// Copyright (c) Timm Krause. All rights reserved. See LICENSE file in the project root for license information.

namespace AspNet.Identity.OracleProvider
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Security.Claims;
    using System.Threading.Tasks;
    using Microsoft.AspNet.Identity;
    using Repositories;
    using Exceptions;

    public class UserStore :
        IUserStore<IdentityUser>,
        IUserLoginStore<IdentityUser>,
        IUserRoleStore<IdentityUser>,
        IUserPasswordStore<IdentityUser>,
        IUserEmailStore<IdentityUser>,
        IUserLockoutStore<IdentityUser, string>,
        IUserTwoFactorStore<IdentityUser, string>,
        IQueryableUserStore<IdentityUser, string>
    {
        private readonly UserRepository _userRepository;
        private readonly UserLoginsRepository _userLoginsRepository;
        private readonly RoleRepository _roleRepository;
        private readonly UserRolesRepository _userRolesRepository;

        public IQueryable<IdentityUser> Users
        {
            get
            {
                return _userRepository.GetAllUsers().AsQueryable();
            }
        }

        public UserStore()
            : this(new OracleDataContext())
        {
        }

        public UserStore(OracleDataContext database)
        {
            // TODO: Compare with EntityFramework provider.
            Database = database;

            _userRepository = new UserRepository(database);
            _roleRepository = new RoleRepository(database);
            _userRolesRepository = new UserRolesRepository(database);
            _userLoginsRepository = new UserLoginsRepository(database);
        }

        public OracleDataContext Database { get; private set; }

        public Task CreateAsync(IdentityUser user)
        {
            if (user == null)
            {
                throw new ArgumentNullException("user");
            }

            _userRepository.Insert(user);

            return Task.FromResult<object>(null);
        }

        public Task DeleteAsync(IdentityUser user)
        {
            if (user != null)
            {
                _userRepository.Delete(user);
            }

            return Task.FromResult<object>(null);
        }

        public Task<IdentityUser> FindByIdAsync(string userId)
        {
            if (userId.HasNoValue())
            {
                throw new ArgumentException("userId");
            }

            var result = _userRepository.GetUserById(userId);

            return Task.FromResult(result);
        }

        public IdentityUser FindById(string userId)
        {
            if (userId.HasNoValue())
            {
                throw new ArgumentException("userId");
            }

            var result = _userRepository.GetUserByIdForDisplay(userId);

            return result;
        }

        public Task<IdentityUser> FindByNameAsync(string userName)
        {
            if (userName.HasNoValue())
            {
                throw new ArgumentException("userName");
            }

            var result = _userRepository.GetUserByName(userName).SingleOrDefault();

            return Task.FromResult(result);
        }

        public Task UpdateAsync(IdentityUser user)
        {
            if (user == null)
            {
                throw new ArgumentNullException("user");
            }

            _userRepository.Update(user);

            return Task.FromResult<object>(null);
        }

        public Task AddClaimAsync(IdentityUser user, Claim claim)
        {
            if (user == null)
            {
                throw new ArgumentNullException("user");
            }

            if (claim == null)
            {
                throw new ArgumentNullException("claim");
            }


            return Task.FromResult<object>(null);
        }

        public Task<IList<Claim>> GetClaimsAsync(IdentityUser user)
        {
            if (user == null)
            {
                throw new ArgumentNullException("user");
            }


            return Task.FromResult<IList<Claim>>(null);
        }

        public Task RemoveClaimAsync(IdentityUser user, Claim claim)
        {
            if (user == null)
            {
                throw new ArgumentNullException("user");
            }

            if (claim == null)
            {
                throw new ArgumentNullException("claim");
            }


            return Task.FromResult<object>(null);
        }

        public Task AddLoginAsync(IdentityUser user, UserLoginInfo login)
        {
            if (user == null)
            {
                throw new ArgumentNullException("user");
            }

            if (login == null)
            {
                throw new ArgumentNullException("login");
            }

            _userLoginsRepository.Insert(user, login);

            return Task.FromResult<object>(null);
        }

        public Task<IdentityUser> FindAsync(UserLoginInfo login)
        {
            if (login == null)
            {
                throw new ArgumentNullException("login");
            }

            var userId = _userLoginsRepository.FindUserIdByLogin(login);

            if (userId != null)
            {
                var user = _userRepository.GetUserById(userId);

                if (user != null)
                {
                    return Task.FromResult(user);
                }
            }

            return Task.FromResult<IdentityUser>(null);
        }

        public Task<IList<UserLoginInfo>> GetLoginsAsync(IdentityUser user)
        {
            if (user == null)
            {
                throw new ArgumentNullException("user");
            }

            var userLogins = _userLoginsRepository.FindByUserId(user.Id);

            return Task.FromResult(userLogins);
        }

        public Task RemoveLoginAsync(IdentityUser user, UserLoginInfo login)
        {
            if (user == null)
            {
                throw new ArgumentNullException("user");
            }

            if (login == null)
            {
                throw new ArgumentNullException("login");
            }

            _userLoginsRepository.Delete(user, login);

            return Task.FromResult<object>(null);
        }

        public Task AddToRoleAsync(IdentityUser user, string role)
        {
            if (user == null)
            {
                throw new ArgumentNullException("user");
            }

            if (role.HasNoValue())
            {
                throw new ArgumentNullException("role");
            }

            // Clear previous roles
            _userRolesRepository.ClearRoles(user);

            var roleId = _roleRepository.GetRoleId(role);

            if (roleId != null || roleId.HasValue())
            {
                _userRolesRepository.Insert(user, roleId);
                if (role.Equals("ADMIN") || role.Equals("EVALUADOR") || role.Equals("REGISTRADOR"))
                {
                    // 6 es el ID de la aplicacion de centros poblados
                    var centrosPobladosRole = _roleRepository.GetRoleId("CREADOR", 6);
                    if (centrosPobladosRole != null || centrosPobladosRole.HasValue())
                    {
                        _userRolesRepository.Insert(user, centrosPobladosRole);
                    }
                }
            }

            return Task.FromResult<object>(null);
        }

        public Task<IList<string>> GetRolesAsync(IdentityUser user)
        {
            if (user == null)
            {
                throw new ArgumentNullException("user");
            }

            var roles = _userRolesRepository.FindByUserId(user.Id);

            return Task.FromResult(roles);
        }

        public Task<IList<IdentityUser>> FindByRole(string roleName)
        {
            var users = _userRepository.FindByRole(roleName);
            return Task.FromResult(users);
        }

        public Task<bool> IsInRoleAsync(IdentityUser user, string role)
        {
            if (user == null)
            {
                throw new ArgumentNullException("user");
            }

            if (role.HasNoValue())
            {
                throw new ArgumentNullException("role");
            }

            var roles = _userRolesRepository.FindByUserId(user.Id);

            return Task.FromResult(roles != null && roles.Contains(role));
        }

        public Task RemoveFromRoleAsync(IdentityUser user, string role)
        {
            if (user == null)
            {
                throw new ArgumentNullException("user");
            }

            if (role.HasNoValue())
            {
                throw new ArgumentNullException("role");
            }

            var roleId = _roleRepository.GetRoleId(role);

            if (roleId.HasValue())
            {
                _userRolesRepository.Delete(user, roleId);
            }

            return Task.FromResult<object>(null);
        }

        public Task<string> GetPasswordHashAsync(IdentityUser user)
        {
            if (user == null)
            {
                throw new ArgumentNullException("user");
            }

            var passwordHash = _userRepository.GetPasswordHash(user.Id);

            return Task.FromResult(passwordHash);
        }

        public Task<bool> HasPasswordAsync(IdentityUser user)
        {
            if (user == null)
            {
                throw new ArgumentNullException("user");
            }

            var hasPassword = _userRepository.GetPasswordHash(user.Id).HasValue();

            return Task.FromResult(hasPassword);
        }

        public Task SetPasswordHashAsync(IdentityUser user, string passwordHash)
        {
            if (user == null)
            {
                throw new ArgumentNullException("user");
            }

            user.PwdHash = passwordHash;

            return Task.FromResult<object>(null);
        }

        /// <summary>
        /// Set email on user
        /// </summary>
        /// <param name="user"></param>
        /// <param name="email"></param>
        /// <returns></returns>
        public Task SetEmailAsync(IdentityUser user, string email)
        {
            user.Email = email;
            _userRepository.Update(user);

            return Task.FromResult(0);

        }

        /// <summary>
        /// Get email from user
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        public Task<string> GetEmailAsync(IdentityUser user)
        {
            return Task.FromResult(user.Email);
        }

        /// <summary>
        /// Get if user email is confirmed
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        public Task<bool> GetEmailConfirmedAsync(IdentityUser user)
        {
            return Task.FromResult(true);
        }

        /// <summary>
        /// Set when user email is confirmed
        /// </summary>
        /// <param name="user"></param>
        /// <param name="confirmed"></param>
        /// <returns></returns>
        public Task SetEmailConfirmedAsync(IdentityUser user, bool confirmed)
        {
            return Task.FromResult(0);
        }

        /// <summary>
        /// Get user by email
        /// </summary>
        /// <param name="email"></param>
        /// <returns></returns>
        public Task<IdentityUser> FindByEmailAsync(string email)
        {
            if (String.IsNullOrEmpty(email))
            {
                throw new ArgumentNullException("email");
            }

            IdentityUser result = _userRepository.GetUserByEmail(email);
            if (result != null)
            {
                return Task.FromResult<IdentityUser>(result);
            }

            return Task.FromResult<IdentityUser>(null);
        }

        /// <summary>
        /// Get failed access count
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        public Task<int> GetAccessFailedCountAsync(IdentityUser user)
        {
            return Task.FromResult(0);
        }

        /// <summary>
        /// Reset failed access count
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        public Task ResetAccessFailedCountAsync(IdentityUser user)
        {
            return Task.FromResult(0);
        }


        /// <summary>
        /// Increment failed access count
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        public Task<int> IncrementAccessFailedCountAsync(IdentityUser user)
        {
            return Task.FromResult(0);
        }

        /// <summary>
        /// Set user phone number
        /// </summary>
        /// <param name="user"></param>
        /// <param name="phoneNumber"></param>
        /// <returns></returns>
        public Task SetPhoneNumberAsync(IdentityUser user, string phoneNumber)
        {
            user.Telefono = phoneNumber;
            _userRepository.Update(user);

            return Task.FromResult(0);
        }

        /// <summary>
        /// Get user phone number
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        public Task<string> GetPhoneNumberAsync(IdentityUser user)
        {
            return Task.FromResult(user.Telefono);
        }

        /// <summary>
        /// Get if user phone number is confirmed
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        public Task<bool> GetPhoneNumberConfirmedAsync(IdentityUser user)
        {
            return Task.FromResult(true);
        }

        /// <summary>
        /// Set phone number if confirmed
        /// </summary>
        /// <param name="user"></param>
        /// <param name="confirmed"></param>
        /// <returns></returns>
        public Task SetPhoneNumberConfirmedAsync(IdentityUser user, bool confirmed)
        {
            return Task.FromResult(0);
        }

        /// <summary>
        /// Set two factor authentication is enabled on the user
        /// </summary>
        /// <param name="user"></param>
        /// <param name="enabled"></param>
        /// <returns></returns>
        public Task SetTwoFactorEnabledAsync(IdentityUser user, bool enabled)
        {
            return Task.FromResult(0);
        }

        /// <summary>
        /// Get if two factor authentication is enabled on the user
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        public Task<bool> GetTwoFactorEnabledAsync(IdentityUser user)
        {
            return Task.FromResult(false);
        }

        /// <summary>
        ///  Set security stamp
        /// </summary>
        /// <param name="user"></param>
        /// <param name="stamp"></param>
        /// <returns></returns>
        public Task SetSecurityStampAsync(IdentityUser user, string stamp)
        {

            return Task.FromResult(0);

        }

        /// <summary>
        /// Get security stamp
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        public Task<string> GetSecurityStampAsync(IdentityUser user)
        {
            return Task.FromResult("");
        }


        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (disposing)
            {
                if (Database != null)
                {
                    Database.Dispose();
                    Database = null;
                }
            }
        }


        public Task<bool> GetLockoutEnabledAsync(IdentityUser user)
        {
            return Task.FromResult(user.LockoutEnabled);
            //throw new NotImplementedException();
        }

        public Task<DateTimeOffset> GetLockoutEndDateAsync(IdentityUser user)
        {
            throw new NotImplementedException();
        }

        public Task SetLockoutEnabledAsync(IdentityUser user, bool enabled)
        {
            user.LockoutEnabled = enabled;
            //_userRepository.Update(user);

            return Task.FromResult(0);
        }

        public Task SetLockoutEndDateAsync(IdentityUser user, DateTimeOffset lockoutEnd)
        {
            throw new NotImplementedException();
        }
    }
}
