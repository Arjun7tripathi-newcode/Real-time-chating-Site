"use client";

import { useEffect, useState, useRef } from "react";
import type { 
  IAgoraRTCClient, 
  ICameraVideoTrack, 
  IMicrophoneAudioTrack, 
  IAgoraRTCRemoteUser 
} from "agora-rtc-sdk-ng";
import axios from "axios";

export const useAgora = (meetingId: string | null) => {
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);

  const initializing = useRef(false);
  const clientRef = useRef<IAgoraRTCClient | null>(null);

  const init = async () => {
    if (!meetingId || initializing.current || clientRef.current) return;
    initializing.current = true;
    setLoading(true);
    
    try {
      // Lazy load Agora SDK
      const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
      const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      clientRef.current = agoraClient;
      setClient(agoraClient);

      agoraClient.on("user-published", async (user, mediaType) => {
        await agoraClient.subscribe(user, mediaType);
        if (mediaType === "video") {
          setRemoteUsers((prev) => [...prev.filter((u) => u.uid !== user.uid), user]);
        }
        if (mediaType === "audio") {
          user.audioTrack?.play();
        }
      });

      agoraClient.on("user-unpublished", (user) => {
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      });

      agoraClient.on("user-left", (user) => {
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      });

      // Get token from backend
      const { data } = await axios.get(`/api/agora/token?channelName=${meetingId}`);
      const { token, appId, uid } = data;

      await agoraClient.join(appId, meetingId, token, uid);
      
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      const videoTrack = await AgoraRTC.createCameraVideoTrack();
      
      setLocalAudioTrack(audioTrack);
      setLocalVideoTrack(videoTrack);
      
      await agoraClient.publish([audioTrack, videoTrack]);
      setJoined(true);
    } catch (err: any) {
      console.error("Agora Init Error:", err);
      // If gateway server error, we can attempt a soft retry once
      if (err?.message?.includes("GATEWAY_SERVER")) {
         console.warn("Agora Gateway Issue detected. Check App ID/Network.");
      }
    } finally {
      setLoading(false);
      initializing.current = false;
    }
  };

  const leave = async () => {
    if (localAudioTrack) {
      localAudioTrack.stop();
      localAudioTrack.close();
    }
    if (localVideoTrack) {
      localVideoTrack.stop();
      localVideoTrack.close();
    }
    if (clientRef.current) {
      await clientRef.current.leave();
      clientRef.current = null;
      setClient(null);
    }
    setJoined(false);
    setLocalAudioTrack(null);
    setLocalVideoTrack(null);
    setRemoteUsers([]);
  };

  const toggleMic = async (on: boolean) => {
    if (localAudioTrack) await localAudioTrack.setEnabled(on);
  };

  const toggleVideo = async (on: boolean) => {
    if (localVideoTrack) await localVideoTrack.setEnabled(on);
  };

  useEffect(() => {
    if (meetingId) {
      init();
    }
    return () => {
      leave();
    };
  }, [meetingId]);

  return {
    localVideoTrack,
    localAudioTrack,
    remoteUsers,
    joined,
    loading,
    leave,
    toggleMic,
    toggleVideo
  };
};
