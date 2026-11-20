#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "FRAPlayerCharacter.generated.h"

class UCameraComponent;
class USpringArmComponent;
class UFRAPlayerInteractionComponent;

/** First native player character for the NEXT WORLD prototype. */
UCLASS()
class FRAGAMES_API AFRAPlayerCharacter : public ACharacter
{
    GENERATED_BODY()

public:
    AFRAPlayerCharacter();

protected:
    virtual void SetupPlayerInputComponent(UInputComponent* PlayerInputComponent) override;

    void MoveForward(float Value);
    void MoveRight(float Value);
    void Turn(float Value);
    void LookUp(float Value);
    void Interact();

private:
    UPROPERTY(VisibleAnywhere, Category="Camera")
    TObjectPtr<USpringArmComponent> CameraBoom;

    UPROPERTY(VisibleAnywhere, Category="Camera")
    TObjectPtr<UCameraComponent> FollowCamera;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="FRA|Interaction", meta=(AllowPrivateAccess="true"))
    TObjectPtr<UFRAPlayerInteractionComponent> InteractionComponent;
};
