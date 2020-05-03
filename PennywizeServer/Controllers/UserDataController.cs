using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PennywizeServer.Models;

namespace PennywizeServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserDataController : ControllerBase
    {
        private readonly PennywizeContext _context;

        public UserDataController(PennywizeContext context) => _context = context;

        [HttpGet]
        public async Task<ActionResult<UserData>> GetUserData()
        {
            var oauthId = User.Claims.FirstOrDefault(c => c.Type == "sub").Value;
            var oauthIssuer = User.Claims.FirstOrDefault(c => c.Type == "iss").Value;

            var user = await _context.Users.FirstOrDefaultAsync(u => u.OAuthIssuer == oauthIssuer && u.OAuthSubject == oauthId);

            if (user == null) return NotFound();

            var transactions = _context.Transactions.Where(t => t.UserId == user.Id);

            return new UserData
            {
                User = user,
                Transactions = transactions
            };
        }

        [HttpPost]
        public async Task<ActionResult<User>> PostUser(User user)
        {
            _context.Users.Add(user);
            
            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateException)
            {
                if (UserExists(user.Id)) return Conflict();
                else throw;
            }

            return CreatedAtAction("GetUser", new { id = user.Id }, user);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<UserData>> DeleteUserData(string id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null) return NotFound();

            var transactions = _context.Transactions.Where(t => t.UserId == id);
            _context.Transactions.RemoveRange(transactions);

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok();
        }

        private bool UserExists(string id) => _context.Users.Any(e => e.Id == id);
    }
}
