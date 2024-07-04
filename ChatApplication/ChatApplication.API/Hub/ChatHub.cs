
using Microsoft.AspNetCore.SignalR;

namespace ChatApplicationYT.Hub;
public class ChatHub : Microsoft.AspNetCore.SignalR.Hub
{
       private readonly IDictionary<string, UserRoomConnection> _connection;

    public ChatHub(IDictionary<string, UserRoomConnection> connection)
    {