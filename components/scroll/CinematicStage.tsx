'use client';

import React, { useState, useCallback } from 'react';
import { CanvasScrubber } from './CanvasScrubber';
import { SafeZoneOverlays } from './SafeZoneOverlays';

export function CinematicStage() {
  const [activeSection, setActiveSection] = useState(0);
  const [sectionProgress, setSectionProgress] = useState(0);

  const handleProgress = useCallback(
    (_globalProgress: number, sectionIndex: number, secProgress: number) => {
      setActiveSection(sectionIndex);
      setSectionProgress(secProgress);
    },
    []
  );

  return (
    <CanvasScrubber onProgress={handleProgress}>
      <SafeZoneOverlays
        activeSection={activeSection}
        sectionProgress={sectionProgress}
      />
    </CanvasScrubber>
  );
}
