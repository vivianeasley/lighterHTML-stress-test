
import { getWorldData, character } from './modules/data/world';
import { initState } from "./modules/state/sm";
import { noisesOff } from "../scripts/modules/noise";

window.onload = () => {
    startWorld();
}

async function startWorld () {
    character.seed1 = Math.random();
    character.seed2 = Math.random();

    character.rng1 = noisesOff(character.seed1);
    character.rng2 = noisesOff(character.seed2);

    const worldData = await getWorldData(character);
    const state = {
        worldData: worldData,
        character: character
    }

    initState(state);
}
