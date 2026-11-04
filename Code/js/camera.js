export function createCameraController(videoElement) {
  let stream = null;

  return {
    async start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Trình duyệt chưa hỗ trợ truy cập camera.");
      }
      this.stop();
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      videoElement.srcObject = stream;
      videoElement.hidden = false;
    },

    capture() {
      if (!stream || videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
        throw new Error("Camera error");
      }
      const canvas = document.createElement("canvas");
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      canvas.getContext("2d").drawImage(videoElement, 0, 0);
      return canvas.toDataURL("image/jpeg", 0.85);
    },

    stop() {
      stream?.getTracks().forEach((track) => track.stop());
      stream = null;
      videoElement.srcObject = null;
      videoElement.hidden = true;
    },
  };
}
