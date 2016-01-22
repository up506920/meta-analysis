using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MetaAnalysisWebApp.Models
{
    //Model to store Meta-Analysis ID, an array of study IDs to include from the import,
    //An array of Column IDs to use, and an array of interpretations to use from the column IDs
    public class MetaAnalysis
    {
        public int ID { get; set; }
        public Array StudiesToUse { get; set; }
        public Array ColumnsToUse { get; set; }
        public Array InterpretationsToUse { get; set; }
    }
}