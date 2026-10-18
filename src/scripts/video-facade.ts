const IFRAME_ALLOW =
  'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';

function activateFacade(facade: HTMLElement) {
  const embedSrc = facade.dataset.embedSrc;
  if (!embedSrc || facade.dataset.videoFacadeActive === 'true') return;

  const url = new URL(embedSrc);
  url.searchParams.set('autoplay', '1');

  const iframe = document.createElement('iframe');
  iframe.src = url.toString();
  iframe.title = facade.dataset.videoTitle ?? 'Video';
  iframe.className = 'h-full w-full';
  iframe.setAttribute('allow', IFRAME_ALLOW);
  iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  iframe.allowFullscreen = true;

  facade.dataset.videoFacadeActive = 'true';
  facade.replaceChildren(iframe);
}

export function initVideoFacades(root: ParentNode = document): void {
  root.querySelectorAll<HTMLButtonElement>('[data-video-facade-trigger]').forEach((button) => {
    if (button.dataset.videoFacadeReady === 'true') return;
    button.dataset.videoFacadeReady = 'true';

    button.addEventListener('click', () => {
      const facade = button.closest<HTMLElement>('[data-video-facade]');
      if (facade) activateFacade(facade);
    });
  });
}
