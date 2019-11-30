using System;

namespace PennywizeServer
{
    public class Transaction
    {
        public string Id {get;set;}
        public DateTime Date {get;set;}
        public double Amount {get;set;}
        public string Type {get;set;}
        public string Description {get;set;}
    }
}