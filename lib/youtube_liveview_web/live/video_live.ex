defmodule YoutubeLiveviewWeb.VideoLive do
  use YoutubeLiveviewWeb, :live_view

  @topic "deployments"

  @impl true
  def mount(_params, _session, socket) do
    YoutubeLiveviewWeb.Endpoint.subscribe(@topic)

    assigns = [data: "", embedded_link: ""]

    {:ok, assign(socket, assigns)}
  end

  @impl true
  def handle_event("load-video", %{"data" => data}, socket) do
    assigns = [data: data, embedded_link: create_embedded_link(data)]

    YoutubeLiveviewWeb.Endpoint.broadcast_from(self(), @topic, "load-video", assigns)

    {
      :noreply,
      socket
      |> push_event("sample", %{action: "play-video"})
      |> assign(assigns)
    }
  end

  @impl true
  def handle_info(
        %{
          topic: @topic,
          event: "load-video",
          payload: assigns
        },
        socket
      ) do
    {
      :noreply,
      socket
      |> push_event("sample", %{action: "play-video"})
      |> assign(assigns)
    }
  end

  @impl true
  def handle_info(
        %{
          topic: @topic,
          event: "play-video",
          payload: assigns
        },
        socket
      ) do
    {:noreply, assign(socket, assigns)}
  end

  defp create_embedded_link(data) do
    case Regex.run(~r/[\d\w]{11}/, data) do
      [match] -> "https://www.youtube.com/embed/#{match}"
      nil -> ""
    end
  end
end
