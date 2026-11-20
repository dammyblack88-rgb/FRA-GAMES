#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "FRAPlayerInteractionComponent.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FFRAInteractionTargetChanged, AActor*, PreviousTarget, AActor*, NewTarget);

/** Camera-forward interaction trace owned by the player character. */
UCLASS(ClassGroup=(FRA), meta=(BlueprintSpawnableComponent))
class FRAGAMES_API UFRAPlayerInteractionComponent : public UActorComponent
{
    GENERATED_BODY()

public:
    UFRAPlayerInteractionComponent();

    UFUNCTION(BlueprintCallable, Category="FRA|Interaction")
    bool RefreshTarget();

    UFUNCTION(BlueprintCallable, Category="FRA|Interaction")
    bool TryInteract();

    UFUNCTION(BlueprintPure, Category="FRA|Interaction")
    FText GetCurrentPrompt() const;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="FRA|Interaction", meta=(ClampMin="50.0", ClampMax="1000.0"))
    float InteractionDistance = 350.0f;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="FRA|Interaction")
    TObjectPtr<AActor> CurrentTarget = nullptr;

    UPROPERTY(BlueprintAssignable, Category="FRA|Interaction")
    FFRAInteractionTargetChanged OnTargetChanged;
};
