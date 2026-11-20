#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "FRAInteractable.h"
#include "FRAWorldInteractableActor.generated.h"

class UStaticMeshComponent;
class USceneComponent;

/** Reusable Blueprint base for NPC, pickup, shop, transport and service interaction actors. */
UCLASS(Blueprintable)
class FRAGAMES_API AFRAWorldInteractableActor : public AActor, public IFRAInteractable
{
    GENERATED_BODY()

public:
    AFRAWorldInteractableActor();

    virtual FText GetInteractionPrompt_Implementation() const override;
    virtual bool CanInteract_Implementation(AActor* InteractingActor) const override;
    virtual void Interact_Implementation(AActor* InteractingActor) override;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="FRA|Interaction")
    FText InteractionPrompt;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="FRA|Interaction")
    bool bInteractionEnabled = true;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="FRA|Interaction", meta=(ClampMin="50.0", ClampMax="1000.0"))
    float MaxInteractionDistance = 400.0f;

    UFUNCTION(BlueprintNativeEvent, BlueprintCallable, Category="FRA|Interaction")
    void ReceiveInteraction(AActor* InteractingActor);
    virtual void ReceiveInteraction_Implementation(AActor* InteractingActor);

protected:
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Components")
    TObjectPtr<USceneComponent> SceneRoot;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Components")
    TObjectPtr<UStaticMeshComponent> VisualMesh;
};
