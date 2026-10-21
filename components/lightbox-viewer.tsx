"use client";

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

type Slide = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

type LightboxViewerProps = {
  slides: Slide[];
  index: number;
  onClose: () => void;
};

export function LightboxViewer({ slides, index, onClose }: LightboxViewerProps) {
  return (
    <Lightbox
      open={index >= 0}
      close={onClose}
      index={index}
      slides={slides}
      animation={{ fade: 250 }}
      controller={{ closeOnBackdropClick: true }}
      styles={{
        container: { backgroundColor: "rgba(8,8,8,0.9)" },
      }}
    />
  );
}
