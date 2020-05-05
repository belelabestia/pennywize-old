using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PennywizeServer.Models;

namespace PennywizeServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    [RegisteredUser]
    public class UserDataController : PennywizeControllerBase
    {
        private readonly PennywizeContext _context;
        public UserDataController(PennywizeContext context) => _context = context;

        [HttpGet]
        public async Task<ActionResult<UserData>> GetUserData()
        {
            var transactions = await _context.Transactions
                .Where(t => t.UserId == PennywizeUser.Id)
                .ToListAsync();

            return new UserData
            {
                User = PennywizeUser,
                Transactions = transactions
            };
        }

        [HttpPost]
        [AllowNonRegistered]
        public async Task<ActionResult<UserRegistration>> TryRegisterUser()
        {
            if (PennywizeUser.Id != null) return UserRegistration.AlreadyRegistered;

            _context.Users.Add(PennywizeUser);

            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateException)
            {
                if (UserExists(PennywizeUser.Id)) return Conflict();
                else throw;
            }

            return UserRegistration.JustRegistered;
        }

        [HttpDelete]
        public async Task<ActionResult<UserData>> DeleteUserData()
        {
            var transactions = _context.Transactions.Where(t => t.UserId == PennywizeUser.Id);
            _context.Transactions.RemoveRange(transactions);

            _context.Users.Remove(PennywizeUser);
            await _context.SaveChangesAsync();

            return Ok();
        }

        private bool UserExists(string id) => _context.Users.Any(e => e.Id == id);
    }
}
