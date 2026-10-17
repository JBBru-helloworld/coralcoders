import { Composition, getStaticFiles } from "remotion";
import { Launch, type LaunchProps } from "./Launch";
import { layouts } from "./lib/theme";
import { FPS, timeline } from "./lib/timeline";

/** Music is mixed in only when the owner has supplied public/music/track.mp3. */
const hasMusic = getStaticFiles().some((file) => file.name === "music/track.mp3");

const variants: { id: string; props: LaunchProps }[] = [
  { id: "Launch-9x16", props: { format: "9x16", music: hasMusic, sfx: true } },
  { id: "Launch-9x16-NoMusic", props: { format: "9x16", music: false, sfx: true } },
  { id: "Launch-4x5", props: { format: "4x5", music: hasMusic, sfx: true } },
];

export function Root() {
  return (
    <>
      {variants.map(({ id, props }) => (
        <Composition
          key={id}
          id={id}
          component={Launch}
          defaultProps={props}
          fps={FPS}
          durationInFrames={timeline.durationInFrames}
          width={layouts[props.format].width}
          height={layouts[props.format].height}
        />
      ))}
    </>
  );
}
