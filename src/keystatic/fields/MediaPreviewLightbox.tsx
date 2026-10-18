import { Dialog, DialogContainer } from '@keystar/ui/dialog';
import { useState, type ReactNode } from 'react';

type Props = {
  src: string;
  label: string;
  children: ReactNode;
  className?: string;
};

export function MediaPreviewLightbox({
  src,
  label,
  children,
  className = 'ks-media-preview-trigger',
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={className}
        aria-label={label}
        onClick={() => setOpen(true)}
      >
        <span className="ks-media-preview-trigger__surface">{children}</span>
      </button>
      {open ? (
        <DialogContainer onDismiss={() => setOpen(false)} isDismissable>
          <Dialog size="large" aria-label={label}>
            <div className="ks-media-preview-lightbox">
              <img className="ks-media-preview-lightbox__img" src={src} alt="" />
            </div>
          </Dialog>
        </DialogContainer>
      ) : null}
    </>
  );
}
