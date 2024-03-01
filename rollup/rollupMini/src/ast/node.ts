import { Scope } from './scope';
import { Node as ASTNode } from '../../../../ast/rollupAST/src/index';

export interface Node extends ASTNode {
  parent?: Node;
  _scope?: Scope;
}
