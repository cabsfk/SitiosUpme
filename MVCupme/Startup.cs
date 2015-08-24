using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(MVCupme.Startup))]
namespace MVCupme
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
