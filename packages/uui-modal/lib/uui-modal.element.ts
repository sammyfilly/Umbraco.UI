import { defineElement } from '@umbraco-ui/uui-base/lib/registration';
import { css, html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';

/**
 * @element uui-modal
 */
@defineElement('uui-modal')
export class UUIModalElement extends LitElement {
  static styles = [
    css`
      :host(.closing),
      :host(.closing) dialog {
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
      }

      dialog {
        border: none;
        padding: 0;
        background: transparent;
        overflow: visible;
      }

      uui-dialog:after {
        content: '';
        display: block;
        position: absolute;
        inset: 0;
        opacity: 0;
        pointer-events: none;
        background-color: rgba(0, 0, 0, 0.25);
        transition: opacity 250ms linear;
      }

      :host([fade]) uui-dialog:after {
        opacity: 1;
      }

      uui-dialog {
        overflow: hidden;
      }

      dialog::backdrop {
        opacity: 0;
        background-color: rgba(0, 0, 0, 0.25);
      }
    `,
  ];

  @query('dialog')
  dialog!: HTMLDialogElement;

  @property({ type: String })
  headline = '';

  private animation!: Animation;
  private _keyframes = [{ opacity: '0' }, { opacity: '1' }];
  private _options: KeyframeAnimationOptions = {
    duration: 250,
    fill: 'both',
    easing: 'linear',
    pseudoElement: '::backdrop',
  };

  protected firstUpdated(
    _changedProperties: Map<string | number | symbol, unknown>
  ): void {
    super.firstUpdated(_changedProperties);

    this.dialog.showModal();
    this.dialog.addEventListener('cancel', event => {
      event.preventDefault();
      this.close(event);
    });

    this.dispatchEvent(new CustomEvent('open', { bubbles: true }));
  }

  public showBackdrop() {
    if (this.animation) return;

    this.animation = this.dialog.animate(this._keyframes, this._options);
    this.animation.finished.then(() => {
      this.animation.pause();
    });
  }

  public hideBackdrop() {
    if (!this.animation) return;

    this.animation.playbackRate = -1;
    this.animation.play();
  }

  private close(e: Event) {
    e.preventDefault();
    e.stopImmediatePropagation();
    this.classList.add('closing');
    this.hideBackdrop();
    this.dispatchEvent(new CustomEvent('closing', { bubbles: true }));

    setTimeout(() => {
      this.dialog.close();
      this.remove();
    }, 250);
  }

  render() {
    return html`
      <dialog>
        <uui-dialog>
          <uui-dialog-layout headline=${this.headline}>
            <slot></slot>
            <uui-button @click=${this.close} label="close" look="secondary"
              >Close</uui-button
            >
          </uui-dialog-layout>
        </uui-dialog>
      </dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'uui-modal': UUIModalElement;
  }
}