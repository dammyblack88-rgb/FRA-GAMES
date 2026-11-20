using UnrealBuildTool;
using System.Collections.Generic;

public class FRAGamesTarget : TargetRules
{
    public FRAGamesTarget(TargetInfo Target) : base(Target)
    {
        Type = TargetType.Game;
        DefaultBuildSettings = BuildSettingsVersion.V5;
        IncludeOrderVersion = EngineIncludeOrderVersion.Unreal5_8;
        ExtraModuleNames.Add("FRAGames");
    }
}
