import { SoundCtl } from "../../types";
import { SoundStage } from "./SoundStage";
import { ctlStart, ctlStop } from "./utils";

let counter = 1;

const BG_SILENCE_DURATION_MILLIS = 5000;

export class BackgroundChannel {
  soundCtl: SoundCtl | null = null;

  bgSilenceTimeoutId: NodeJS.Timeout | null = null;

  uid: number;

  disposed: boolean = false;

  constructor(private context: SoundStage) {
    this.uid = counter;
    counter++;
    this.run = this.run.bind(this);
  }

  run() {
    if (this.disposed) return;
    console.log(`${this.uid} RotationChannel.run`);
    const { backgroundSound } = this.context.soundStageState;
    const { soundSettings, soundStorage, audioContextWrapper } = this.context.props;
    if (backgroundSound === null) {
      this.bgSilenceTimeoutId = setTimeout(() => this.run(), BG_SILENCE_DURATION_MILLIS);
    } else {
      const sound = soundStorage.getSound(backgroundSound.name);
      if ( sound === undefined ) {
        console.warn(`Sound not found: ${backgroundSound}`);
        this.bgSilenceTimeoutId = setTimeout(() => this.run(), BG_SILENCE_DURATION_MILLIS);
      } else {
        console.log(`start bg sound ${sound.name}`);
        const ctl = audioContextWrapper.createSource(sound.buffer);
        this.soundCtl = ctl;
        ctl.source.addEventListener('ended', this.run);
        ctl.source.customData = { soundName: sound.name };
        ctl.gainNode.gain.value = backgroundSound.volumePercent / 100; // 50 / 100
        ctlStart(ctl);
      }
    }
  }

  dispose() {
    console.log(`${this.uid} BackgroundChannel.dispose`);
    if (this.bgSilenceTimeoutId !== null) {
      clearTimeout(this.bgSilenceTimeoutId);
    }
    if (this.soundCtl) {
      ctlStop(this.soundCtl);
      this.soundCtl = null;
    }
    this.disposed = true;
  }
}