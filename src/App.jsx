import "@livekit/components-styles";
import {
  ControlBar,
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { useCallback, useEffect, useState } from "react";
import { AccessToken } from "livekit-server-sdk";

const serverUrl = "wss://call.chris-nika.us";
const API_KEY = "devkey";
const API_SECRET = "secret";

export default function Home() {
  const [token, setToken] = useState(null);
  const randomUserName = useCallback(() => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }
    return result;
  }, []);

  const getToken = useCallback(async () => {
    const roomName = "nika-dev-vn";
    const participantName = randomUserName();

    const at = new AccessToken(API_KEY, API_SECRET, {
      identity: participantName,
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });
    const token = await at.toJwt();
    return token;
  }, []);

  useEffect(() => {
    getToken().then((token) => {
      setToken(token);
    });
  }, []);

  if (token == null) return <h2>Call is initiating</h2>;

  return (
    <>
      <main style={{ width: "100vw" }}>
        <LiveKitRoom
          video={true}
          audio={true}
          token={token}
          serverUrl={serverUrl}
          // Use the default LiveKit theme for nice styles.
          data-lk-theme="default"
          style={{ height: "100vh" }}
        >
          {/* Your custom component with basic video conferencing functionality. */}
          <MyVideoConference />
          {/* The RoomAudioRenderer takes care of room-wide audio for you. */}
          <RoomAudioRenderer />
          {/* Controls for the user to start/stop audio, video, and screen 
      share tracks and to leave the room. */}
          <ControlBar />
        </LiveKitRoom>
      </main>
    </>
  );
}

function MyVideoConference() {
  // `useTracks` returns all camera and screen share tracks. If a user
  // joins without a published camera track, a placeholder track is returned.
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );
  return (
    <GridLayout
      tracks={tracks}
      style={{ height: "calc(100vh - var(--lk-control-bar-height))" }}
    >
      {/* The GridLayout accepts zero or one child. The child is used
      as a template to render all passed in tracks. */}
      <ParticipantTile />
    </GridLayout>
  );
}
