#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "FRAPlayerCharacter.generated.h"

class UCameraComponent;
class USpringArmComponent;

/**
 * First native player controller body for the FRA GAMES prototype.
 * Input mappings are configured in Config/DefaultInput.ini.
 */
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

private:
    UPROPERTY(VisibleAnywhere, Category = "Camera")
    TObjectPtr<USpringArmComponent> CameraBoom;

    UPROPERTY(VisibleAnywhere, Category = "Camera")
    TObjectPtr<UCameraComponent> FollowCamera;
};
