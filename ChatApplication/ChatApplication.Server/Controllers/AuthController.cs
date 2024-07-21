using ChatApplication.Library.Authentication;
using ChatApplication.Library.Generic;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using Octokit;
using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

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
            var secret = _configuration["ApplicationSettings:Secret"];
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
                var dict = Utility.ParseQueryString(responseContent);
                var accessToken = dict["access_token"];
                var userDetailsString = await GetGithubUsername(accessToken);
                
                if(userDetailsString != null)
                {
                    var userName = Utility.ExtractValuesByKey(userDetailsString, "login");
                    var encrypterToken = JWTAuth.JWTTokenGenerator(secret, userName);
                    responseContent += "&jwt_token=" + encrypterToken;
                    var jsonResponse = Utility.ParseGithubResponse(responseContent);
                    return Ok(jsonResponse);
                }
                else

                    return StatusCode(StatusCodes.Status500InternalServerError, "Username is null");
            }

            return BadRequest("Error authenticating with GitHub");
        }
        private async Task<String> GetGithubUsername(string accessToken)
        {
            string apiUrl = "https://api.github.com/user";
            var request = new HttpRequestMessage(HttpMethod.Get, apiUrl);

            // Add headers
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            request.Headers.UserAgent.ParseAdd("texter");

            // Send the request
            HttpResponseMessage response = await _httpClient.SendAsync(request);

            // Ensure the request was successful
            if(!response.IsSuccessStatusCode)
            {
                return null;
            }

            // Read and return the response content
            return await response.Content.ReadAsStringAsync();
        }
    }

    public class GitHubAuthRequest
    {
        public string Code { get; set; }
    }
}
