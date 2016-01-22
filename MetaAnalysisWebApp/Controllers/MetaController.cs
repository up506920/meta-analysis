﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using MetaAnalysisWebApp.Models;
using Newtonsoft.Json;

namespace MetaAnalysisWebApp.Controllers
{
    public class MetaController : Controller
    {
        //
        // GET: /Meta/

        public ActionResult Index(string id)
        {
            if (id == null)
            {
                //No ID - raise exception and go to custom error page
                /*
                Console.WriteLine("User tried to access meta-analysis page with no ID at {0}.", DateTime.Now);
                throw new ArgumentException("Meta-analysis ID missing", "ID");
                 */

                id = "test";
            }

            ViewBag.ID = id;
            return View();
        }

        public ActionResult Test(string id)
        {
            //Test JSON data being sent from the "API" after AJAX request
            int metaID;

            if (Int32.TryParse(id, out metaID))
            {
                Console.WriteLine(metaID + " parsed successfully");
            }
            else
            {
                return Json("Error parsing Meta ID");
            }

            List<ColumnsViewModel> columnsExp1 = new List<ColumnsViewModel>();
            columnsExp1.Add(new ColumnsViewModel("Type of Participants", "STU"));
            columnsExp1.Add(new ColumnsViewModel("Delay between the event & the PEI", "short"));
            StudiesViewModel exp1 = new StudiesViewModel(1, "Belli et al. (1994), Exp. 1", columnsExp1);

            List<ColumnsViewModel> columnsExp2 = new List<ColumnsViewModel>();
            columnsExp2.Add(new ColumnsViewModel("Type of Participants", "STU"));
            columnsExp2.Add(new ColumnsViewModel("Delay between the event & the PEI", "medium"));
            StudiesViewModel exp2 = new StudiesViewModel(2, "Blank (1998), Exp. 1", columnsExp2);

            List<StudiesViewModel> studies = new List<StudiesViewModel>();
            studies.Add(exp1);
            studies.Add(exp2);
            
            MetaAnalysisAPIViewModel JsonData = new MetaAnalysisAPIViewModel(metaID, studies);

            string json = JsonConvert.SerializeObject(JsonData);

            return Json(JsonData);

        }

    }
}
