// ═════════════════════════════════════════════════════════════════════
// Hotel Ambrosia — Web Audio Luxury Chime & Notification System
// Synthesizes a warm hotel bell chime using Web Audio API
// No external asset loading required
// ═════════════════════════════════════════════════════════════════════

class SoundNotificationManager {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.isMuted = localStorage.getItem("ha_admin_sound_muted") === "true";
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.audioCtx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== "undefined") {
      localStorage.setItem("ha_admin_sound_muted", String(this.isMuted));
    }
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (typeof window !== "undefined") {
      localStorage.setItem("ha_admin_sound_muted", String(this.isMuted));
    }
  }

  /**
   * Synthesizes a melodic luxury hotel bell chime:
   * Play Note 1 (D5 ~587Hz) then Note 2 (A5 ~880Hz) with warm resonance decay
   */
  public playNewOrderChime(): void {
    if (this.isMuted) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Bell 1 (587.33 Hz - D5)
      this.playBellTone(ctx, 587.33, now, 0.45, 0.6);
      // Bell 2 (880.00 Hz - A5, 200ms later)
      this.playBellTone(ctx, 880.0, now + 0.22, 0.55, 0.8);
      // Soft high harmonic overtone (1320 Hz, 240ms later)
      this.playBellTone(ctx, 1320.0, now + 0.25, 0.15, 0.5);
    } catch (err) {
      console.warn("Could not play audio chime:", err);
    }
  }

  private playBellTone(
    ctx: AudioContext,
    freq: number,
    startTime: number,
    volume: number,
    decayDuration: number
  ) {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, startTime);

    // Initial attack & exponential decay for metallic bell timbre
    gainNode.gain.setValueAtTime(0.001, startTime);
    gainNode.gain.exponentialRampToValueAtTime(volume, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + decayDuration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + decayDuration);
  }

  /**
   * System browser notification
   */
  public showBrowserNotification(title: string, options?: NotificationOptions) {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    if (Notification.permission === "granted") {
      try {
        new Notification(title, {
          icon: "/images/logo/Main-Logo-White.svg",
          badge: "/favicon.ico",
          ...options,
        });
      } catch {
        // Ignore in restricted environments
      }
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted") {
          new Notification(title, options);
        }
      });
    }
  }
}

export const soundManager = new SoundNotificationManager();
