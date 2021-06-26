defmodule YoutubeLiveviewWeb.VideoLive do
  use YoutubeLiveviewWeb, :live_view

  @default_youtube_url "https://www.youtube.com/watch?v=e_TxH59MclA"

  @impl true
  def mount(_params, _session, socket) do
    YoutubeLiveviewWeb.Endpoint.subscribe("room:abc123")

    {
      :ok,
      socket
      |> assign(
        data: @default_youtube_url,
        current_video_time: get_formatted_time(0),
        total_video_time: get_formatted_time(0),
        progress_time: get_progress_percentage
      )
    }
  end

  @impl true
  def handle_event("load-video", %{"data" => data}, socket) do
    assigns = [data: data]

    YoutubeLiveviewWeb.Endpoint.broadcast("room:abc123", "load-client-video", assigns)

    {
      :noreply,
      socket
      |> assign(assigns)
    }
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
  def handle_event(
        "client-video-metadata-event",
        %{
          "current_time" => current_video_time,
          "total_video_time" => total_video_time
        },
        socket
      ) do
    {
      :noreply,
      socket
      |> assign(
        current_video_time: current_video_time |> trunc |> get_formatted_time,
        total_video_time: total_video_time |> trunc |> get_formatted_time,
        progress_time: get_progress_percentage(%{ct: current_video_time, tvt: total_video_time})
      )
    }
  end

  @impl true
  def handle_info(
        %Phoenix.Socket.Broadcast{
          event: "load-client-video",
          payload: assigns
        },
        socket
      ) do
    {
      :noreply,
      socket
      |> assign(assigns)
    }
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

  def get_progress_percentage(), do: 0.0
  def get_progress_percentage(%{ct: ct, tvt: tvt}), do: (ct / tvt * 100) |> Float.round(2)

  def get_formatted_time(raw_time) do
    "#{div(raw_time, 60)}:#{get_formatted_seconds(rem(raw_time, 60))}"
  end

  defp get_formatted_seconds(s) when s < 10, do: "0#{s}"
  defp get_formatted_seconds(s), do: "#{s}"
end
