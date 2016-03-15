using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace MetaAnalysisWebApp
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");
           
            //Add this to support breaking the MVC convention of Controller/Action/Parameter
            //So URL-path parameters can be used on the Index function in MetaController. - 20/01/2016

           /* routes.MapRoute("Meta", "{id}",
                new { controller = "Meta", action = "Index" });*/

            routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Meta", action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}