import {
  Directive,
  ElementRef,
  HostBinding,
  HostListener,
  Renderer2,
  DestroyRef,
  inject,
  input,
} from '@angular/core';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

let nextTooltipId = 0;

/**
 * Attribute directive that shows a small floating label near the host on
 * hover/focus - e.g. explaining what a status badge means. Self-contained:
 * the tooltip element is created and styled entirely via Renderer2 and
 * appended to <body>, so no global CSS or app-wide setup is required (same
 * philosophy as ui-datetime-picker's provideNativeDateAdapter()).
 *
 * Usage: `<span uiTooltip="Explanation text" uiTooltipPosition="bottom">`.
 */
@Directive({
  selector: '[uiTooltip]',
})
export class TooltipDirective {
  private readonly hostRef = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private readonly id = `ui-tooltip-${nextTooltipId++}`;

  uiTooltip = input<string>('');
  uiTooltipPosition = input<TooltipPosition>('top');

  // Badges/spans aren't focusable by default - without this, keyboard and
  // screen-reader users could never trigger a hover-only tooltip.
  @HostBinding('attr.tabindex') protected readonly tabIndex = 0;

  private tooltipEl: HTMLElement | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.hide());
  }

  @HostListener('mouseenter')
  @HostListener('focus')
  show(): void {
    const text = this.uiTooltip();
    if (!text || this.tooltipEl) {
      return;
    }

    const tooltip = this.renderer.createElement('div') as HTMLElement;
    this.renderer.appendChild(tooltip, this.renderer.createText(text));
    this.renderer.setAttribute(tooltip, 'id', this.id);
    this.renderer.setAttribute(tooltip, 'role', 'tooltip');
    this.applyStyles(tooltip);
    this.renderer.appendChild(document.body, tooltip);
    this.tooltipEl = tooltip;

    this.position();
    this.renderer.setAttribute(
      this.hostRef.nativeElement,
      'aria-describedby',
      this.id,
    );
  }

  @HostListener('mouseleave')
  @HostListener('blur')
  @HostListener('window:keydown.escape')
  hide(): void {
    if (!this.tooltipEl) {
      return;
    }
    this.renderer.removeChild(document.body, this.tooltipEl);
    this.tooltipEl = null;
    this.renderer.removeAttribute(this.hostRef.nativeElement, 'aria-describedby');
  }

  private applyStyles(tooltip: HTMLElement): void {
    const styles: Record<string, string> = {
      position: 'fixed',
      zIndex: '1000',
      padding: '6px 10px',
      borderRadius: '4px',
      fontSize: '12px',
      lineHeight: '1.4',
      maxWidth: '220px',
      color: '#fff',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      pointerEvents: 'none',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
    };

    for (const [property, value] of Object.entries(styles)) {
      this.renderer.setStyle(tooltip, property, value);
    }
  }

  private position(): void {
    if (!this.tooltipEl) {
      return;
    }

    const hostRect = this.hostRef.nativeElement.getBoundingClientRect();
    const tooltipRect = this.tooltipEl.getBoundingClientRect();
    const gap = 8;

    // Flip top<->bottom when there isn't enough room, so the tooltip never
    // renders clipped above/below the viewport.
    let placement = this.uiTooltipPosition();
    if (placement === 'top' && hostRect.top - tooltipRect.height - gap < 4) {
      placement = 'bottom';
    } else if (
      placement === 'bottom' &&
      hostRect.bottom + tooltipRect.height + gap > window.innerHeight - 4
    ) {
      placement = 'top';
    }

    let top: number;
    let left: number;

    switch (placement) {
      case 'bottom':
        top = hostRect.bottom + gap;
        left = hostRect.left + hostRect.width / 2 - tooltipRect.width / 2;
        break;
      case 'left':
        top = hostRect.top + hostRect.height / 2 - tooltipRect.height / 2;
        left = hostRect.left - tooltipRect.width - gap;
        break;
      case 'right':
        top = hostRect.top + hostRect.height / 2 - tooltipRect.height / 2;
        left = hostRect.right + gap;
        break;
      default:
        top = hostRect.top - tooltipRect.height - gap;
        left = hostRect.left + hostRect.width / 2 - tooltipRect.width / 2;
    }

    // Clamp horizontally so the tooltip never runs off the left/right edge.
    left = Math.max(4, Math.min(left, window.innerWidth - tooltipRect.width - 4));

    this.renderer.setStyle(this.tooltipEl, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltipEl, 'left', `${left}px`);
  }
}
