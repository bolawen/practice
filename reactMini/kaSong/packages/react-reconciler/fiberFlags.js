export const NoFlags = 0b000000000000;
export const Placement = 0b000000000001;
export const Update = 0b000000000010;
export const ChildDeletion = 0b000000000100;
export const PassiveEffect = 0b000000001000;
export const Ref = 0b000000010000;
export const Visibility = 0b000000100000;
export const ShouldCapture = 0b000001000000;
export const DidCapture = 0b000010000000;
export const MutationMask =
  Placement | Update | ChildDeletion | Ref | Visibility;
export const LayoutMask = Ref;
export const PassiveMask = PassiveEffect | ChildDeletion;
