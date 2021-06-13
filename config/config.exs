# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
use Mix.Config

config :youtube_liveview,
  ecto_repos: [YoutubeLiveview.Repo]

# Configures the endpoint
config :youtube_liveview, YoutubeLiveviewWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "GykjQbuYVp/mXDxx/Rzmp1rmFyjKNdgpZS5cn1DhLBeqJYRDY4XJ8wBXPtogONVy",
  render_errors: [view: YoutubeLiveviewWeb.ErrorView, accepts: ~w(html json), layout: false],
  pubsub_server: YoutubeLiveview.PubSub,
  live_view: [signing_salt: "11Z5m8l4"]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env()}.exs"
