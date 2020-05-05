namespace PennywizeServer.Models
{
    public abstract class UserRegistration
    {
        public static UserRegistration JustRegistered => new JustRegisteredUserRegistration();
        public static UserRegistration AlreadyRegistered => new AlreadyRegisteredUserRegistration();
    }

    public class JustRegisteredUserRegistration : UserRegistration
    {
        public new bool JustRegistered => true;
    }

    public class AlreadyRegisteredUserRegistration : UserRegistration
    {
        public new bool AlreadyRegistered => true;
    }
}