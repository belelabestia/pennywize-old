using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace PennywizeServer.Models
{
    public class Transaction
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public string Id { get; set; }

        public DateTime Date { get; set; }
        public double Amount { get; set; }
        public string Type { get; set; }
        public string Description { get; set; }

        public string UserId { get; set; }
        public User User { get; set; }
    }
}