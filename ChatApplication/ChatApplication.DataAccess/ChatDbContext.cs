using ChatApplication.Contracts.DBModels;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Emit;
using System.Text;
using System.Text.Json.Serialization;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace ChatApplication.DataAccess
{
    public class ChatAppContext : DbContext
    {
        public ChatAppContext(DbContextOptions<ChatAppContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<ChatRoom> ChatRooms { get; set; }
        public DbSet<ChatRoomUser> ChatRoomUsers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ChatRoomUser>()
                .HasKey(gu => new { gu.UserId, gu.ChatRoomId });

            modelBuilder.Entity<ChatRoomUser>()
                .HasOne(gu => gu.User)
                .WithMany(u => u.ChatRoomUsers)
                .HasForeignKey(gu => gu.UserId);

            modelBuilder.Entity<ChatRoomUser>()
                .HasOne(gu => gu.ChatRoom)
                .WithMany(g => g.ChatRoomUsers)
                .HasForeignKey(gu => gu.ChatRoomId);

            modelBuilder.Entity<Message>()
                .HasOne(gu => gu.Sender)
                .WithMany(g => g.MessagesSent)
                .HasForeignKey(gu => gu.SenderId);

            modelBuilder.Entity<Message>()
                .Property(p => p.Content)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, new JsonSerializerOptions { DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull }),
                    v => JsonSerializer.Deserialize<List<MessageContent>>(v, new JsonSerializerOptions { PropertyNameCaseInsensitive = true })
                )
                .HasColumnType("jsonb")
                .IsRequired();
        }
    }

}
