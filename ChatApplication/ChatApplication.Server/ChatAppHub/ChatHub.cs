using ChatApplication.Contracts.DBModels;
using ChatApplication.DataAccess;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Concurrent;
using System.Text.RegularExpressions;

namespace ChatApplication.Server.ChatAppHub
{
    public class ChatHub : Hub
    {
        private readonly ChatAppContext _context;
        private static ConcurrentDictionary<string, string> Users = new ConcurrentDictionary<string, string>();

        public ChatHub()
        {
        }

        public override async Task OnConnectedAsync()
        {
            var username = Context?.User?.Identity?.Name;

            if (!string.IsNullOrEmpty(username))
            {
                Users[username] = Context.ConnectionId;
                await Clients.All.SendAsync("UserConnected", username);
                await Clients.All.SendAsync("UpdateUserList", Users.Keys.Distinct().ToList());
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            if (Users.TryRemove(Context.ConnectionId, out var username))
            {
                await Clients.All.SendAsync("UserDisconnected", username);
                await Clients.All.SendAsync("UpdateUserList", Users.Values.Distinct().ToList());
            }

            await base.OnDisconnectedAsync(exception);
        }
        public async Task SendMessageToGroup(string groupName, string user, string message)
        {
            await Clients.Group(groupName).SendAsync("ReceiveMessage", user, message);
        }

        public async Task SendMessageToUser(string username, string message)
        {
            if (Users.TryGetValue(username, out var connectionId))
            {
                var senderUsername = Context.User.Identity.Name;
                await Clients.Client(connectionId).SendAsync("ReceivePrivateMessage", senderUsername, message);
            }
        }

        public async Task AddToGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        }

        public async Task RemoveFromGroup(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        }

        //public override async Task OnConnectedAsync()
        //{
        //    var username = Context?.User?.Identity?.Name;
        //    if(String.IsNullOrEmpty(username))
        //    {
        //        return;
        //    }
        //    _userConnections[username] = Context.ConnectionId;

        //    var user = await _context.Users.SingleOrDefaultAsync(u => u.Username == username);
        //    if (user == null)
        //    {
        //        user = new User { Username = username, ConnectionId = Context.ConnectionId };
        //        _context.Users.Add(user);
        //        await _context.SaveChangesAsync();
        //    }
        //    else
        //    {
        //        user.ConnectionId = Context.ConnectionId;
        //        _context.Users.Update(user);
        //        await _context.SaveChangesAsync();
        //    }

        //    await base.OnConnectedAsync();
        //}

        //public override async Task OnDisconnectedAsync(Exception exception)
        //{
        //    var username = Context.User.Identity.Name;
        //    _userConnections.TryRemove(username, out _);

        //    var user = await _context.Users.SingleOrDefaultAsync(u => u.Username == username);
        //    if (user != null)
        //    {
        //        user.ConnectionId = null;
        //        _context.Users.Update(user);
        //        await _context.SaveChangesAsync();
        //    }

        //    await base.OnDisconnectedAsync(exception);
        //}

        //public async Task SendMessageToUser(string receiverUsername, string messageContent)
        //{
        //    if (_userConnections.TryGetValue(receiverUsername, out var connectionId))
        //    {

        //        var message = new Message
        //        {
        //            Sender = Context.User.Identity.Name,
        //            Receiver = receiverUsername,
        //            Content = messageContent,
        //            Timestamp = DateTime.UtcNow
        //        };
        //        _context.Messages.Add(message);
        //        await _context.SaveChangesAsync();

        //        await Clients.Client(connectionId).SendAsync("ReceiveMessage", message.Sender, message.Content);
        //    }
        //}

        //public async Task SendMessageToGroup(string groupName, string messageContent)
        //{
        //    var message = new Message
        //    {
        //        Sender = Context.User.Identity.Name,
        //        GroupName = groupName,
        //        Content = messageContent,
        //        Timestamp = DateTime.UtcNow
        //    };
        //    _context.Messages.Add(message);
        //    await _context.SaveChangesAsync();

        //    await Clients.Group(groupName).SendAsync("ReceiveGroupMessage", message.Sender, message.Content);
        //}

        //public async Task JoinGroup(string groupName)
        //{
        //    var username = Context.User.Identity.Name;
        //    await Groups.AddToGroupAsync(Context.ConnectionId, groupName);

        //    var group = await _context.Groups.SingleOrDefaultAsync(g => g.Name == groupName);
        //    if (group == null)
        //    {
        //        group = new Group { Name = groupName };
        //        _context.Groups.Add(group);
        //        await _context.SaveChangesAsync();
        //    }

        //    var groupUser = new GroupUser { GroupId = group.Id, UserId = _context.Users.Single(u => u.Username == username).Id };
        //    _context.GroupUsers.Add(groupUser);
        //    await _context.SaveChangesAsync();
        //}

        //public async Task LeaveGroup(string groupName)
        //{
        //    var username = Context.User.Identity.Name;
        //    await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);

        //    var group = await _context.Groups.SingleOrDefaultAsync(g => g.Name == groupName);
        //    if (group != null)
        //    {
        //        var groupUser = await _context.GroupUsers.SingleOrDefaultAsync(gu => gu.GroupId == group.Id && gu.UserId == _context.Users.Single(u => u.Username == username).Id);
        //        if (groupUser != null)
        //        {
        //            _context.GroupUsers.Remove(groupUser);
        //            await _context.SaveChangesAsync();
        //        }
        //    }
        //}
    }
}
