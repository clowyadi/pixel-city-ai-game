// Pixel City AI Agents - Game Engine
// Phase 1: Basic Simulation

class PixelCityGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 400;
        this.tileSize = 16;
        
        // Game state
        this.day = 1;
        this.time = 480; // 8:00 AM in minutes
        this.paused = false;
        this.speed = 1;
        this.frameCount = 0;
        
        // Resources
        this.resources = {
            wood: 100,
            food: 150,
            houses: 0
        };
        
        // Agents
        this.agents = [];
        this.maxAgents = 10;
        
        // Map
        this.map = [];
        this.mapWidth = Math.floor(this.canvas.width / this.tileSize);
        this.mapHeight = Math.floor(this.canvas.height / this.tileSize);
        
        // Initialize
        this.initMap();
        this.createInitialAgents();
        this.setupUI();
        this.gameLoop();
    }
    
    initMap() {
        // Create simple terrain
        for (let y = 0; y < this.mapHeight; y++) {
            this.map[y] = [];
            for (let x = 0; x < this.mapWidth; x++) {
                // Grass (70%), trees (20%), water (10%)
                let rand = Math.random();
                if (rand < 0.1) {
                    this.map[y][x] = { type: 'water', color: '#4361ee' };
                } else if (rand < 0.3) {
                    this.map[y][x] = { type: 'tree', color: '#2d6a4f', wood: 5 };
                } else {
                    this.map[y][x] = { type: 'grass', color: '#4ade80' };
                }
            }
        }
    }
    
    createInitialAgents() {
        const names = ['Alex', 'Sam', 'Taylor', 'Jordan', 'Casey', 'Riley', 'Quinn', 'Morgan', 'Drew', 'Blake'];
        const jobs = ['Builder', 'Gatherer', 'Farmer'];
        
        for (let i = 0; i < 5; i++) {
            this.agents.push({
                id: i,
                name: names[i],
                job: jobs[Math.floor(Math.random() * jobs.length)],
                x: Math.floor(Math.random() * this.mapWidth),
                y: Math.floor(Math.random() * this.mapHeight),
                color: this.getRandomColor(),
                energy: 100,
                hunger: 30,
                status: 'Exploring',
                target: null,
                memory: []
            });
        }
    }
    
    getRandomColor() {
        const colors = ['#f72585', '#7209b7', '#3a0ca3', '#4361ee', '#4cc9f0', '#ff9e00', '#ff5400'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    setupUI() {
        // Speed controls
        document.getElementById('speed1x').addEventListener('click', () => {
            this.speed = 1;
            this.updateButtonStates();
        });
        
        document.getElementById('speed2x').addEventListener('click', () => {
            this.speed = 2;
            this.updateButtonStates();
        });
        
        // Pause/play
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.paused = !this.paused;
            document.getElementById('pauseBtn').textContent = this.paused ? '▶️ Play' : '⏸️ Pause';
        });
        
        // Add agent
        document.getElementById('addAgentBtn').addEventListener('click', () => {
            if (this.agents.length < this.maxAgents) {
                this.addNewAgent();
            }
        });
        
        this.updateButtonStates();
    }
    
    updateButtonStates() {
        document.getElementById('speed1x').style.background = this.speed === 1 ? '#3ab8df' : '#4cc9f0';
        document.getElementById('speed2x').style.background = this.speed === 2 ? '#3ab8df' : '#4cc9f0';
    }
    
    addNewAgent() {
        const names = ['Avery', 'Cameron', 'Emerson', 'Finley', 'Harley', 'Peyton', 'Rowan', 'Sawyer', 'Skyler'];
        const jobs = ['Builder', 'Gatherer', 'Farmer'];
        
        this.agents.push({
            id: this.agents.length,
            name: names[Math.floor(Math.random() * names.length)],
            job: jobs[Math.floor(Math.random() * jobs.length)],
            x: Math.floor(Math.random() * this.mapWidth),
            y: Math.floor(Math.random() * this.mapHeight),
            color: this.getRandomColor(),
            energy: 100,
            hunger: 30,
            status: 'Arriving',
            target: null,
            memory: []
        });
    }
    
    updateAgents() {
        // Slow down agent updates - only update every 4 frames
        if (this.frameCount % 4 !== 0) return;
        
        this.agents.forEach(agent => {
            if (this.paused) return;
            
            // Basic needs (slowed down)
            agent.hunger += 0.025; // Reduced from 0.1
            agent.energy -= 0.0125; // Reduced from 0.05
            
            if (agent.hunger > 80) {
                agent.status = 'Hungry';
                this.findFood(agent);
            } else if (agent.energy < 30) {
                agent.status = 'Tired';
                this.rest(agent);
            } else {
                // Job-based behavior
                switch(agent.job) {
                    case 'Builder':
                        this.builderBehavior(agent);
                        break;
                    case 'Gatherer':
                        this.gathererBehavior(agent);
                        break;
                    case 'Farmer':
                        this.farmerBehavior(agent);
                        break;
                    default:
                        this.exploreBehavior(agent);
                }
            }
            
            // Move randomly if no target
            if (!agent.target && Math.random() < 0.3) {
                this.moveRandomly(agent);
            }
            
            // Update position if moving to target
            if (agent.target) {
                this.moveToTarget(agent);
            }
            
            // Keep within bounds
            agent.x = Math.max(0, Math.min(this.mapWidth - 1, agent.x));
            agent.y = Math.max(0, Math.min(this.mapHeight - 1, agent.y));
        });
    }
    
    findFood(agent) {
        // Simple food finding - just move to grass
        const grassTiles = [];
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                if (this.map[y][x].type === 'grass') {
                    grassTiles.push({x, y});
                }
            }
        }
        
        if (grassTiles.length > 0) {
            const target = grassTiles[Math.floor(Math.random() * grassTiles.length)];
            agent.target = target;
            agent.status = 'Finding food';
        }
    }
    
    rest(agent) {
        // Rest increases energy
        agent.energy += 0.5;
        if (agent.energy >= 80) {
            agent.status = 'Rested';
            agent.target = null;
        }
    }
    
    builderBehavior(agent) {
        if (this.resources.wood >= 20 && this.resources.houses < 5) {
            // Try to build a house
            agent.status = 'Building house';
            this.resources.wood -= 1;
            if (Math.random() < 0.1) {
                this.resources.houses++;
                agent.status = 'Built house!';
            }
        } else {
            agent.status = 'Gathering wood';
            this.gatherWood(agent);
        }
    }
    
    gathererBehavior(agent) {
        agent.status = 'Gathering resources';
        this.gatherWood(agent);
    }
    
    farmerBehavior(agent) {
        agent.status = 'Farming';
        if (Math.random() < 0.05) {
            this.resources.food += 5;
        }
    }
    
    exploreBehavior(agent) {
        agent.status = 'Exploring';
        if (!agent.target) {
            this.moveRandomly(agent);
        }
    }
    
    gatherWood(agent) {
        // Check current tile for wood
        const tile = this.map[Math.floor(agent.y)][Math.floor(agent.x)];
        if (tile.type === 'tree' && tile.wood > 0) {
            tile.wood--;
            this.resources.wood++;
            if (tile.wood <= 0) {
                tile.type = 'grass';
                tile.color = '#4ade80';
            }
        } else {
            // Find nearest tree
            for (let y = 0; y < this.mapHeight; y++) {
                for (let x = 0; x < this.mapWidth; x++) {
                    if (this.map[y][x].type === 'tree') {
                        agent.target = {x, y};
                        agent.status = 'Going to tree';
                        return;
                    }
                }
            }
        }
    }
    
    moveRandomly(agent) {
        const dx = Math.floor(Math.random() * 3) - 1;
        const dy = Math.floor(Math.random() * 3) - 1;
        agent.x += dx;
        agent.y += dy;
    }
    
    moveToTarget(agent) {
        if (!agent.target) return;
        
        const dx = agent.target.x - agent.x;
        const dy = agent.target.y - agent.y;
        
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
            // Reached target
            agent.target = null;
            return;
        }
        
        // Move toward target
        agent.x += Math.sign(dx) * 0.5;
        agent.y += Math.sign(dy) * 0.5;
    }
    
    updateTime() {
        if (this.paused) return;
        
        // Slow down time progression - update every 4 frames
        if (this.frameCount % 4 === 0) {
            this.time += this.speed;
            if (this.time >= 1440) { // 24 hours
                this.time = 0;
                this.day++;
                
                // Daily resource consumption
                this.resources.food -= this.agents.length * 2;
                if (this.resources.food < 0) this.resources.food = 0;
            }
        }
    }
    
    drawMap() {
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const tile = this.map[y][x];
                this.ctx.fillStyle = tile.color;
                this.ctx.fillRect(
                    x * this.tileSize,
                    y * this.tileSize,
                    this.tileSize,
                    this.tileSize
                );
                
                // Draw tree details
                if (tile.type === 'tree') {
                    this.ctx.fillStyle = '#1b4332';
                    this.ctx.fillRect(
                        x * this.tileSize + 4,
                        y * this.tileSize + 2,
                        8,
                        12
                    );
                }
                
                // Draw water waves
                if (tile.type === 'water') {
                    this.ctx.fillStyle = '#4895ef';
                    this.ctx.fillRect(
                        x * this.tileSize + 2,
                        y * this.tileSize + 2,
                        4,
                        4
                    );
                }
            }
        }
    }
    
    drawAgents() {
        this.agents.forEach(agent => {
            // Draw agent body
            this.ctx.fillStyle = agent.color;
            this.ctx.fillRect(
                agent.x * this.tileSize,
                agent.y * this.tileSize,
                this.tileSize,
                this.tileSize
            );
            
            // Draw agent eyes
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(
                agent.x * this.tileSize + 3,
                agent.y * this.tileSize + 3,
                3,
                3
            );
            this.ctx.fillRect(
                agent.x * this.tileSize + 10,
                agent.y * this.tileSize + 3,
                3,
                3
            );
            
            // Draw status indicator
            if (agent.hunger > 70) {
                this.ctx.fillStyle = '#ff0000';
                this.ctx.fillRect(
                    agent.x * this.tileSize + 6,
                    agent.y * this.tileSize - 3,
                    4,
                    2
                );
            }
        });
    }
    
    drawHouses() {
        // Simple house drawing
        for (let i = 0; i < this.resources.houses; i++) {
            const x = 5 + (i % 3) * 4;
            const y = 5 + Math.floor(i / 3) * 4;
            
            this.ctx.fillStyle = '#8d99ae';
            this.ctx.fillRect(
                x * this.tileSize,
                y * this.tileSize,
                this.tileSize * 2,
                this.tileSize * 2
            );
            
            // Roof
            this.ctx.fillStyle = '#6c757d';
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.tileSize, y * this.tileSize);
            this.ctx.lineTo((x + 1) * this.tileSize, (y - 1) * this.tileSize);
            this.ctx.lineTo((x + 2) * this.tileSize, y * this.tileSize);
            this.ctx.fill();
            
            // Door
            this.ctx.fillStyle = '#5a189a';
            this.ctx.fillRect(
                (x + 0.7) * this.tileSize,
                (y + 1.2) * this.tileSize,
                6,
                10
            );
        }
    }
    
    updateUI() {
        // Update stats
        document.getElementById('population').textContent = this.agents.length;
        document.getElementById('houses').textContent = this.resources.houses;
        document.getElementById('wood').textContent = Math.floor(this.resources.wood);
        document.getElementById('food').textContent = Math.floor(this.resources.food);
        
        // Update time
        const hours = Math.floor(this.time / 60);
        const minutes = this.time % 60;
        document.getElementById('timeDisplay').textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        document.getElementById('dayCount').textContent = this.day;
        
        // Update agents list
        const agentsContainer = document.getElementById('agentsContainer');
        agentsContainer.innerHTML = '';
        
        this.agents.forEach(agent => {
            const agentEl = document.createElement('div');
            agentEl.className = 'agent-item';
            agentEl.innerHTML = `
                <div class="agent-name">${agent.name} (${agent.job})</div>
                <div class="agent-status">${agent.status} | 🍖${Math.floor(agent.hunger)}% | ⚡${Math.floor(agent.energy)}%</div>
            `;
            agentsContainer.appendChild(agentEl);
        });
    }
    
    gameLoop() {
        // Increment frame counter
        this.frameCount++;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update game state
        this.updateTime();
        this.updateAgents();
        
        // Draw everything
        this.drawMap();
        this.drawHouses();
        this.drawAgents();
        
        // Update UI
        this.updateUI();
        
        // Continue loop with frame rate control
        setTimeout(() => {
            requestAnimationFrame(() => this.gameLoop());
        }, 1000 / 30); // 30 FPS instead of 60
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    const game = new PixelCityGame();
    console.log('Pixel City AI Agents game started!');
    
    // Make game accessible for debugging
    window.game = game;
});