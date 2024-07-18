using ChatApplication.Library.Generic;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using System.Text;

namespace ChatApplication.Server.Controllers
{
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        public AuthController(IConfiguration configuration, HttpClient httpClient)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        [HttpPost]
        [Route("/api/auth/github")]
        public async Task<IActionResult> GitHubAuth([FromBody] GitHubAuthRequest request)
        {
            var clientId = _configuration["ApplicationSettings:GitHubClientId"];
            var clientSecret = _configuration["ApplicationSettings:GitHubClientSecret"];
            var code = request.Code;

            var payload = new
            {
                client_id = clientId,
                client_secret = clientSecret,
                code = code
            };

            var content = new StringContent(System.Text.Json.JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync("https://github.com/login/oauth/access_token", content);
            var responseContent = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
            {
                var jsonResponse = Utility.ParseGithubResponse(responseContent);
                return Ok(jsonResponse);
            }

            return BadRequest("Error authenticating with GitHub");
        }
    }

    public class GitHubAuthRequest
    {
        public string Code { get; set; }
    }
}
