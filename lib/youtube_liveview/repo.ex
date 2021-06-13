defmodule YoutubeLiveview.Repo do
  use Ecto.Repo,
    otp_app: :youtube_liveview,
    adapter: Ecto.Adapters.Postgres
end
