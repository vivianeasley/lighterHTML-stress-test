import { render, html } from 'lighterhtml';
import { rows } from "./templates/map"
import { header } from "./templates/header"

const main = document.querySelector("main");

export function renderDOM (state) {
        render(main, html`
            ${header(state)}
            ${rows(state)}
        `);
}