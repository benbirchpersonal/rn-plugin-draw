import { AppEvents, declareIndexPlugin, ReactRNPlugin, WidgetLocation} from "@remnote/plugin-sdk";

export const REMDRAW_POWERUP = "remdraw_powerup";


async function onActivate(plugin: ReactRNPlugin) {
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
    },
  });

}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);