import Hyperswarm from 'hyperswarm'
import BlindPairing from 'blind-pairing'

// Initialize Hyperswarm instance
const swarm = new Hyperswarm()

// Destructure teardown and updates from Pear (assumed global)
const { teardown, updates } = Pear

// Cleanly exit and destroy swarm to prevent DHT pollution
teardown(() => swarm.destroy())

// Enable hot reloads during development or production
updates(() => Pear.reload())

// Create a 32-byte Autobase key used for secure pairing
const autobaseKey = Buffer.alloc(32).fill('the-autobase-key')
console.log("Autobase Key:", autobaseKey.toString('hex'))

// Generate invite and keys using BlindPairing
const { invite, publicKey, discoveryKey } = BlindPairing.createInvite(autobaseKey)

// Store connected peers and members
const connectedPeers = new Map()
let connectedMember = new Map()

// Track peer count and bind to UI element
let peerCount = 0
const peerCountElement = document.getElementById('peer-count')

// Store all todos locally
let todos = []


// Function to handle incoming todo messages from peers
function handleTodoMessage(message) {
  try {
    const str = message.toString('utf8')

    // Process only likely JSON strings
    if (!str.startsWith('{') || !str.endsWith('}')) return

    const data = JSON.parse(str)
    console.log('Received todo operation:', data)

    // Act on received message type
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

// Update the peer count in UI
function updatePeerCountUI() {
  peerCountElement.textContent = peerCount
}


// -------------------
// Todo List Functions
// -------------------

// Add a new todo item
function addTodo(text,  source = 'local', id = Date.now()) {
  const todo = {
    id,
    text,
    completed: false
  }

  // Prevent duplicates
  if (todos.some(t => t.id === id)) return

  todos.push(todo)
  console.log(`📝 [${source.toUpperCase()}] Added ToDo:`, todo)
  renderTodos()

  // Broadcast change if locally added
  if (source === 'local') {
    const message = JSON.stringify({ type: 'add', text: todo.text, id: todo.id })
    broadcastToPeers(message)
  }
}

// Delete a todo by ID
function deleteTodo(id, source='local') {
  todos = todos.filter(todo => todo.id !== id)
  renderTodos()

  // Broadcast deletion if local
  if (source === 'local') {
    const message = JSON.stringify({ type: 'delete', id })
    broadcastToPeers(message)
  }
}

// Toggle the completion state of a todo
function toggleTodo(id, source='local') {
  todos = todos.map(todo => {
    if (todo.id === id) {
      return { ...todo, completed: !todo.completed }
    }
    return todo
  })

  renderTodos()

  // Broadcast toggle if local
  if (source === 'local') {
    const message = JSON.stringify({ type: 'toggle', id })
    broadcastToPeers(message)
  }
}

// Render the todo list UI
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


// ---------------------
// UI Event Listeners
// ---------------------

// Create Invite button listener
document.querySelector('#create-invite').addEventListener('click', createInvitation)

// Join form listener
document.querySelector('#join-form').addEventListener('submit', joinPeer)

// Close alert box
document.querySelector('#close-alert').addEventListener('click', () => {
  document.getElementById('output').classList.add('hidden')
})

// Todo form submit listener
document.querySelector('#todo-form').addEventListener('submit', (e) => {
  e.preventDefault()
  const input = document.querySelector('#todo-input', 'local')
  const text = input.value.trim()
  if (text) {
    addTodo(text, 'local')
    input.value = ''
  }
})


// --------------------------
// Peer Communication Helpers
// --------------------------

// Broadcast a message to all connected swarm peers
function broadcastToPeers(message) {
  for (const peer of swarm.connections) {
    try {
      peer.write(message)
    } catch (e) {
      console.error('Error sending to peer:', e)
    }
  }
}

// Make todo functions globally accessible
window.toggleTodo = toggleTodo
window.deleteTodo = deleteTodo


// --------------------------
// Create an Invitation Flow
// --------------------------

async function createInvitation() {
  const memberBPInstance = new BlindPairing(swarm, { poll: 5000 })

  // Handle new swarm connections
  swarm.on('connection', (peer) => {
    console.log('New peer connected')
    peer.on('data', data => handleTodoMessage(data.toString()))
    peer.on('error', e => console.error('Peer error:', e))
  })

  // Create a member to accept candidates
  const member = memberBPInstance.addMember({
    discoveryKey,
    async onadd(candidate) {
      console.log('candidate id is', candidate.inviteId)

      // Track the candidate
      connectedPeers.set(candidate.inviteId, candidate)

      candidate.open(publicKey)
      console.log('add candidate:', candidate.userData)
      candidate.confirm({ key: autobaseKey })

      console.log('✅ Connected Peers:', [...connectedPeers.keys()])

      peerCount++
      updatePeerCountUI()
    }
  })

  console.log('member is', member)
  console.log('Discovery Key', discoveryKey)

  await member.flushed()

  // Show invitation data in UI
  const data = {
    invite: invite.toString('hex'),
    publicKey: publicKey.toString('hex'),
    discoveryKey: discoveryKey.toString('hex')
  }

  const alertBox = document.getElementById('output')
  const alertText = document.getElementById('alert-text')

  alertText.innerHTML = '' // Clear previous output
  for (const [key, value] of Object.entries(data)) {
    alertText.innerHTML += `<div class="output-row">
      <span class="output-key">${key}</span>
      <span class="output-value" title="${value}">${value.slice(0, 80)}${value.length > 80 ? '...' : ''}</span>
      <button class="copy-button" onclick="navigator.clipboard.writeText('${value}')">Copy</button>
    </div>`
  }

  alertBox.classList.remove('hidden')
}


// --------------------------
// Join an Invitation Flow
// --------------------------

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

  // Handle new swarm connections
  swarm.on('connection', (peer) => {
    console.log('New peer connected')
    peer.on('data', data => handleTodoMessage(data.toString()))
    peer.on('error', e => console.error('Peer error:', e))
  })

  // Add candidate and pair
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

  console.time('paired')
  await connectingCandidate.pairing
  console.timeEnd('paired')
  console.log('paired:', connectingCandidate.paired)

  // Log final connected peers
  console.log('\n🔍 Final List of Connected Peers:', connectedMember, typeof(connectedMember))
  console.log('✅ Connected Peers:', [...connectedMember.keys()])
  for (const [id, peer] of connectedMember) {
    console.log(`• ID: ${id} | UserData: ${peer}`)
  }
}
