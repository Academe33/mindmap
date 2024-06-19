let zoomLevel = 1.0;
let selectedNode = null;
let nodeCount = 1;
let dragStartX = 0;
let dragStartY = 0;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let isNodeDragging = false;
let nodeDragOffsetX = 0;
let nodeDragOffsetY = 0;

// Função para centralizar o nó principal na tela ao iniciar
function centerMainNode() {
  const mindmapContainer = document.getElementById('mindmap-container');
  const centralNode = document.getElementById('central-node');

  // Calcula as coordenadas para centralizar o nó principal
  const centerX = (mindmapContainer.offsetWidth - centralNode.offsetWidth) / 2;
  const centerY = (mindmapContainer.offsetHeight - centralNode.offsetHeight) / 2;

  // Define a posição do nó central
  centralNode.style.left = centerX + 'px';
  centralNode.style.top = centerY + 'px';
}

// Função para aplicar zoom
function applyZoom() {
  const nodes = document.querySelectorAll('.node');
  nodes.forEach(node => {
    node.style.transform = `scale(${zoomLevel})`;
  });

  updateLines(); // Atualiza as linhas ao aplicar zoom
}

// Função para tornar um elemento arrastável
function makeDraggable(element) {
  element.onmousedown = function(event) {
    if (event.target !== element) return; // Evita arrastar ao clicar em elementos internos

    isNodeDragging = true;
    nodeDragOffsetX = event.clientX - element.offsetLeft;
    nodeDragOffsetY = event.clientY - element.offsetTop;

    // Seleciona o nó ao iniciar o arrasto
    selectNode(element);
  }

  element.onmouseup = function(event) {
    isNodeDragging = false;
  }

  element.onmousemove = function(event) {
    if (isNodeDragging) {
      element.style.left = event.clientX - nodeDragOffsetX + 'px';
      element.style.top = event.clientY - nodeDragOffsetY + 'px';
      updateLines();
    }
  }
}

// Função para criar uma linha entre dois nós
function createLine(startNode, endNode) {
  const linesContainer = document.getElementById('lines-container');
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');

  line.setAttribute('x1', startNode.offsetLeft + startNode.offsetWidth / 2);
  line.setAttribute('y1', startNode.offsetTop + startNode.offsetHeight / 2);
  line.setAttribute('x2', endNode.offsetLeft + endNode.offsetWidth / 2);
  line.setAttribute('y2', endNode.offsetTop + endNode.offsetHeight / 2);
  line.setAttribute('stroke', 'black');
  line.setAttribute('stroke-width', '2');

  linesContainer.appendChild(line);
  line.startNode = startNode;
  line.endNode = endNode;
}

// Função para atualizar as linhas entre os nós
function updateLines() {
  const lines = document.getElementById('lines-container').querySelectorAll('line');
  lines.forEach(line => {
    const startNode = line.startNode;
    const endNode = line.endNode;

    if (startNode && endNode) {
      line.setAttribute('x1', startNode.offsetLeft + startNode.offsetWidth / 2);
      line.setAttribute('y1', startNode.offsetTop + startNode.offsetHeight / 2);
      line.setAttribute('x2', endNode.offsetLeft + endNode.offsetWidth / 2);
      line.setAttribute('y2', endNode.offsetTop + endNode.offsetHeight / 2);
    }
  });
}

// Função para adicionar um novo nó filho
function addChildNode() {
  if (!selectedNode) {
    alert('Por favor, selecione um nó para adicionar um subnó.');
    return;
  }

  const newNode = document.createElement('div');
  newNode.className = 'node';
  newNode.id = 'node-' + nodeCount;
  newNode.innerText = 'Subnó ' + nodeCount;
  newNode.style.left = selectedNode.offsetLeft + selectedNode.offsetWidth + 'px';
  newNode.style.top = selectedNode.offsetTop + 'px';

  document.getElementById('mindmap-container').appendChild(newNode);

  makeDraggable(newNode);
  newNode.onclick = () => selectNode(newNode);
  newNode.ondblclick = () => editNodeName(newNode);
  createLine(selectedNode, newNode);

  nodeCount++;
}

// Função para deletar o nó selecionado
function deleteSelectedNode() {
  if (!selectedNode) {
    alert('Por favor, selecione um nó para deletar.');
    return;
  }

  const nodeId = selectedNode.id;
  const lines = document.getElementById('lines-container').querySelectorAll('line');

  lines.forEach(line => {
    if (line.startNode === selectedNode || line.endNode === selectedNode) {
      line.parentNode.removeChild(line);
    }
  });

  selectedNode.parentNode.removeChild(selectedNode);
  selectedNode = null;
}

// Função para selecionar um nó
function selectNode(node) {
  if (selectedNode) {
    selectedNode.classList.remove('selected');
  }
  selectedNode = node;
  selectedNode.classList.add('selected');
}

// Função para editar o nome do nó
function editNodeName(node) {
  const currentText = node.innerText;
  const input = document.createElement('input');
  input.type = 'text';
  input.value = currentText;
  input.style.width = node.offsetWidth + 'px';

  input.onblur = () => {
    node.innerText = input.value;
    node.ondblclick = () => editNodeName(node);
  }

  input.onkeydown = (event) => {
    if (event.key === 'Enter') {
      input.blur();
    }
  }

  node.innerText = '';
  node.appendChild(input);
  input.focus();
}

// Inicializa o nó central na tela
centerMainNode();

// Torna o nó central arrastável, selecionável e editável
const centralNode = document.getElementById('central-node');
makeDraggable(centralNode);
centralNode.onclick = () => selectNode(centralNode);
centralNode.ondblclick = () => editNodeName(centralNode);

// Inicializa as posições originais dos nós
const nodes = document.querySelectorAll('.node');
nodes.forEach(node => {
  node.dataset.originalLeft = node.offsetLeft;
  node.dataset.originalTop = node.offsetTop;
});

// Habilita o pan (arrastar) do mapa ao clicar na área vazia
const mindmapContainer = document.getElementById('mindmap-container');
mindmapContainer.onmousedown = function(event) {
  if (event.target === mindmapContainer) {
    isDragging = true;
    dragStartX = event.clientX - offsetX;
    dragStartY = event.clientY - offsetY;
  }
}

mindmapContainer.onmouseup = function(event) {
  isDragging = false;
}

mindmapContainer.onmousemove = function(event) {
  if (isDragging) {
    offsetX = event.clientX - dragStartX;
    offsetY = event.clientY - dragStartY;
    mindmapContainer.style.left = offsetX + 'px';
    mindmapContainer.style.top = offsetY + 'px';
  }
}
