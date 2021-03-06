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
         public ActionResult D3Test(string id)
        {
            return View();
        }
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
            columnsExp1.Add(new ColumnsViewModel("Type of post event information", "IND"));
            columnsExp1.Add(new ColumnsViewModel("No. misleading items (per participant)", "2"));
            columnsExp1.Add(new ColumnsViewModel("Type of misleading items", "CON"));
            columnsExp1.Add(new ColumnsViewModel("Type of control items", "NEU"));
            columnsExp1.Add(new ColumnsViewModel("Misinformation manipulation (within/ between)", "within"));
            columnsExp1.Add(new ColumnsViewModel("Correct Memory Misled Warning M", "0.368"));
            columnsExp1.Add(new ColumnsViewModel("Correct Memory Misled Warning n", "72"));
            columnsExp1.Add(new ColumnsViewModel("Correct Memory Control Warning M", "0.472"));
            columnsExp1.Add(new ColumnsViewModel("Correct Memory Control Warning n", "72"));
            StudiesViewModel exp1 = new StudiesViewModel(1, "Belli et al. (1994), Exp. 1", columnsExp1);

            List<ColumnsViewModel> columnsExp2 = new List<ColumnsViewModel>();
            columnsExp2.Add(new ColumnsViewModel("Type of Participants", "STU"));
            columnsExp2.Add(new ColumnsViewModel("Delay between the event & the PEI", "short"));
            columnsExp2.Add(new ColumnsViewModel("Type of post event information", "IND"));
            columnsExp2.Add(new ColumnsViewModel("No. misleading items (per participant)", "2"));
            columnsExp2.Add(new ColumnsViewModel("Type of misleading items", "CON"));
            columnsExp2.Add(new ColumnsViewModel("Type of control items", "NEU"));
            columnsExp2.Add(new ColumnsViewModel("Misinformation manipulation (within/ between)", "within"));
            columnsExp2.Add(new ColumnsViewModel("This column is only in the second row's data", "Test data 2"));
            columnsExp2.Add(new ColumnsViewModel("Correct Memory Misled Warning M", "0.1"));
            columnsExp2.Add(new ColumnsViewModel("Correct Memory Misled Warning n", "77"));
            columnsExp2.Add(new ColumnsViewModel("Correct Memory Control Warning M", "0.16"));
            columnsExp2.Add(new ColumnsViewModel("Correct Memory Control Warning n", "77"));
            columnsExp2.Add(new ColumnsViewModel("False Memory Misled Warning M", "0.21"));
            columnsExp2.Add(new ColumnsViewModel("False Memory Misled Warning n", "77"));
            columnsExp2.Add(new ColumnsViewModel("False Memory Control Warning M", "0.06"));
            columnsExp2.Add(new ColumnsViewModel("False Memory Control Warning n", "77"));
            StudiesViewModel exp2 = new StudiesViewModel(2, "Belli et al. (1994), Exp. 2", columnsExp2);

            List<ColumnsViewModel> columnsExp3 = new List<ColumnsViewModel>();
            columnsExp3.Add(new ColumnsViewModel("Type of Participants", "STU"));
            columnsExp3.Add(new ColumnsViewModel("Delay between the event & the PEI", "medium"));
            columnsExp3.Add(new ColumnsViewModel("Type of post event information", "IND"));
            columnsExp3.Add(new ColumnsViewModel("No. misleading items (per participant)", "4"));
            columnsExp3.Add(new ColumnsViewModel("Type of misleading items", "CON"));
            columnsExp3.Add(new ColumnsViewModel("Type of control items", "ABS"));
            columnsExp3.Add(new ColumnsViewModel("Misinformation manipulation (within/ between)", "within"));
            columnsExp3.Add(new ColumnsViewModel("Correct Memory Misled Warning M", "0.78"));
            columnsExp3.Add(new ColumnsViewModel("Correct Memory Misled Warning n", "22"));
            columnsExp3.Add(new ColumnsViewModel("Correct Memory Control Warning M", "0.78"));
            columnsExp3.Add(new ColumnsViewModel("Correct Memory Control Warning n", "22"));
            columnsExp3.Add(new ColumnsViewModel("False Memory Misled Warning M", "0.22"));
            columnsExp3.Add(new ColumnsViewModel("False Memory Misled Warning n", "22"));
            columnsExp3.Add(new ColumnsViewModel("False Memory Control Warning M", "0.22"));
            columnsExp3.Add(new ColumnsViewModel("False Memory Control Warning n", "22"));
            StudiesViewModel exp3 = new StudiesViewModel(3, "Blank (1998), Exp. 1", columnsExp3);

            List<StudiesViewModel> studies = new List<StudiesViewModel>();
            studies.Add(exp1);
            studies.Add(exp2);
            studies.Add(exp3);
            
            MetaAnalysisAPIViewModel JsonData = new MetaAnalysisAPIViewModel(metaID, studies);

            string json = JsonConvert.SerializeObject(JsonData);

            return Json(JsonData);

        }

    }
}
