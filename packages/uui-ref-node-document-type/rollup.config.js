import { UUIProdConfig } from '../rollup-package.config';

export default UUIProdConfig({
  entryPoints: ['index', 'uui-ref-node-document-type.element'],
  bundle: 'index',
});