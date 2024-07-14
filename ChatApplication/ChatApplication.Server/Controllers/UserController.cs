using ChatApplication.Contracts.DTOs.Request;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.Globalization;

namespace ChatApplication.Server.Controllers
{
    [ApiController]
    public class UserController : ControllerBase
    {
        public UserController() { }

        [HttpPost]
        [Route("/api/generate-group-invitation-link")]
        public async Task<IActionResult> GenerateGroupInvitationLink([FromBody] GroupLinkDTO details)
        {
            if(!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                //check for keys in DB first

                //if keys are null, generate new pair
                (string keyString, string keyIVString) = Library.Encryption.Encryption.GenerateKeys();

                if (keyString.IsNullOrEmpty() || keyIVString.IsNullOrEmpty())
                    throw new Exception("Failed to generate keys");

                //add generated keys in DB

                //encryption
                byte[] key = Convert.FromBase64String(keyString);
                byte[] IV = Convert.FromBase64String(keyIVString);

                string value = Library.Encryption.Encryption.EncryptString(details.RecipientId, key, IV);

                string groupLink = $"http://localhost:4200/join-chat?groupname={details.GroupName}&token={value}";
                return Ok(groupLink);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }
    }
}
