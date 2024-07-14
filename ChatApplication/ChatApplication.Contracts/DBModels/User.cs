using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatApplication.Contracts.DBModels
{
    public class User
    {
        public int UserId { get; set; }
        public string Username { get; set; }
        public ICollection<Message> MessagesSent { get; set; }
        public ICollection<Message> MessagesReceived { get; set; }
        public ICollection<ChatRoomUser> ChatRoomUsers { get; set; }
    }

}
