#include "FRAWorldInteractableActor.h"

#include "Components/SceneComponent.h"
#include "Components/StaticMeshComponent.h"

AFRAWorldInteractableActor::AFRAWorldInteractableActor()
{
    PrimaryActorTick.bCanEverTick = false;

    SceneRoot = CreateDefaultSubobject<USceneComponent>(TEXT("SceneRoot"));
    SetRootComponent(SceneRoot);

    VisualMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("VisualMesh"));
    VisualMesh->SetupAttachment(SceneRoot);
    VisualMesh->SetCollisionProfileName(TEXT("BlockAllDynamic"));
}

FText AFRAWorldInteractableActor::GetInteractionPrompt_Implementation() const
{
    return InteractionPrompt;
}

bool AFRAWorldInteractableActor::CanInteract_Implementation(AActor* InteractingActor) const
{
    if (!bInteractionEnabled || !IsValid(InteractingActor) || MaxInteractionDistance < 50.0f) return false;
    return FVector::DistSquared(GetActorLocation(), InteractingActor->GetActorLocation())
        <= FMath::Square(MaxInteractionDistance);
}

void AFRAWorldInteractableActor::Interact_Implementation(AActor* InteractingActor)
{
    if (CanInteract_Implementation(InteractingActor))
    {
        ReceiveInteraction(InteractingActor);
    }
}

void AFRAWorldInteractableActor::ReceiveInteraction_Implementation(AActor* InteractingActor)
{
    // Intentionally empty: configure the response in a Blueprint child or override in C++.
}
