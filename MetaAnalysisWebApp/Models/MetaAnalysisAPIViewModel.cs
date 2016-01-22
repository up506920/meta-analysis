using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MetaAnalysisWebApp.Models
{
    //For testing 21/01/2016
    public class MetaAnalysisAPIViewModel
    {
        public int MetaID { get; set; }
        public List<StudiesViewModel> Studies { get; set; }

        public MetaAnalysisAPIViewModel(int MetaID, List<StudiesViewModel> Studies)
        {
            this.MetaID = MetaID;
            this.Studies = Studies;
        }
    }
}