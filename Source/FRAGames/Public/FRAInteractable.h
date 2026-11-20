#pragma once

#include "CoreMinimal.h"
#include "UObject/Interface.h"
#include "FRAInteractable.generated.h"

UINTERFACE(BlueprintType)
class FRAGAMES_API UFRAInteractable : public UInterface
{
    GENERATED_BODY()
};

/** Implement this interface on world actors that support a player interaction. */
class FRAGAMES_API IFRAInteractable
{
    GENERATED_BODY()

public:
    UFUNCTION(BlueprintNativeEvent, BlueprintCallable, Category="FRA|Interaction")
    FText GetInteractionPrompt() const;

    UFUNCTION(BlueprintNativeEvent, BlueprintCallable, Category="FRA|Interaction")
    bool CanInteract(AActor* InteractingActor) const;

    UFUNCTION(BlueprintNativeEvent, BlueprintCallable, Category="FRA|Interaction")
    void Interact(AActor* InteractingActor);
};
