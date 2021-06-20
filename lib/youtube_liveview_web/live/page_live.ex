defmodule YoutubeLiveviewWeb.PageLive do
  use YoutubeLiveviewWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    {:ok, redirect(socket, to: "/video")}
  end
end
