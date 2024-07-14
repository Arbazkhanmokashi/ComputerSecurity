using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatApplication.Contracts.DBModels
{
    public class Message
    {
        public int MessageId { get; set; }
        public int SenderId { get; set; }
        public User Sender { get; set; }
        public int? ReceiverId { get; set; }
        public User Receiver { get; set; }
        public int? ChatRoomId { get; set; }
        public ChatRoom ChatRoom { get; set; }
        public List<MessageContent> Content { get; set; } = new List<MessageContent>();
        public DateTime Timestamp { get; set; }
    }

    public class MessageContent
    {
        public string UserName { get;set; }
        public string Content { get; set; }
    }
}
