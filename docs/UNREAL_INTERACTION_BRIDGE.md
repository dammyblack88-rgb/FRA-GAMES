# Unreal Player Interaction Bridge

**Status:** C++ source committed; not compiled or runtime-tested in Unreal Engine 5.8.

## Included source

- `FRAInteractable.h`: BlueprintNativeEvent interface for an actor's prompt, interaction eligibility and interaction action.
- `FRAWorldInteractableActor.h/.cpp`: reusable Blueprintable actor base with a visual mesh slot, prompt, enabled/range checks and a Blueprint interaction response event.
- `FRAPlayerInteractionComponent.h/.cpp`: player-owned camera-forward visibility trace, interface validation, current target, prompt lookup and interaction dispatch.
- `FRAPlayerCharacter.h/.cpp`: owns the interaction component and calls it when the player presses E.
- `Config/DefaultInput.ini`: maps E to the Interact action.

## Runtime contract

1. A world actor implements the FRA Interactable interface in C++ or Blueprint, or derives from `AFRAWorldInteractableActor`.
2. The player component traces forward from the active controller view up to its configured distance (default 350 Unreal units).
3. Only actors implementing the interface and returning true from CanInteract become the current target.
4. The component refreshes the target ten times per second and broadcasts OnTargetChanged when it changes.
5. A UI widget can read GetCurrentPrompt for a contextual prompt.
6. Pressing E performs a fresh trace and calls Interact on the current valid target.

The fresh trace on keypress prevents acting on a stale target. The component does not decide the business, dialogue, inventory or mission outcome; those remain owned by the actor or FRA gameplay systems.

## Still required

- Create Blueprint or C++ actors implementing the interface for Mama Kemi, the provision stall, dropped bread, bus stop, clinic and workshop.
- Connect the prompt and target-changed event to an in-game HUD widget.
- Implement actor-side authority checks and call the engine-independent economy/mission rules.
- Add interaction animations, audio, controller/gamepad mappings and accessibility options.
- Compile and test in UE 5.8, including line-of-sight, range, collision channel and multiplayer authority.

This is a real native interaction path in source, not proof of a playable interaction scene. No Unreal editor or compiler was available for verification during this change.
