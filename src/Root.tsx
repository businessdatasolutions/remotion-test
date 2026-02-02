import { Composition } from "remotion";
import { VisionMission } from "./VisionMission";
import { AdaptiveStrategy } from "./AdaptiveStrategy";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="VisionMission"
        component={VisionMission}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="AdaptiveStrategy"
        component={AdaptiveStrategy}
        durationInFrames={750}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
