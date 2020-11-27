import { html } from 'lighterhtml';
import { updateWorldData } from "../data/world"

export const header = function header (state) {
    return html`
    <div class="header-spacer"></div>
    <header>
        <div class="intro">Just a test to see if re-rendering 1000+ views at the same time causes major issues in rendering. Uses Perlin noise to build the map. Each map tile is a DOM node with logic.</div>
        <button onclick=${()=>{updateWorldData(state)}}>Next</button>
    </header>
`

}