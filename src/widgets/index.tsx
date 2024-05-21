import { declareIndexPlugin, ReactRNPlugin, WidgetLocation} from "@remnote/plugin-sdk";

export const REMDRAW_POWERUP = "remdraw_powerup";

const STYLE = `
:root{--remdraw-border: #ddd;--remdraw-border-dark: #535353;--remdraw-block: #f7f6f3;--remdraw-block-dark: #2b2b33;--remdraw-input: #f7f6f3;--remdraw-input-dark: #2b2b33}[data-rem-container-tags~=remdraw]{border:1px solid var(--remdraw-border);border-radius:4px;padding:.5rem;margin-top:.5rem;margin-bottom:.5rem}[data-rem-container-tags~=remdraw] [data-rem-tags~=remdraw]{background-color:var(--remdraw-input)}[data-rem-container-tags~=remdraw] [data-rem-tags~=remdraw] .hierarchy-editor__tag-bar__tag{display:none}[data-rem-container-tags~=remdraw] [data-rem-tags~=remdraw] #code-node{background-color:var(--remdraw-block)}[data-rem-container-tags~=remdraw] [data-rem-tags~=remdraw]:not(rem-container--focused) #code-node{display:none}[data-rem-container-tags~=remdraw] [data-rem-tags~=remdraw].rem-container--focused #code-node{display:block}.dark [data-rem-container-tags~=remdraw]{border:1px solid var(--remdraw-border-dark);border-radius:4px;padding:.5rem;margin-top:.5rem;margin-bottom:.5rem}.dark [data-rem-container-tags~=remdraw] [data-rem-tags~=remdraw]{background-color:var(--remdraw-input-dark)}.dark [data-rem-container-tags~=remdraw] [data-rem-tags~=remdraw] .hierarchy-editor__tag-bar__tag{display:none}.dark [data-rem-container-tags~=remdraw] [data-rem-tags~=remdraw] #code-node{background-color:var(--remdraw-block-dark)}.dark [data-rem-container-tags~=remdraw] [data-rem-tags~=remdraw]:not(rem-container--focused) #code-node{display:none}.dark [data-rem-container-tags~=remdraw] [data-rem-tags~=remdraw].rem-container--focused #code-node{display:block}
`;
let remdrawCSS = '';


async function onActivate(plugin: ReactRNPlugin) {

  try {
    const response = await fetch("snippet.css");
    const text = await response.text();
    remdrawCSS = text;
    console.log("Divider Installed from local");
  } catch (error) {
    try {
      const response = await fetch(
        "https://raw.githubusercontent.com/browneyedsoul/remnote-plugins/main/packages/divider/src/snippet.css"
      );
      const text = await response.text();
      remdrawCSS = text;
      console.log("Divider Installed from CDN");
    } catch (error) {
      console.error(error);
    }
  }

  await plugin.app.registerPowerup("Remdraw", REMDRAW_POWERUP, "A remdraw plugin", {
    slots: [],
  });

  await plugin.app.registerWidget("remdraw", WidgetLocation.UnderRemEditor, {
    dimensions: { height: "auto", width: "100%" },
    powerupFilter: REMDRAW_POWERUP,
  });

  await plugin.app.registerCommand({
    id: "remdraw",
    name: "Remdraw",
    
    action: async () => {
      const rem = await plugin.focus.getFocusedRem();
      await rem?.addPowerup(REMDRAW_POWERUP);
     // await rem?.setText(SAMPLE_REMDRAW);
    },
  });
  
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);