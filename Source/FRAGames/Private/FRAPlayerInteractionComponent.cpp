#include "FRAPlayerInteractionComponent.h"

#include "FRAInteractable.h"
#include "Camera/PlayerCameraManager.h"
#include "Engine/World.h"
#include "GameFramework/Controller.h"
#include "GameFramework/Pawn.h"

UFRAPlayerInteractionComponent::UFRAPlayerInteractionComponent()
{
    PrimaryComponentTick.bCanEverTick = false;
}

bool UFRAPlayerInteractionComponent::RefreshTarget()
{
    APawn* OwnerPawn = Cast<APawn>(GetOwner());
    AController* Controller = OwnerPawn ? OwnerPawn->GetController() : nullptr;
    AActor* PreviousTarget = CurrentTarget;
    AActor* NewTarget = nullptr;

    if (Controller && GetWorld() && InteractionDistance >= 50.0f)
    {
        FVector ViewLocation;
        FRotator ViewRotation;
        Controller->GetPlayerViewPoint(ViewLocation, ViewRotation);

        const FVector TraceEnd = ViewLocation + ViewRotation.Vector() * InteractionDistance;
        FCollisionQueryParams QueryParams(SCENE_QUERY_STAT(FRAPlayerInteraction), false, GetOwner());
        FHitResult Hit;
        if (GetWorld()->LineTraceSingleByChannel(Hit, ViewLocation, TraceEnd, ECC_Visibility, QueryParams))
        {
            AActor* HitActor = Hit.GetActor();
            if (IsValid(HitActor) && HitActor->GetClass()->ImplementsInterface(UFRAInteractable::StaticClass())
                && IFRAInteractable::Execute_CanInteract(HitActor, GetOwner()))
            {
                NewTarget = HitActor;
            }
        }
    }

    CurrentTarget = NewTarget;
    if (PreviousTarget != CurrentTarget)
    {
        OnTargetChanged.Broadcast(PreviousTarget, CurrentTarget);
    }
    return IsValid(CurrentTarget);
}

bool UFRAPlayerInteractionComponent::TryInteract()
{
    if (!RefreshTarget() || !IsValid(CurrentTarget)) return false;
    IFRAInteractable::Execute_Interact(CurrentTarget, GetOwner());
    return true;
}

FText UFRAPlayerInteractionComponent::GetCurrentPrompt() const
{
    if (!IsValid(CurrentTarget) || !CurrentTarget->GetClass()->ImplementsInterface(UFRAInteractable::StaticClass()))
    {
        return FText::GetEmpty();
    }
    return IFRAInteractable::Execute_GetInteractionPrompt(CurrentTarget);
}
