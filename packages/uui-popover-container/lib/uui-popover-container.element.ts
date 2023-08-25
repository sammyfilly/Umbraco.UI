import { defineElement } from '@umbraco-ui/uui-base/lib/registration';
import { css, html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';

export type PopoverContainerPlacement =
  | 'auto'
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'right'
  | 'right-start'
  | 'right-end'
  | 'left'
  | 'left-start'
  | 'left-end';

/**
 * @element uui-popover-container
 */
@defineElement('uui-popover-container')
export class UUIPopoverContainerElement extends LitElement {
  /**
   * Set the distance between popover-modal and trigger.
   * @type {number}
   * @attr disabled
   * @default false
   */
  @property({ type: Number })
  margin = 0;

  /**
   * Define the placement of the popover-modal.
   * @attr placement
   * @default 'bottom-start'
   */
  @property({ type: String, reflect: true })
  get placement(): PopoverContainerPlacement {
    return this._placement;
  }
  set placement(newValue: PopoverContainerPlacement) {
    this._placement = newValue;
  }

  @state()
  _placement: PopoverContainerPlacement = 'bottom-start';

  #target: HTMLElement | null = null;

  connectedCallback(): void {
    super.connectedCallback();

    this.addEventListener('beforetoggle', this.#beforeToggle);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();

    this.removeEventListener('beforetoggle', this.#beforeToggle);
  }

  #beforeToggle = async (event: any) => {
    if (event.newState !== 'open') {
      document.removeEventListener('scroll', this.#updatePosition);
      return;
    }

    document.addEventListener('scroll', this.#updatePosition);
    this.id;
    this.#target = this.#findAncestorWithAttribute(
      this,
      'popovertarget',
      this.id
    );

    requestAnimationFrame(() => {
      this.#updatePosition();
    });
  };

  #updatePosition = () => {
    if (this.#target === null) return;

    const isTopPlacement = this.placement.indexOf('top') !== -1;
    const isBottomPlacement = this.placement.indexOf('bottom') !== -1;
    const isLeftPlacement = this.placement.indexOf('left') !== -1;
    const isRightPlacement = this.placement.indexOf('right') !== -1;

    const isStart = this.placement.indexOf('-start') !== -1;
    const isEnd = this.placement.indexOf('-end') !== -1;

    const targetRect = this.#target.getBoundingClientRect();
    const popoverRect = this.getBoundingClientRect();

    let top = 0;
    let left = 0;

    if (isBottomPlacement) {
      top = targetRect.top + targetRect.height;
      if (isStart) {
        left = targetRect.left;
      }
      if (isEnd) {
        left = targetRect.left + targetRect.width - popoverRect.width;
      }
      if (!isStart && !isEnd) {
        left = targetRect.left + targetRect.width / 2 - popoverRect.width / 2;
      }
    }
    if (isTopPlacement) {
      top = targetRect.top - popoverRect.height;
      if (isStart) {
        left = targetRect.left;
      }
      if (isEnd) {
        left = targetRect.left + targetRect.width - popoverRect.width;
      }
      if (!isStart && !isEnd) {
        left = targetRect.left + targetRect.width / 2 - popoverRect.width / 2;
      }
    }
    if (isLeftPlacement) {
      left = targetRect.left - popoverRect.width;
      if (isStart) {
        top = targetRect.top;
      }
      if (isEnd) {
        top = targetRect.top + targetRect.height - popoverRect.height;
      }
      if (!isStart && !isEnd) {
        top = targetRect.top + targetRect.height / 2 - popoverRect.height / 2;
      }
    }
    if (isRightPlacement) {
      left = targetRect.left + targetRect.width;
      if (isStart) {
        top = targetRect.top;
      }
      if (isEnd) {
        top = targetRect.top + targetRect.height - popoverRect.height;
      }
      if (!isStart && !isEnd) {
        top = targetRect.top + targetRect.height / 2 - popoverRect.height / 2;
      }
    }

    // Clamp left and top within screen bounds
    // If the target leaves the screen, the popover follows.
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const topTargetVsScreenTop = Math.min(
      0,
      targetRect.top + targetRect.height
    );
    const topTargetVsScreenBottom = Math.max(
      Math.min(top, screenHeight - popoverRect.height),
      targetRect.top - popoverRect.height
    );

    top = Math.max(topTargetVsScreenTop, topTargetVsScreenBottom);

    const leftTargetVsScreenLeft = Math.min(
      0,
      targetRect.left + targetRect.width
    );
    const leftTargetVsScreenRight = Math.max(
      Math.min(left, screenWidth - popoverRect.width),
      targetRect.left - popoverRect.width
    );

    left = Math.max(leftTargetVsScreenLeft, leftTargetVsScreenRight);

    // Detect if the popover is completely outside the screen on any side
    const isCompletelyOutsideScreen =
      top + popoverRect.height < 0 ||
      top > screenHeight ||
      left + popoverRect.width < 0 ||
      left > screenWidth;

    if (isCompletelyOutsideScreen) {
      // @ts-ignore - This is part of the new popover API, but typescript doesn't recognize it yet.
      this.hidePopover();
    }

    // Set the popover's position
    this.style.transform = `translate(${left}px, ${top}px)`;
  };

  #findAncestorWithAttribute(
    element: HTMLElement,
    attributeName: string,
    attributeValue: string
  ) {
    while (element !== null && element.parentElement !== null) {
      element = element.parentElement;

      const elementHasAttribute =
        element.hasAttribute(attributeName) &&
        element.getAttribute(attributeName) === attributeValue;
      const elementContainsAttribute =
        element.querySelector(`[${attributeName}="${attributeValue}"]`) !==
        null;
      if (elementHasAttribute) {
        return element;
      } else if (elementContainsAttribute) {
        return element.querySelector(
          `[${attributeName}="${attributeValue}"]`
        ) as HTMLElement;
      }
    }
    return null;
  }

  render() {
    return html`<slot></slot>`;
  }

  static styles = [
    css`
      :host {
        margin: 0;
        width: fit-content;
        height: fit-content;
        border: none;
        border-radius: 0;
        padding: 0;
        background-color: none;
        background: none;
        overflow: visible;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    'uui-popover-container': UUIPopoverContainerElement;
  }
}