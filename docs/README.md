# 📝 Building a Peer-to-Peer ToDo App with Pear & Blind Pairing

This document will walk you through setting up a collaborative ToDo app that runs in the [Pear](https://docs.pears.com/) runtime. The app uses **Blind Pairing** and **Hyperswarm** to create private, peer-to-peer ToDo list sharing.

---

## Prerequisites
1. Check that node and npm are installed. Check using below command. If not installed, visit [NodeJs](https://nodejs.org/) website
```bash
node -v
npm -v
```

2. To install Pear run the following command:
```bash
npm i -g pear
```

3. To complete the setup, run the pear command, running `pear` should show help output
```bash
pear
```

4. To check that Pear is fully working, try the following command:
```bash
pear run pear://keet
```

## Step 1: Project Initialization

Start by setting up a new Pear project.

```bash
mkdir todoapp
cd todoapp
pear init --yes
```

This creates the essential structure:

- **`index.html`**: The HTML UI layout.
- **`commentapp.js`**: Main app logic and networking.
- **`package.json`**: Project metadata and configuration.
- **`test/index.test.js`**: File to write Test cases inside `test` directory

---

## Step 2: Launch the App 

Run the app in development mode:
```bash
pear run --dev .
```

App will open and show an output like below image.

![Asset 1](/docs/assets/asset-1.png)

:::
ℹ️ Note: A directory or link needs to be specified with pear run, here `.` denotes the current Project directory.
:::
The app should open in development mode. In this mode developer tools are also opened.

## Step 3: HTML Structure and CSS Styles
The project folder should contain:
- `package.json`
- `index.html`
- `app.js`
- `test/index.test.js`

Start by defining the app's layout in index.html:

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="./style.css" />
  <script type='module' src='./app.js'></script>
</head>
<body>
  <div id="titlebar">
    <pear-ctrl></pear-ctrl>
  </div>
  <main>
    <div id="peer-status" style="margin-bottom: 1rem; font-weight: bold;">
      Connected Peers: <span id="peer-count">0</span>
    </div>
    
    <div class="content-container">
      <div id="setup" class="section">
        <button id="create-invite" class="action-button">Create</button>

        <div id="or">— or —</div>

        <form id="join-form" class="form-container">
          <input
            type="text"
            id="invite-input"
            placeholder="Invite"
            required
            class="form-input"
          />
          <input
            type="text"
            id="userdata-input"
            placeholder="User Data"
            required
            class="form-input"
          />
          <button type="submit" id="join-button" class="join-button">Join</button>
        </form>
        
        <div class="alert-container">
          <div id="output" class="alert-modal hidden">
            <div class="alert-content">
              <span class="close-button" id="close-alert">&times;</span>
              <pre id="alert-text"></pre>
            </div>
          </div>
        </div>
      </div>

      <div id="todo-section" class="section">
        <h2 class="section-title">Todo List</h2>
        <form id="todo-form" class="form-container">
          <input
            type="text"
            id="todo-input"
            placeholder="Add a new task"
            required
            class="form-input"
          />
          <button type="submit" class="join-button">Add Task</button>
        </form>
        <ul id="todo-list" class="todo-list"></ul>
      </div>
    </div>
  </main>
</body>
</html>
```

Select and copy the full HTML above and paste it inside `index.html` file in your Pear app!

### HTML code breakdown

- **`<head>`**:
    - Loads external CSS (`style.css`) for styling.
    - Loads the main JavaScript module (`app.js`) for app logic.
- **`<body>`**:
    - **`#titlebar`**: Hosts the `<pear-ctrl>` element, which integrates native Pear window controls.
    - **`#peer-status`**: Displays the number of currently connected peers.
    - **`#setup`**: Allows the user to either create a new invite or join using an existing invite code.
    - **`#todo-section`**: Provides a form to add new tasks and a list to display all current tasks.
    - **`.alert-modal`**: Modal popup to display invite codes after clicking "Create".

- **`Key Elements`**
    - `#create-invite`: Button to generate a new invite.
    - `#join-form`: A form where the user inputs an invite and optional user data to join an existing session.
    - `#output`: Modal that shows the invite key for sharing.
    - `#todo-form`: Lets users add a new task.
    - `#todo-list`: Displays all tasks, updated in real-time with peer syncing.

Create a new file named `style.css` in the project directory
```bash
touch style.css
```

Select and copy the full CSS below and paste it inside `style.css` file in your Pear app!

```css
pear-ctrl[data-platform="darwin"] {
    margin-top: 12px;
    margin-left: 10px;
  }
  
  #titlebar {
    -webkit-app-region: drag;
    height: 30px;
    width: 100%;
    position: fixed;
    left: 0;
    top: 0;
    background-color: #B0D94413;
    filter: drop-shadow(2px 10px 6px #888);
  }
  
  button,
  input {
    all: unset;
    border: 1px ridge #B0D944;
    background: #000;
    color: #B0D944;
    padding: .45rem;
    font-family: monospace;
    font-size: 1rem;
    line-height: 1rem;
  }
  
  body {
    background-color: #001601;
    font-family: monospace;
    margin: 0;
    padding: 0;
  }
  
  main {
    display: flex;
    flex-direction: column;
    height: 100vh;
    color: white;
    justify-content: flex-start;
    align-items: center;
    margin: 0;
    padding: 2rem;
    padding-top: 3rem;
  }
  
  .hidden {
    display: none !important;
  }
  
  #or {
    margin: 1.5rem 0;
    color: #B0D944;
    text-align: center;
  }
  
  #setup {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  
  #loading {
    align-self: center;
  }
  
  #chat {
    display: flex;
    flex-direction: column;
    width: 100vw;
    padding: .75rem;
  }
  
  #header {
    margin-top: 2.2rem;
    margin-bottom: 0.75rem;
  }
  
  #details {
    display: flex;
    justify-content: space-between;
  }
  
  #messages {
    flex: 1;
    font-family: 'Courier New', Courier, monospace;
    overflow-y: scroll;
  }
  
  #message-form {
    display: flex;
  }
  
  #message {
    flex: 1;
  }
  
  .output-row {
    background: #1e1e1e;
    color: #B0D944;
    font-family: monospace;
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .output-key {
    font-weight: bold;
    margin-right: 1rem;
    white-space: nowrap;
  }
  
  .output-value {
    flex: 1;
    overflow-x: auto;
    white-space: nowrap;
    background: #111;
    padding: 0.5rem;
    border-radius: 4px;
    font-size: 0.85rem;
    max-width: 64ch;
    text-overflow: ellipsis;
    margin-right: 1rem;
  }
  
  .copy-button {
    cursor: pointer;
    color: #B0D944;
    border: 1px solid #B0D944;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.85rem;
    background: black;
    transition: background 0.2s ease;
  }
  
  .copy-button:hover {
    background: #2a2a2a;
  }

  
  .content-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    width: 100%;
    max-width: 900px;
  }
  
  .section {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.5rem;
    background: #001601;
    border: 1px ridge #B0D944;
    border-radius: 8px;
  }
  
  .action-button,
  .join-button,
  .delete-button {
    background-color: #B0D944;
    color: #000;
    padding: 0.5rem 2rem;
    font-weight: bold;
    border-radius: 6px;
    font-family: monospace;
    font-size: 1rem;
    text-align: center;
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 200px;
    margin: 0 auto;
  }
  
  .action-button:hover,
  .join-button:hover,
  .delete-button:hover {
    background-color: #d4f25b;
  }
  
  .form-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    max-width: 600px;
  }
  
  .form-input {
    width: 100%;
    box-sizing: border-box;
    padding: 0.75rem;
    background: #000;
    color: #B0D944;
    border: 1px ridge #B0D944;
    font-family: monospace;
    font-size: 1rem;
  }
  
  .alert-container {
    width: 100%;
    margin-top: 1rem;
  }
  
  .alert-modal {
    position: fixed;
    top: 20%;
    left: 50%;
    transform: translateX(-50%);
    background-color: #1e1e1e;
    border: 2px solid #B0D944;
    padding: 1rem;
    z-index: 1000;
    border-radius: 10px;
    color: #B0D944;
    max-width: 90%;
    max-height: 70vh;
    overflow-y: auto;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
  }
  
.alert-content {
  position: relative;
  padding-right: 2.5rem; /* Add space for close icon */
}
  
  .close-button {
    position: absolute;
    top: 0;
    right: 0;
    color: #B0D944;
    font-size: 1.5rem;
    font-weight: bold;
    cursor: pointer;
    padding: 0.25rem 0.75rem;
  }
  
  .close-button:hover {
    color: #ffffff;
  }
  
  /* Todo List Styles */
  .todo-section {
    color: #B0D944;
  }
  
  .section-title {
    color: #B0D944;
    font-family: monospace;
    margin-bottom: 1.5rem;
    text-align: center;
  }
  
  .todo-list {
    list-style: none;
    padding: 0;
    margin-top: 1rem;
    width: 100%;
    max-width: 600px;
  }
  
  .todo-item {
    display: flex;
    align-items: center;
    margin-bottom: 0.75rem;
    padding: 0.75rem;
    background: #000;
    border: 1px ridge #B0D944;
    border-radius: 4px;
    color: #B0D944;
    font-family: monospace;
  }
  
  .todo-item input[type="checkbox"] {
    margin-right: 0.75rem;
    accent-color: #B0D944;
    cursor: pointer;
  }
  
  .todo-item span {
    flex-grow: 1;
    color: #B0D944;
  }
  
  .todo-item .delete-button {
    background-color: #B0D944;
    color: #000;
    padding: 0.5rem 1rem;
    font-weight: bold;
    border-radius: 6px;
    font-family: monospace;
    font-size: 1rem;
    text-align: center;
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: auto;
    margin: 0;
  }
  
  .todo-item .delete-button:hover {
    background-color: #d4f25b;
  }
  
  .todo-item.completed span {
    text-decoration: line-through;
    opacity: 0.7;
  }
```


This stylesheet styles a Pear Runtime-based peer-to-peer Todo app with a retro terminal aesthetic. Some key elements are:
- `Dark terminal` theme using black background and green highlights (#B0D944)
- Responsive and `centered layout` for forms and todo items
- `Custom buttons` and `alerts` with hover effects and smooth transitions
- `Draggable title` bar for desktop-like UI on Electron/Darwin systems
- Todo list interactivity, including `delete` and `checkbox` support

## Step 3: Main Application Logic

Copy and paste each JavaScript snippet inside `app.js` in the project directory.

#### 1. Import Dependencies
```js
import Hyperswarm from 'hyperswarm'
import BlindPairing from 'blind-pairing'
```

- Hyperswarm: Used to connect peers over a distributed hash table (DHT).
- BlindPairing: A library to create secure peer connections using an invitation-based protocol.

#### 2. Initialize Swarm and Setup
```js
const swarm = new Hyperswarm()
const { teardown, updates } = Pear

teardown(() => swarm.destroy())
updates(() => Pear.reload())
```

- `swarm` handles peer discovery and connection.
- `teardown` & `updatesPear` are Pear runtime functions for cleanup and updates
- Application disconnects on teardown and reload the app when files change

#### 3. Generate Blind-Pairing Invite
```js
const autobaseKey = Buffer.alloc(32).fill('the-autobase-key')
const { invite, publicKey, discoveryKey } = BlindPairing.createInvite(autobaseKey)
```

- `autobaseKey`: Used to encrypt/decrypt messages between peers.
- `invite`: A sharable key to allow others to connect securely.
- `publicKey` & `discoveryKey`: Used for identification and connection.

#### 4. State Management
```js
const connectedPeers = new Map()
let connectedMember = new Map()
let peerCount = 0
let todos = []
```

- Maps to keep track of connected peers and active members.
- `peerCount` shows how many peers are connected.
- `todos` is the local list of todo items.


#### 5. Message Handling
```js
function handleTodoMessage(message) {
  try {
    const str = message.toString('utf8')

    // Quick check: only process if it's a likely JSON object
    if (!str.startsWith('{') || !str.endsWith('}')) return

    const data = JSON.parse(str)
    console.log('Received todo operation:', data)

    switch (data.type) {
      case 'add':
        addTodo(data.text, 'remote', data.id)
        break
      case 'delete':
        deleteTodo(data.id, 'remote')
        break
      case 'toggle':
        toggleTodo(data.id, 'remote')
        break
    }
  } catch (e) {
    console.warn('Ignored non-JSON or malformed message')
  }
}
```

- Listens for messages from peers.
- Parses JSON and performs one of: `add`, `delete` & `toggle`.

#### 6. UI Utilities
```js
function updatePeerCountUI() {
  peerCountElement.textContent = peerCount
}
```

- Reflects the number of connected peers in the UI.


#### 7. Todo Logic
```js
function addTodo(text,  source = 'local', id = Date.now()) {
  const todo = {
    id,
    text,
    completed: false
  }
  if (todos.some(t => t.id === id)) return
  todos.push(todo)
  console.log(`📝 [${source.toUpperCase()}] Added ToDo:`, todo)
  renderTodos()

  if (source === 'local') {
    const message = JSON.stringify({ type: 'add', text: todo.text, id: todo.id })
    broadcastToPeers(message)
  }
}
```

```js
function deleteTodo(id, source='local') {
  todos = todos.filter(todo => todo.id !== id)
  renderTodos()
  if (source === 'local') {
    const message = JSON.stringify({ type: 'delete', id })
    broadcastToPeers(message)
  }
}
```

```js
function toggleTodo(id, source='local') {
  todos = todos.map(todo => {
    if (todo.id === id) {
      return { ...todo, completed: !todo.completed }
    }
    return todo
  })
  renderTodos()

  if (source === 'local') {
    const message = JSON.stringify({ type: 'toggle', id })
    broadcastToPeers(message)
  }
}
```

```js
function renderTodos() {
  const todoList = document.getElementById('todo-list')
  todoList.innerHTML = ''

  todos.forEach(todo => {
    const li = document.createElement('li')
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`

    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.checked = todo.completed
    checkbox.addEventListener('change', () => toggleTodo(todo.id, 'local'))

    const span = document.createElement('span')
    span.textContent = todo.text

    const deleteBtn = document.createElement('button')
    deleteBtn.textContent = 'Delete'
    deleteBtn.className = 'delete-button'
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id, 'local'))

    li.appendChild(checkbox)
    li.appendChild(span)
    li.appendChild(deleteBtn)
    todoList.appendChild(li)
  })
}
```

- **addTodo**: Adds a new todo and broadcasts if from local.
- **deleteTodo** / **toggleTodo**: Modify the list and broadcast if from local.
- **renderTodos**: Updates the DOM with the current todo list.


#### 8. UI Event Listeners
```js
document.querySelector('#create-invite').addEventListener('click', createInvitation)

document.querySelector('#join-form').addEventListener('submit', joinPeer)

document.querySelector('#close-alert').addEventListener('click', () => {
  document.getElementById('output').classList.add('hidden')
})

document.querySelector('#todo-form').addEventListener('submit', (e) => {
  e.preventDefault()
  const input = document.querySelector('#todo-input', 'local')
  const text = input.value.trim()
  if (text) {
    addTodo(text, 'local')
    input.value = ''
  }
})
```

- UI handlers to create invites, join with an invite, handle form submits, etc.


#### 9. Broadcast to Peers
```js
function broadcastToPeers(message) {
  for (const peer of swarm.connections) {
    try {
      peer.write(message)
    } catch (e) {
      console.error('Error sending to peer:', e)
    }
  }
}
```

- Sends the same message to all currently connected peers.


#### 10. Create an Invitation
```js
async function createInvitation() {
  const memberBPInstance = new BlindPairing(swarm, { poll: 5000 })

  // Set up swarm connection handler
  swarm.on('connection', (peer) => {
    console.log('New peer connected')
    peer.on('data', data => handleTodoMessage(data.toString()))
    peer.on('error', e => console.error('Peer error:', e))
  })

  const member = memberBPInstance.addMember({
    discoveryKey,
    async onadd(candidate) {
      console.log('candidate id is', candidate.inviteId)

      // Store candidate in map
      connectedPeers.set(candidate.inviteId, candidate)

      candidate.open(publicKey)
      console.log('add candidate:', candidate.userData)
      candidate.confirm({ key: autobaseKey })

      // Log all connected peers so far
      console.log('✅ Connected Peers:', [...connectedPeers.keys()])

      // ✅ Increment peer count
      peerCount++
      updatePeerCountUI()
    }
  })

  console.log('member is', member)
  console.log('Discovery Key', discoveryKey)

  await member.flushed()

  const data = {
    invite: invite.toString('hex'),
    publicKey: publicKey.toString('hex'),
    discoveryKey: discoveryKey.toString('hex')
  }

  const alertBox = document.getElementById('output')
  const alertText = document.getElementById('alert-text')

  alertText.innerHTML = '' // Clear previous
  for (const [key, value] of Object.entries(data)) {
    alertText.innerHTML += `<div class="output-row">
      <span class="output-key">${key}</span>
      <span class="output-value" title="${value}">${value.slice(0, 80)}${value.length > 80 ? '...' : ''}</span>
      <button class="copy-button" onclick="navigator.clipboard.writeText('${value}')">Copy</button>
    </div>`
  }

  alertBox.classList.remove('hidden')
}
```

- Creates a ***member*** to accept candidates.
- Adds `onadd` handler to process peer connections.
- UI shows the *invite*, *publicKey*, and *discoveryKey* to share with others.


#### 11. Join an Existing Invite
```js
async function joinPeer(e) {
  e.preventDefault()

  const inviteHex = document.querySelector('#invite-input').value.trim()
  const userData = Buffer.from(document.querySelector('#userdata-input').value.trim())

  if (!inviteHex || !userData.length) {
    alert("Both fields are required.")
    return
  }

  const invite = Buffer.from(inviteHex, 'hex')

  const candidateBPInstance = new BlindPairing(swarm, { poll: 5000 })

  // Set up swarm connection handler
  swarm.on('connection', (peer) => {
    console.log('New peer connected')
    peer.on('data', data => handleTodoMessage(data.toString()))
    peer.on('error', e => console.error('Peer error:', e))
  })

  const connectingCandidate = candidateBPInstance.addCandidate({
    invite,
    userData,
    async onadd(result) {
      connectedMember.set(invite, result)
      peerCount++
      updatePeerCountUI()
    }
  })

  console.log('Join Discovery Key', discoveryKey)
  console.log('userData Key', userData)
  console.log('invite Key', invite)
  // let connectedMember = null


  console.time('paired')
  await connectingCandidate.pairing
  console.timeEnd('paired')
  console.log('paired:', connectingCandidate.paired)

  // --- Access connected peers (example) ---
  console.log('\n🔍 Final List of Connected Peers:', connectedMember, typeof(connectedMember))
  console.log('✅ Connected Peers:', [...connectedMember.keys()])
  for (const [id, peer] of connectedMember) {
    console.log(`• ID: ${id} | UserData: ${peer}`)
  }
}
```

- Converts the invite and `userData` to buffers.
- Uses BlindPairing’s `addCandidate()` to connect to a member.
- Once paired, logs peer metadata and updates count.

#### 12. Globals for Debugging
```js
window.toggleTodo = toggleTodo
window.deleteTodo = deleteTodo
```

- Exposes toggle and delete to global window.

## Step 4: Run ToDo P2P Application
1. Install the development dependencies using:
```bash
npm install
```

This will install `pear-interface` and `brittle`

2. Install the app modules dependencies using:
```bash
npm install hyperswarm blind-pairing
```

3. Run pear runtime application using
```bash
pear run dev .
```

## Step 5: Demo
![Add Demo Video](path to demo video)