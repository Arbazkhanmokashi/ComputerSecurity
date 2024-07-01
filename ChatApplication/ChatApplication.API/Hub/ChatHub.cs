namespace ChatApplication.API.Hub;

public class ChatHub : Microsoft.AspNetCore.SignalR.Hub {

    public async Task JoinRoom(UserRoomConnection userConnection)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, userConnection.Room!);
    }
}