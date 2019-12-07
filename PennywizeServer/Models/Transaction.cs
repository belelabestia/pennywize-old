using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace PennywizeServer
{
    public class Transaction
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public string Id { get; set; }
        public DateTime Date { get; set; }
        public double Amount { get; set; }
        public string Type { get; set; }
        public string Description { get; set; }
    }
}