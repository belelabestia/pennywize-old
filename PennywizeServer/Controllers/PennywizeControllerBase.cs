using Microsoft.AspNetCore.Mvc;
using PennywizeServer.Models;

namespace PennywizeServer.Controllers
{
    public class PennywizeControllerBase : ControllerBase
    {
        public User PennywizeUser { get; set; }
    }
}