import { CollapseContentElement } from './elements/collapse-content-element.js';
import { CollapseEntryElement } from './elements/collapse-entry-element.js';
import { CollapseHandleElement } from './elements/collapse-handle-element.js';
import { EffectsPlayerElement } from './elements/effects-player-element.js';
import { TimeAgoElement } from './elements/time-ago-element.js';

declare global {
  interface HTMLElementTagNameMap {
    'collapse-content': CollapseContentElement;
    'collapse-entry': CollapseEntryElement;
    'collapse-handle': CollapseHandleElement;
    'effects-player': EffectsPlayerElement;
    'time-ago': TimeAgoElement;
  }
}
