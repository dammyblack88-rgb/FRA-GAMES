#include "FRAPrototypeGameMode.h"
#include "FRAPlayerCharacter.h"

AFRAPrototypeGameMode::AFRAPrototypeGameMode()
{
    DefaultPawnClass = AFRAPlayerCharacter::StaticClass();
}
