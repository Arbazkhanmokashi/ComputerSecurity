using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatApplication.Contracts.DBModels
{
    public class Message
    {
        [Key]
        public Guid MessageId { get; set; }
        public Guid SenderId { get; set; }
        public User Sender { get; set; } = null!; //Required
        public Guid? ReceiverId { get; set; } //optional
        public User? Receiver { get; set; } //optional
        public int? ChatRoomId { get; set; } //optional
        public ChatRoom? ChatRoom { get; set; } //optional
        public List<MessageContent> Content { get; set; } = new List<MessageContent>();
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    public class MessageContent
    {
        [Required]
        public string UserName { get; set; } = null!; //required
        [Required]
        public string Content { get; set; } = null!; //required
    }
}
