// Game constants
const BLOCK_SIZE = 50;
const GRAVITY = 0.5;
const JUMP_FORCE = 12;
const MOVE_SPEED = 5;

// Block types and mining times (in milliseconds)
const BLOCK_TYPES = {
    DIRT: {
        name: 'dirt',
        color: '#8B4513',
        strokeColor: '#654321',
        miningTime: 1000, // 1 second
    },
    WOOD: {
        name: 'wood',
        color: '#A0522D',
        strokeColor: '#8B4513',
        miningTime: 2000, // 2 seconds
    },
    STONE: {
        name: 'stone',
        color: '#808080',
        strokeColor: '#696969',
        miningTime: 3000, // 3 seconds
    }
};

// Tool types and mining speed multipliers for each material
const TOOLS = {
    HAND: {
        name: 'hand',
        displayName: 'Hand',
        icon: '✋',
        speedMultipliers: {
            dirt: 1.0,
            wood: 1.0,
            stone: 1.0
        },
        recipe: null // No recipe for hand - default tool
    },
    WOODEN_PICKAXE: {
        name: 'wooden_pickaxe',
        displayName: 'Wooden Pickaxe',
        icon: '⛏️',
        speedMultipliers: {
            dirt: 1.2,
            wood: 1.0,
            stone: 1.5
        },
        recipe: {
            wood: 3
        }
    },
    STONE_PICKAXE: {
        name: 'stone_pickaxe',
        displayName: 'Stone Pickaxe',
        icon: '⛏️',
        speedMultipliers: {
            dirt: 1.5,
            wood: 1.2,
            stone: 2.0
        },
        recipe: {
            wood: 2,
            stone: 3
        }
    },
    WOODEN_AXE: {
        name: 'wooden_axe',
        displayName: 'Wooden Axe',
        icon: '🪓',
        speedMultipliers: {
            dirt: 1.0,
            wood: 2.0,
            stone: 0.8
        },
        recipe: {
            wood: 3
        }
    },
    STONE_AXE: {
        name: 'stone_axe',
        displayName: 'Stone Axe',
        icon: '🪓',
        speedMultipliers: {
            dirt: 1.2,
            wood: 3.0,
            stone: 1.0
        },
        recipe: {
            wood: 2,
            stone: 3
        }
    },
    WOODEN_SHOVEL: {
        name: 'wooden_shovel',
        displayName: 'Wooden Shovel',
        icon: '🥄',
        speedMultipliers: {
            dirt: 2.0,
            wood: 0.8,
            stone: 0.5
        },
        recipe: {
            wood: 2
        }
    },
    STONE_SHOVEL: {
        name: 'stone_shovel',
        displayName: 'Stone Shovel',
        icon: '🥄',
        speedMultipliers: {
            dirt: 3.0,
            wood: 1.0,
            stone: 0.7
        },
        recipe: {
            wood: 1,
            stone: 2
        }
    }
};

// Get the canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Game state
const gameState = {
    inventory: {
        dirt: 10,
        wood: 5,
        stone: 3
    },
    currentlyMining: null,
    miningStartTime: 0,
    miningProgress: 0,
    selectedBlockType: 'dirt', // Default selected block type
    tools: ['hand'], // Start with just hands
    selectedTool: 'hand', // Default selected tool
    showCraftingMenu: false // Whether the crafting menu is visible
};

// Player class
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = BLOCK_SIZE - 10;
        this.height = BLOCK_SIZE - 10;
        this.velX = 0;
        this.velY = 0;
        this.isJumping = false;
        this.color = '#FF0000';
        this.facingDirection = 1; // 1 for right, -1 for left
    }

    update(blocks) {
        // Apply gravity
        this.velY += GRAVITY;
        
        // Apply horizontal movement
        this.x += this.velX;
        
        // Update facing direction
        if (this.velX > 0) this.facingDirection = 1;
        if (this.velX < 0) this.facingDirection = -1;
        
        // Check horizontal collisions
        this.checkHorizontalCollisions(blocks);
        
        // Apply vertical movement
        this.y += this.velY;
        
        // Check vertical collisions
        this.checkVerticalCollisions(blocks);
        
        // Keep player in bounds
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
        if (this.y < 0) {
            this.y = 0;
            this.velY = 0;
        }
        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.velY = 0;
            this.isJumping = false;
        }
    }
    
    checkHorizontalCollisions(blocks) {
        for (const block of blocks) {
            if (this.x + this.width > block.x &&
                this.x < block.x + block.width &&
                this.y + this.height > block.y &&
                this.y < block.y + block.height) {
                // Collision detected
                if (this.velX > 0) {
                    // Moving right
                    this.x = block.x - this.width;
                } else if (this.velX < 0) {
                    // Moving left
                    this.x = block.x + block.width;
                }
                this.velX = 0;
            }
        }
    }
    
    checkVerticalCollisions(blocks) {
        for (const block of blocks) {
            if (this.x + this.width > block.x &&
                this.x < block.x + block.width &&
                this.y + this.height > block.y &&
                this.y < block.y + block.height) {
                // Collision detected
                if (this.velY > 0) {
                    // Falling
                    this.y = block.y - this.height;
                    this.velY = 0;
                    this.isJumping = false;
                } else if (this.velY < 0) {
                    // Jumping
                    this.y = block.y + block.height;
                    this.velY = 0;
                }
            }
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    jump() {
        if (!this.isJumping) {
            this.velY = -JUMP_FORCE;
            this.isJumping = true;
        }
    }

    moveLeft() {
        this.velX = -MOVE_SPEED;
    }

    moveRight() {
        this.velX = MOVE_SPEED;
    }

    stopMoving() {
        this.velX = 0;
    }
    
    // Get the position to place or mine a block
    getTargetBlockPosition() {
        // Position in front of player based on facing direction
        const blockX = Math.floor((this.x + (this.facingDirection > 0 ? this.width + 5 : -BLOCK_SIZE - 5)) / BLOCK_SIZE) * BLOCK_SIZE;
        const blockY = Math.floor((this.y + this.height / 2) / BLOCK_SIZE) * BLOCK_SIZE;
        
        return { x: blockX, y: blockY };
    }
    
    // Check if there's a block at the target position
    getBlockAtTarget(blocks) {
        const pos = this.getTargetBlockPosition();
        for (let i = 0; i < blocks.length; i++) {
            if (blocks[i].x === pos.x && blocks[i].y === pos.y) {
                return { block: blocks[i], index: i };
            }
        }
        return null;
    }
}

// Block class
class Block {
    constructor(x, y, type = 'dirt') {
        this.x = x;
        this.y = y;
        this.width = BLOCK_SIZE;
        this.height = BLOCK_SIZE;
        this.type = type;
        
        // Set color and stroke based on block type
        const blockType = Object.values(BLOCK_TYPES).find(bt => bt.name === type);
        this.color = blockType ? blockType.color : BLOCK_TYPES.DIRT.color;
        this.strokeColor = blockType ? blockType.strokeColor : BLOCK_TYPES.DIRT.strokeColor;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Add a simple texture to the blocks
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.strokeRect(this.x + 10, this.y + 10, this.width - 20, this.height - 20);
    }
}

// Create player
const player = new Player(canvas.width / 2, 0);

// Create blocks (ground and some platforms)
const blocks = [];

// Create ground (dirt)
for (let x = 0; x < canvas.width; x += BLOCK_SIZE) {
    blocks.push(new Block(x, canvas.height - BLOCK_SIZE, 'dirt'));
}

// Add some platforms (wood and stone)
blocks.push(new Block(200, 400, 'wood'));
blocks.push(new Block(250, 400, 'wood'));
blocks.push(new Block(300, 400, 'wood'));

blocks.push(new Block(500, 300, 'stone'));
blocks.push(new Block(550, 300, 'stone'));

blocks.push(new Block(350, 200, 'dirt'));
blocks.push(new Block(400, 200, 'wood'));
blocks.push(new Block(450, 200, 'stone'));

// Handle keyboard input
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    
    // Jump only on initial key press (Space or ArrowUp)
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        player.jump();
    }
    
    // Place block with W key
    if (e.code === 'KeyW' && !keys.wasWPressed) {
        placeBlock();
        keys.wasWPressed = true;
    }
    
    // Mine block with E key
    if (e.code === 'KeyE' && !keys.wasEPressed) {
        startMining();
        keys.wasEPressed = true;
    }
    
    // Switch block types with 1, 2, 3 keys
    if (e.code === 'Digit1') {
        gameState.selectedBlockType = 'dirt';
    } else if (e.code === 'Digit2') {
        gameState.selectedBlockType = 'wood';
    } else if (e.code === 'Digit3') {
        gameState.selectedBlockType = 'stone';
    }
    
    // Toggle crafting menu with C key
    if (e.code === 'KeyC' && !keys.wasCPressed) {
        gameState.showCraftingMenu = !gameState.showCraftingMenu;
        keys.wasCPressed = true;
    }
    
    // Cycle through available tools with T key
    if (e.code === 'KeyT' && !keys.wasTPressed) {
        cycleTool();
        keys.wasTPressed = true;
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
    
    if (e.code === 'KeyW') {
        keys.wasWPressed = false;
    }
    
    if (e.code === 'KeyE') {
        keys.wasEPressed = false;
        cancelMining();
    }
    
    if (e.code === 'KeyC') {
        keys.wasCPressed = false;
    }
    
    if (e.code === 'KeyT') {
        keys.wasTPressed = false;
    }
});

// Mouse click for crafting menu
canvas.addEventListener('click', (e) => {
    if (gameState.showCraftingMenu) {
        handleCraftingClick(e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top);
    }
});

// Craft a tool
function craftTool(toolName) {
    const tool = Object.values(TOOLS).find(t => t.name === toolName);
    
    if (!tool || !tool.recipe) return false;
    
    // Check if we have enough materials
    for (const [material, amount] of Object.entries(tool.recipe)) {
        if (!gameState.inventory[material] || gameState.inventory[material] < amount) {
            return false;
        }
    }
    
    // Deduct materials
    for (const [material, amount] of Object.entries(tool.recipe)) {
        gameState.inventory[material] -= amount;
    }
    
    // Add tool to inventory if not already there
    if (!gameState.tools.includes(toolName)) {
        gameState.tools.push(toolName);
    }
    
    // Select the new tool
    gameState.selectedTool = toolName;
    
    return true;
}

// Cycle through available tools
function cycleTool() {
    const currentIndex = gameState.tools.indexOf(gameState.selectedTool);
    const nextIndex = (currentIndex + 1) % gameState.tools.length;
    gameState.selectedTool = gameState.tools[nextIndex];
}

// Handle clicking in the crafting menu
function handleCraftingClick(x, y) {
    const startY = 200;
    const itemHeight = 40;
    
    // Get all craftable tools
    const craftableTools = Object.values(TOOLS).filter(tool => tool.recipe !== null);
    
    for (let i = 0; i < craftableTools.length; i++) {
        const tool = craftableTools[i];
        const itemY = startY + i * itemHeight;
        
        if (x >= 220 && x <= 580 && y >= itemY && y <= itemY + itemHeight) {
            craftTool(tool.name);
            break;
        }
    }
}

// Place a block at the player's target position
function placeBlock() {
    const selectedType = gameState.selectedBlockType;
    if (gameState.inventory[selectedType] <= 0) return; // No blocks in inventory
    
    const pos = player.getTargetBlockPosition();
    
    // Check if there's already a block at this position
    for (const block of blocks) {
        if (block.x === pos.x && block.y === pos.y) {
            return; // Block already exists
        }
    }
    
    // Check if the position overlaps with the player
    if (
        pos.x < player.x + player.width &&
        pos.x + BLOCK_SIZE > player.x &&
        pos.y < player.y + player.height &&
        pos.y + BLOCK_SIZE > player.y
    ) {
        return; // Would overlap with player
    }
    
    // Place the block
    blocks.push(new Block(pos.x, pos.y, selectedType));
    gameState.inventory[selectedType]--; // Decrease inventory
}

// Start mining a block
function startMining() {
    // Get the block at target position
    const targetBlock = player.getBlockAtTarget(blocks);
    
    // If there's a block and it's not a ground block (to prevent destroying the floor)
    if (targetBlock && targetBlock.block.y < canvas.height - BLOCK_SIZE) {
        gameState.currentlyMining = targetBlock;
        gameState.miningStartTime = Date.now();
        gameState.miningProgress = 0;
    }
}

// Cancel mining
function cancelMining() {
    gameState.currentlyMining = null;
    gameState.miningProgress = 0;
}

// Continue mining progress
function updateMining() {
    if (!gameState.currentlyMining) return;
    
    const block = gameState.currentlyMining.block;
    const blockType = Object.values(BLOCK_TYPES).find(bt => bt.name === block.type);
    let miningTime = blockType ? blockType.miningTime : BLOCK_TYPES.DIRT.miningTime;
    
    // Get the current tool and its multiplier for this block type
    const tool = Object.values(TOOLS).find(t => t.name === gameState.selectedTool);
    if (tool && tool.speedMultipliers[block.type]) {
        // Apply the tool's speed multiplier (higher multiplier = faster mining)
        miningTime = miningTime / tool.speedMultipliers[block.type];
    }
    
    const now = Date.now();
    const elapsed = now - gameState.miningStartTime;
    gameState.miningProgress = elapsed / miningTime;
    
    // Mining completed
    if (gameState.miningProgress >= 1) {
        // Remove the block
        const blockType = gameState.currentlyMining.block.type;
        blocks.splice(gameState.currentlyMining.index, 1);
        // Add to inventory
        gameState.inventory[blockType]++;
        // Reset mining
        gameState.currentlyMining = null;
        gameState.miningProgress = 0;
    }
}

// Draw mining progress
function drawMiningProgress() {
    if (!gameState.currentlyMining) return;
    
    const block = gameState.currentlyMining.block;
    
    // Draw progress bar
    const progressWidth = BLOCK_SIZE * gameState.miningProgress;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(block.x, block.y - 10, progressWidth, 5);
    
    ctx.strokeStyle = '#000';
    ctx.strokeRect(block.x, block.y - 10, BLOCK_SIZE, 5);
}

// Draw inventory
function drawInventory() {
    const inventoryWidth = 180;
    const inventoryHeight = 120;
    const padding = 10;
    
    // Draw inventory background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, inventoryWidth, inventoryHeight);
    
    // Draw inventory title
    ctx.fillStyle = '#FFF';
    ctx.font = '16px Arial';
    ctx.fillText('Inventory:', 20, 30);
    
    // Draw mini block icons and counts
    const blockTypes = ['dirt', 'wood', 'stone'];
    const blockNames = ['Dirt', 'Wood', 'Stone'];
    const miniBlockSize = 20;
    
    for (let i = 0; i < blockTypes.length; i++) {
        const type = blockTypes[i];
        const y = 50 + i * 25;
        
        // Highlight selected block type
        if (type === gameState.selectedBlockType) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(15, y - 15, inventoryWidth - 10, 22);
        }
        
        // Draw mini block icon
        const blockType = Object.values(BLOCK_TYPES).find(bt => bt.name === type);
        ctx.fillStyle = blockType.color;
        ctx.fillRect(20, y - 15, miniBlockSize, miniBlockSize);
        ctx.strokeStyle = blockType.strokeColor;
        ctx.strokeRect(20, y - 15, miniBlockSize, miniBlockSize);
        
        // Draw block name and count
        ctx.fillStyle = '#FFF';
        ctx.font = '14px Arial';
        ctx.fillText(`${blockNames[i]}: ${gameState.inventory[type]}`, 50, y);
        
        // Draw key binding hint
        ctx.fillStyle = '#AAA';
        ctx.font = '12px Arial';
        ctx.fillText(`Key: ${i + 1}`, 130, y);
    }
}

// Draw tool information
function drawToolInfo() {
    const toolInfoWidth = 180;
    const toolInfoHeight = 60;
    
    // Draw tool info background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 140, toolInfoWidth, toolInfoHeight);
    
    // Draw title
    ctx.fillStyle = '#FFF';
    ctx.font = '16px Arial';
    ctx.fillText('Current Tool:', 20, 160);
    
    // Get current tool
    const tool = Object.values(TOOLS).find(t => t.name === gameState.selectedTool);
    
    if (tool) {
        // Draw tool name and icon
        ctx.fillStyle = '#FFF';
        ctx.font = '14px Arial';
        ctx.fillText(`${tool.icon} ${tool.displayName}`, 20, 185);
    }
}

// Draw controls help
function drawControls() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(canvas.width - 210, 10, 200, 130);
    
    ctx.fillStyle = '#FFF';
    ctx.font = '14px Arial';
    ctx.fillText('Controls:', canvas.width - 200, 30);
    ctx.fillText('Arrow/Space = Move & Jump', canvas.width - 200, 50);
    ctx.fillText('W = Place Block', canvas.width - 200, 70);
    ctx.fillText('E = Mine Block', canvas.width - 200, 90);
    ctx.fillText('1,2,3 = Select Block Type', canvas.width - 200, 110);
    ctx.fillText('T = Switch Tool, C = Crafting', canvas.width - 200, 130);
}

// Draw crafting menu
function drawCraftingMenu() {
    if (!gameState.showCraftingMenu) return;
    
    // Draw semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw menu title
    ctx.fillStyle = '#FFF';
    ctx.font = '24px Arial';
    ctx.fillText('Crafting Menu', canvas.width / 2 - 80, 150);
    
    // Draw available recipes
    const craftableTools = Object.values(TOOLS).filter(tool => tool.recipe !== null);
    
    ctx.font = '16px Arial';
    
    for (let i = 0; i < craftableTools.length; i++) {
        const tool = craftableTools[i];
        const y = 200 + i * 40;
        
        // Draw background
        ctx.fillStyle = gameState.tools.includes(tool.name) ? 'rgba(0, 100, 0, 0.5)' : 'rgba(50, 50, 50, 0.7)';
        ctx.fillRect(220, y, 360, 35);
        
        // Draw tool name and icon
        ctx.fillStyle = '#FFF';
        ctx.fillText(`${tool.icon} ${tool.displayName}`, 230, y + 22);
        
        // Draw recipe
        let recipeText = 'Requires: ';
        for (const [material, amount] of Object.entries(tool.recipe)) {
            const materialName = material.charAt(0).toUpperCase() + material.slice(1);
            recipeText += `${amount} ${materialName}, `;
        }
        recipeText = recipeText.slice(0, -2); // Remove trailing comma and space
        
        ctx.fillStyle = '#AAA';
        ctx.font = '14px Arial';
        ctx.fillText(recipeText, 350, y + 22);
        
        // Draw "Crafted" indicator if the player has this tool
        if (gameState.tools.includes(tool.name)) {
            ctx.fillStyle = '#0F0';
            ctx.fillText('✓ Crafted', 520, y + 22);
        }
        // Draw "Can Craft" indicator if the player has the materials
        else {
            let canCraft = true;
            for (const [material, amount] of Object.entries(tool.recipe)) {
                if (!gameState.inventory[material] || gameState.inventory[material] < amount) {
                    canCraft = false;
                    break;
                }
            }
            
            if (canCraft) {
                ctx.fillStyle = '#0F0';
                ctx.fillText('Can Craft - Click!', 490, y + 22);
            } else {
                ctx.fillStyle = '#F00';
                ctx.fillText('Not enough materials', 480, y + 22);
            }
        }
    }
    
    // Draw close instructions
    ctx.fillStyle = '#FFF';
    ctx.font = '16px Arial';
    ctx.fillText('Press C to close', canvas.width / 2 - 60, canvas.height - 50);
}

// Game loop
function gameLoop() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Handle player movement
    if (keys['ArrowLeft'] || keys['KeyA']) {
        player.moveLeft();
    } else if (keys['ArrowRight'] || keys['KeyD']) {
        player.moveRight();
    } else {
        player.stopMoving();
    }
    
    // Update mining progress
    updateMining();
    
    // Update player
    player.update(blocks);
    
    // Draw blocks
    for (const block of blocks) {
        block.draw();
    }
    
    // Draw player
    player.draw();
    
    // Draw mining progress
    drawMiningProgress();
    
    // Draw UI
    drawInventory();
    drawToolInfo();
    drawControls();
    
    // Draw crafting menu on top (if visible)
    drawCraftingMenu();
    
    // Keep the loop going
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop(); 