import type { CollapseContentElement } from './elements/collapse-content-element.js';
import type { CollapseEntryElement } from './elements/collapse-entry-element.js';
import type { CollapseHandleElement } from './elements/collapse-handle-element.js';
import type { EffectsPlayerElement } from './elements/effects-player-element.js';
import type { TimeAgoElement } from './elements/time-ago-element.js';

declare global {
  interface HTMLElementTagNameMap {
    'collapse-content': CollapseContentElement;
    'collapse-entry': CollapseEntryElement;
    'collapse-handle': CollapseHandleElement;
    'effects-player': EffectsPlayerElement;
    'time-ago': TimeAgoElement;
  }
}
