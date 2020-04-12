using System.Collections.Generic;
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
    public class TransactionsController : ControllerBase
    {
        private readonly PennywizeContext _context;

        public TransactionsController(PennywizeContext context)
        {
            _context = context;
        }

        // GET: api/Transactions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Transaction>>> GetTransactions()
        {
            return await _context.Transactions
                .Where(t => t.UserId == GetUserId())
                .ToArrayAsync();
        }

        // GET: api/Transactions/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Transaction>> GetTransaction(string id)
        {
            var transaction = await _context.Transactions.FindAsync(id);

            if (transaction == null)
            {
                return NotFound();
            }

            if (transaction.UserId != GetUserId())
            {
                return Forbid();
            }

            return transaction;
        }

        // PUT: api/Transactions/5
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for
        // more details see https://aka.ms/RazorPagesCRUD.
        [HttpPut("{id}")]
        public async Task<ActionResult> PutTransaction(string id, Transaction transaction)
        {
            if (id != transaction.Id)
            {
                return BadRequest();
            }

            var t = await _context.Transactions
                .AsNoTracking()
                .FirstOrDefaultAsync(tr => tr.Id == id);

            if (t == null)
            {
                return NotFound();
            }

            if (t.UserId != GetUserId())
            {
                return Forbid();
            }

            if (transaction.UserId != null && transaction.UserId != t.UserId)
            {
                return BadRequest();
            }

            transaction.UserId = t.UserId;
            _context.Entry(transaction).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TransactionExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Transactions
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for
        // more details see https://aka.ms/RazorPagesCRUD.
        [HttpPost]
        public async Task<ActionResult<Transaction>> PostTransaction(Transaction transaction)
        {
            if (transaction.UserId != null && transaction.UserId != GetUserId())
            {
                return Forbid();
            }

            transaction.UserId ??= GetUserId();
            _context.Transactions.Add(transaction);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (TransactionExists(transaction.Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetTransaction", new { id = transaction.Id }, transaction);
        }

        // DELETE: api/Transactions/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<Transaction>> DeleteTransaction(string id)
        {
            var transaction = await _context.Transactions.FindAsync(id);
            if (transaction == null)
            {
                return NotFound();
            }

            if (transaction.UserId != GetUserId())
            {
                return Forbid();
            }

            _context.Transactions.Remove(transaction);
            await _context.SaveChangesAsync();

            return transaction;
        }

        private bool TransactionExists(string id)
        {
            return _context.Transactions.Any(e => e.Id == id);
        }

        private string GetUserId()
        {
            return HttpContext.User.Claims.First(c => c.Type == "sub").Value;
        }
    }
}
