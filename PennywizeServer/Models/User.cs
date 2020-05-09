using System.ComponentModel.DataAnnotations.Schema;

namespace PennywizeServer.Models
{
    public class User
    {
        public string Id { get; set; }
        public string OAuthSubject { get; set; }
        public string OAuthIssuer { get; set; }
    }
}