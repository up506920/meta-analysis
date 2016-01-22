using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MetaAnalysisWebApp.Models
{
    public class StudiesViewModel
    {
        public int ExperimentID { get; set; }
        public string ExperimentName { get; set; }
        public List<ColumnsViewModel> Columns { get; set; }

        public StudiesViewModel(int ExperimentID, string ExperimentName, List<ColumnsViewModel> Columns)
        {
            this.ExperimentID = ExperimentID;
            this.ExperimentName = ExperimentName;
            this.Columns = Columns;
        }
    }
}