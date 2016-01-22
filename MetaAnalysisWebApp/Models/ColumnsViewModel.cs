using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MetaAnalysisWebApp.Models
{
    public class ColumnsViewModel
    {
        public string ColumnName { get; set; }
        public string Value { get; set; }

        public ColumnsViewModel(string ColumnName, string Value)
        {
            this.ColumnName = ColumnName;
            this.Value = Value;
        }
    }
}