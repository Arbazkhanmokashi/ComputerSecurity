#See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER app
WORKDIR /app
EXPOSE 80
EXPOSE 5006

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["ChatApplication.Server/ChatApplication.Server.csproj", "ChatApplication.Server/"]
COPY ["ChatApplication.DataAccess/ChatApplication.DataAccess.csproj", "ChatApplication.DataAccess/"]
COPY ["ChatApplication.Library/ChatApplication.Library.csproj", "ChatApplication.Library/"]
COPY ["ChatApplication.Contracts/ChatApplication.Contracts.csproj", "ChatApplication.Contracts/"]
RUN dotnet restore "./ChatApplication.Server/ChatApplication.Server.csproj"
COPY . .
WORKDIR "/src/ChatApplication.Server"
RUN dotnet build "./ChatApplication.Server.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./ChatApplication.Server.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ChatApplication.Server.dll"]