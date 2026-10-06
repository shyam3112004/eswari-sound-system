import React from 'react';
import { CanvasScrubber } from './CanvasScrubber';
import { SafeZoneOverlays } from './SafeZoneOverlays';

/**
 * Pinned cinematic stage: 6 sections x 96 desktop frames scrubbed by scroll.
 * Overlay visibility is driven entirely by CanvasScrubber through the DOM
 * (data-edge + --local-p), so scrolling never triggers a React re-render.
 */
export function CinematicStage() {
  return (
    <CanvasScrubber>
      <SafeZoneOverlays />
    </CanvasScrubber>
  );
}
