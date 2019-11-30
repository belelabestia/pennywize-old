using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PennywizeServer.Models;

namespace PennywizeServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TransactionsController : ControllerBase
    {
        private readonly PennywizeContext _context;

        public TransactionsController(PennywizeContext context)
        {
            _context = context;
        }

        // GET: api/Transactions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Transaction>>> GetTransaction()
        {
            // return await _context.Transaction.ToListAsync();
            return new List<Transaction>
            {
                new Transaction
                {
                    Id = "hfsduohfcunct",
                    Date = DateTime.Now,
                    Amount = 20,
                    Type = "svago",
                    Description = "buttane"
                },
                new Transaction {
                    Id = "gfdskt0utve4cf2r",
                    Date = DateTime.Now,
                    Amount = 50,
                    Type = "svago",
                    Description = "bocchini"
                },
                new Transaction {
                    Id = "4uf3u60934u609f54",
                    Date = DateTime.Now,
                    Amount = 29040,
                    Type = "svago",
                    Description = "poker"
                },
            };
        }

        // GET: api/Transactions/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Transaction>> GetTransaction(string id)
        {
            var transaction = await _context.Transaction.FindAsync(id);

            if (transaction == null)
            {
                return NotFound();
            }

            return transaction;
        }

        // PUT: api/Transactions/5
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for
        // more details see https://aka.ms/RazorPagesCRUD.
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTransaction(string id, Transaction transaction)
        {
            if (id != transaction.Id)
            {
                return BadRequest();
            }

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
            _context.Transaction.Add(transaction);
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
            var transaction = await _context.Transaction.FindAsync(id);
            if (transaction == null)
            {
                return NotFound();
            }

            _context.Transaction.Remove(transaction);
            await _context.SaveChangesAsync();

            return transaction;
        }

        private bool TransactionExists(string id)
        {
            return _context.Transaction.Any(e => e.Id == id);
        }
    }
}
