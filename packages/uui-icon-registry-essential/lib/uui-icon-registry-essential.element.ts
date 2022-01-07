import { UUIIconRegistryElement } from '@umbraco-ui/uui-icon-registry/lib/uui-icon-registry.element';
import { UUIIconRegistryEssential } from './UUIIconRegistryEssential';

/**
 * @element uui-icon-registry-essential
 * @description - Essential Icon Registry of Umbraco UI Library. This component delivers essential Umbraco UI icons for any child of this component.
 * @see UUIIconRegistryElement.
 */
export class UUIIconRegistryEssentialElement extends UUIIconRegistryElement {
  constructor() {
    super(new UUIIconRegistryEssential());
  }
}