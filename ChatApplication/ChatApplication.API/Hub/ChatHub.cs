using System.Reflection;
using Microsoft.AspNetCore.SignalR;

namespace ChatApplication.API.Hub;

public class ChatHub : Microsoft.AspNetCore.SignalR.Hub {

    private readonly IDictionary<string, UserRoomConnection> _connection;

    public ChatHub(IDictionary<string, UserRoomConnection> connection)
    {
        _connection = connection;
    }

    public async Task JoinRoom(UserRoomConnection userConnection)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, userConnection.Room!);
        _connection[Context.ConnectionId] = userConnection;
        await Clients.Group(userConnection.Room!)
        .SendAsync(method:"ReceiveMessage", arg1: "Lets Program Bot", arg2: $"{userConnection.User} has Joined the Group");
        await SendConnectedUser(userConnection.Room!);
    }

    public async Task SendMessage(string message) {
        if(_connection.TryGetValue(Context.ConnectionId, out UserRoomConnection userRoomConnection)){
            await Clients.Group(userRoomConnection.Room!)
            .SendAsync(method: "ReceiveMessage", arg1: userRoomConnection.User, arg2: message, arg3: DateTime.Now);
        }
    }

    public override Task OnDisconnectedAsync(Exception? exp)
    {  
         if (!_connection.TryGetValue(Context.ConnectionId, out UserRoomConnection roomConnection))
      {

        return base.OnDisconnectedAsync(exp);
      }
      Clients.Group(roomConnection.Room!)
      .SendAsync(method: "ReceiveMessage", arg1:"Let's Program Bot", arg2: $"{roomConnection.User} has left the group");
      SendConnectedUser(roomConnection.Room!);
      return base.OnDisconnectedAsync(exp);
    }

    public Task SendConnectedUser(string room)
    {
        var users = _connection.Values
        .Where(u => u.Room == room)
        .Select(s => s.User);
        return Clients.Group(room).SendAsync(method:"ConnectedUser", users); 
    }
}