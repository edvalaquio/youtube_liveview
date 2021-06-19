defmodule YoutubeLiveviewWeb.VideoLive do
  use YoutubeLiveviewWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    YoutubeLiveviewWeb.Endpoint.subscribe("room:abc123")

    assigns = [
      data: "",
      embedded_link: create_embedded_link("https://www.youtube.com/watch?v=0eIY5b0RKE0")
    ]

    {
      :ok,
      assign(socket, assigns)
    }
  end

  @impl true
  def handle_event("load-video", %{"data" => data}, socket) do
    assigns = [data: data, embedded_link: create_embedded_link(data)]

    YoutubeLiveviewWeb.Endpoint.broadcast("room:abc123", "load-client-video", assigns)

    {:noreply, assign(socket, assigns)}
  end

  @impl true
  def handle_event("play-video", _assigns, socket) do
    YoutubeLiveviewWeb.Endpoint.broadcast("room:abc123", "broadcast-playback-event", %{
      action: "play"
    })

    {:noreply, socket}
  end

  @impl true
  def handle_event("pause-video", _assigns, socket) do
    YoutubeLiveviewWeb.Endpoint.broadcast("room:abc123", "broadcast-playback-event", %{
      action: "pause"
    })

    {:noreply, socket}
  end

  @impl true
  def handle_info(
        %Phoenix.Socket.Broadcast{
          event: "load-client-video",
          payload: assigns
        },
        socket
      ) do
    {:noreply, assign(socket, assigns)}
  end

  @impl true
  def handle_info(
        %Phoenix.Socket.Broadcast{
          event: "broadcast-playback-event",
          payload: payload
        },
        socket
      ) do
    {
      :noreply,
      socket
      # This will send to the client's browser and will trigger the video to be played
      |> push_event("client-playback-event", payload)
    }
  end

  defp create_embedded_link(data) do
    case Regex.run(~r/[\d\w-]{11}/, data) do
      [match] -> "https://www.youtube.com/embed/#{match}"
      nil -> ""
    end
  end
end
