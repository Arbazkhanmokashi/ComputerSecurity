using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatApplication.Contracts.DTOs.Request
{
    public class GroupLinkDTO
    {
        public string GroupName { get; set; }
        public string RecipientId { get; set; }
    }
}
