using System.Collections.Generic;

namespace PennywizeServer.Models
{
    public class UserData
    {
        public User User { get; set; }
        public IEnumerable<Transaction> Transactions { get; set; }
    }
}