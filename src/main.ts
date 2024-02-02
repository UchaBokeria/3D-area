import './style.scss'
import {App} from '@app/app'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<header>
<h1>Dev patch v0.1</h1>
<p route="eye">Eye</p>
<p route="room">Room</p>
</header>

<main> <div id="container3D"></div> </main>
`

new App()
