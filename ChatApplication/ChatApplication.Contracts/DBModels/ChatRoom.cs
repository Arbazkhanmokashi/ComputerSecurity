using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatApplication.Contracts.DBModels
{
    public class ChatRoom
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public string Name { get; set; } = null!; //required
        public ICollection<ChatRoomUser> ChatRoomUsers { get; set; } = new List<ChatRoomUser>();
        public ICollection<Message> Messages { get; set; } = new List<Message>();
    }

    public class ChatRoomUser
    {
        public Guid UserId { get; set; }
        public User User { get; set; } = null!; //required
        public Guid ChatRoomId { get; set; }
        public ChatRoom ChatRoom { get; set; } = null!;
    }

}
