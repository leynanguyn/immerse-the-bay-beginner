import { useFrame } from '@react-three/fiber';
import { useTherapyState } from '../../app-shell/TherapyStateController';
import { useXRSession } from '../../xr/XRSessionManager';
import type { ToneType } from '../LeftTonePanel';

interface ButtonState {
  pressed: boolean;
  wasPressed: boolean;
}

const TONES: ToneType[] = ['Soft', 'Friendly', 'Analytical'];

export default function XRControllerActions({
  selectedTone,
  onToneChange,
}: {
  selectedTone: ToneType;
  onToneChange: (tone: ToneType) => void;
}) {
  const { exitTherapy } = useTherapyState();
  const xrSession = useXRSession();

  // Track button states to detect button press (not hold)
  const buttonStates = new Map<string, ButtonState>();

  const getButtonState = (key: string): ButtonState => {
    if (!buttonStates.has(key)) {
      buttonStates.set(key, { pressed: false, wasPressed: false });
    }
    return buttonStates.get(key)!;
  };

  const isButtonJustPressed = (key: string, pressed: boolean): boolean => {
    const state = getButtonState(key);
    const justPressed = pressed && !state.wasPressed;
    state.wasPressed = pressed;
    return justPressed;
  };

  // Monitor controller buttons each frame
  useFrame(() => {
    if (!xrSession.session) return;

    const inputSources = xrSession.session.inputSources;

    for (const source of inputSources) {
      if (!source.gamepad) continue;

      const gamepad = source.gamepad;
      const buttons = gamepad.buttons;

      // Button indices for common VR controllers:
      // 0: Trigger
      // 1: Squeeze/Grip
      // 2: Touchpad/Thumbstick press
      // 3: X/A button (right controller) or Y/X button (left controller)
      // 4: Y/B button (right controller) or menu button (left controller)
      // 5: Menu/System button

      // Button 4 or 5: Exit session (B button or Menu button)
      if (buttons[4] || buttons[5]) {
        const exitPressed = buttons[4]?.pressed || buttons[5]?.pressed;
        if (isButtonJustPressed(`${source.handedness}-exit`, exitPressed)) {
          console.log('[XRControllerActions] Exit button pressed');
          exitTherapy();
          void xrSession.endSession();
        }
      }

      // Button 3: Change tone (X/A button)
      if (buttons[3]) {
        if (isButtonJustPressed(`${source.handedness}-tone`, buttons[3].pressed)) {
          const currentIndex = TONES.indexOf(selectedTone);
          const nextIndex = (currentIndex + 1) % TONES.length;
          const nextTone = TONES[nextIndex];
          console.log(`[XRControllerActions] Changing tone to: ${nextTone}`);
          onToneChange(nextTone);
        }
      }
    }
  });

  return null;
}
