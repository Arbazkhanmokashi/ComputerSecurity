using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatApplication.Contracts.DBModels
{
    public class ChatRoom
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public ICollection<ChatRoomUser> ChatRoomUsers { get; set; }
        public ICollection<Message> Messages { get; set; }
    }

    public class ChatRoomUser
    {
        public int UserId { get; set; }
        public User User { get; set; }
        public int ChatRoomId { get; set; }
        public ChatRoom ChatRoom { get; set; }
    }

}
